-- =========================================================================
-- ANNULUS AUTOMATIONS - PRODUCTION-GRADE DATABASE SCHEMA
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Existing Objects (for local testing/re-run capability)
DROP TABLE IF EXISTS public.meetings CASCADE;
DROP TABLE IF EXISTS public.replies CASCADE;
DROP TABLE IF EXISTS public.emails CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TYPE IF EXISTS public.member_role CASCADE;
DROP TYPE IF EXISTS public.campaign_status CASCADE;
DROP TYPE IF EXISTS public.lead_status CASCADE;
DROP TYPE IF EXISTS public.email_status CASCADE;
DROP TYPE IF EXISTS public.email_direction CASCADE;
DROP TYPE IF EXISTS public.meeting_status CASCADE;

-- 3. Enum Declarations
CREATE TYPE public.member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE public.lead_status AS ENUM ('lead', 'contacted', 'replied', 'meeting_scheduled', 'unsubscribed');
CREATE TYPE public.email_status AS ENUM ('sent', 'opened', 'clicked', 'bounced');
CREATE TYPE public.email_direction AS ENUM ('outbound', 'inbound');
CREATE TYPE public.meeting_status AS ENUM ('scheduled', 'completed', 'canceled', 'no_show');

-- 4. Organizations (Tenants) Table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for routing slugs
CREATE INDEX idx_organizations_slug ON public.organizations(slug);

-- 5. Organization Members (RBAC Junction Table)
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.member_role DEFAULT 'member'::public.member_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_organization_members_user ON public.organization_members(user_id);
CREATE INDEX idx_organization_members_org ON public.organization_members(organization_id);

-- 6. Campaigns Table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status public.campaign_status DEFAULT 'draft'::public.campaign_status NOT NULL,
    subject_lines TEXT[] NOT NULL DEFAULT '{}',
    body_templates TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_campaigns_org ON public.campaigns(organization_id);

-- 7. Leads Table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    website VARCHAR(255),
    status public.lead_status DEFAULT 'lead'::public.lead_status NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(organization_id, email)
);

CREATE INDEX idx_leads_org_status ON public.leads(organization_id, status);

-- 8. Emails Table (Message Logs)
CREATE TABLE public.emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status public.email_status DEFAULT 'sent'::public.email_status NOT NULL,
    direction public.email_direction DEFAULT 'outbound'::public.email_direction NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_emails_org ON public.emails(organization_id);
CREATE INDEX idx_emails_lead ON public.emails(lead_id);

-- 9. Replies Table
CREATE TABLE public.replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    sentiment VARCHAR(50),
    detected_intent TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_replies_org ON public.replies(organization_id);

-- 10. Meetings Table
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status public.meeting_status DEFAULT 'scheduled'::public.meeting_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_meetings_org ON public.meetings(organization_id);

-- =========================================================================
-- TRIGGERS: AUTOMATED UPDATE STAMPS
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organization_members_updated_at BEFORE UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & ENFORCEMENT
-- =========================================================================

-- Enable RLS across all models
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Helper security function (Checks active membership in target organization)
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.organization_members 
        WHERE organization_members.organization_id = org_id 
          AND organization_members.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql;

-- 1. Organizations Policies
CREATE POLICY "Select Organizations: membership required"
    ON public.organizations FOR SELECT USING (public.is_org_member(id));

CREATE POLICY "Insert Organizations: allow all"
    ON public.organizations FOR INSERT TO public WITH CHECK (true);

-- 2. Organization Members Policies
CREATE POLICY "Select Member Roster: membership required"
    ON public.organization_members FOR SELECT USING (public.is_org_member(organization_id));

CREATE POLICY "Insert Member Roster: allow all"
    ON public.organization_members FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Modify Members: owner level authorization required"
    ON public.organization_members FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_members.organization_id = organization_members.organization_id
              AND organization_members.user_id = auth.uid()
              AND organization_members.role = 'owner'::public.member_role
        )
    );

-- 3. Campaigns Policies
CREATE POLICY "Campaign Operations: membership required"
    ON public.campaigns FOR ALL USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));

-- 4. Leads Policies
CREATE POLICY "Lead Operations: membership required"
    ON public.leads FOR ALL USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));

-- 5. Emails Policies
CREATE POLICY "Email Operations: membership required"
    ON public.emails FOR ALL USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));

-- 6. Replies Policies
CREATE POLICY "Reply Operations: membership required"
    ON public.replies FOR ALL USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));

-- 7. Meetings Policies
CREATE POLICY "Meeting Operations: membership required"
    ON public.meetings FOR ALL USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));

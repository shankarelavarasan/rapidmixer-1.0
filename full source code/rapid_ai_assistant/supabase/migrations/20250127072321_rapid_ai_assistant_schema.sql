-- Rapid AI Assistant Database Schema
        -- This migration creates the complete schema for the AI assistant application

        -- 1. Custom Types
        CREATE TYPE public.user_role AS ENUM ('admin', 'premium', 'standard');
        CREATE TYPE public.project_status AS ENUM ('draft', 'processing', 'completed', 'failed', 'exported');
        CREATE TYPE public.file_status AS ENUM ('uploading', 'uploaded', 'processing', 'completed', 'failed');
        CREATE TYPE public.template_category AS ENUM ('document', 'presentation', 'spreadsheet', 'code', 'other');
        CREATE TYPE public.export_format AS ENUM ('pdf', 'docx', 'xlsx', 'pptx', 'html', 'json', 'csv');

        -- 2. Core Tables

        -- User Profiles (intermediary for auth.users)
        CREATE TABLE public.user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            role public.user_role DEFAULT 'standard'::public.user_role,
            avatar_url TEXT,
            usage_quota_gb INTEGER DEFAULT 5,
            used_storage_gb DECIMAL(10,2) DEFAULT 0,
            api_calls_this_month INTEGER DEFAULT 0,
            api_calls_limit INTEGER DEFAULT 1000,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        -- Projects
        CREATE TABLE public.projects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            status public.project_status DEFAULT 'draft'::public.project_status,
            ai_model TEXT DEFAULT 'gpt-4',
            custom_prompt TEXT,
            processing_started_at TIMESTAMPTZ,
            processing_completed_at TIMESTAMPTZ,
            error_message TEXT,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        -- Project Files
        CREATE TABLE public.project_files (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
            user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
            file_name TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size_mb DECIMAL(10,2) NOT NULL,
            file_url TEXT NOT NULL,
            status public.file_status DEFAULT 'uploading'::public.file_status,
            processing_progress INTEGER DEFAULT 0,
            extracted_text TEXT,
            ai_analysis JSONB,
            error_message TEXT,
            uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMPTZ
        );

        -- Templates
        CREATE TABLE public.templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            category public.template_category DEFAULT 'document'::public.template_category,
            template_data JSONB NOT NULL,
            is_public BOOLEAN DEFAULT false,
            download_count INTEGER DEFAULT 0,
            rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
            tags TEXT[] DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        -- Export History
        CREATE TABLE public.export_history (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
            user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
            file_name TEXT NOT NULL,
            export_format public.export_format NOT NULL,
            file_url TEXT,
            file_size_mb DECIMAL(10,2),
            export_settings JSONB DEFAULT '{}',
            exported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        -- Activity Log
        CREATE TABLE public.activity_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
            project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
            action_type TEXT NOT NULL,
            action_description TEXT NOT NULL,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        -- 3. Indexes for Performance
        CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
        CREATE INDEX idx_projects_user_id ON public.projects(user_id);
        CREATE INDEX idx_projects_status ON public.projects(status);
        CREATE INDEX idx_project_files_project_id ON public.project_files(project_id);
        CREATE INDEX idx_project_files_user_id ON public.project_files(user_id);
        CREATE INDEX idx_project_files_status ON public.project_files(status);
        CREATE INDEX idx_templates_user_id ON public.templates(user_id);
        CREATE INDEX idx_templates_category ON public.templates(category);
        CREATE INDEX idx_templates_public ON public.templates(is_public);
        CREATE INDEX idx_export_history_user_id ON public.export_history(user_id);
        CREATE INDEX idx_export_history_project_id ON public.export_history(project_id);
        CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
        CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at);

        -- 4. Row Level Security
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

        -- 5. Helper Functions for RLS
        CREATE OR REPLACE FUNCTION public.is_project_owner(project_uuid UUID)
        RETURNS BOOLEAN
        LANGUAGE sql
        STABLE
        SECURITY DEFINER
        AS $$
        SELECT EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_uuid AND p.user_id = auth.uid()
        )
        $$;

        CREATE OR REPLACE FUNCTION public.is_admin_user()
        RETURNS BOOLEAN
        LANGUAGE sql
        STABLE
        SECURITY DEFINER
        AS $$
        SELECT EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
        )
        $$;

        CREATE OR REPLACE FUNCTION public.can_access_template(template_uuid UUID)
        RETURNS BOOLEAN
        LANGUAGE sql
        STABLE
        SECURITY DEFINER
        AS $$
        SELECT EXISTS (
            SELECT 1 FROM public.templates t
            WHERE t.id = template_uuid AND (
                t.user_id = auth.uid() OR
                t.is_public = true OR
                public.is_admin_user()
            )
        )
        $$;

        -- 6. RLS Policies
        CREATE POLICY "users_own_profile" ON public.user_profiles FOR ALL
        USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

        CREATE POLICY "users_manage_own_projects" ON public.projects FOR ALL
        USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "users_manage_own_files" ON public.project_files FOR ALL
        USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "template_access_control" ON public.templates FOR SELECT
        USING (public.can_access_template(id));

        CREATE POLICY "users_manage_own_templates" ON public.templates
        FOR INSERT, UPDATE, DELETE
        USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "users_view_own_exports" ON public.export_history FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY "users_create_exports" ON public.export_history FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "users_view_own_activity" ON public.activity_log FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY "users_create_activity" ON public.activity_log FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        -- 7. Functions for User Profile Management
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER
        SECURITY DEFINER
        LANGUAGE plpgsql
        AS $$
        BEGIN
          INSERT INTO public.user_profiles (id, email, full_name, role)
          VALUES (
            NEW.id, 
            NEW.email, 
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'role', 'standard')::public.user_role
          );
          RETURN NEW;
        END;
        $$;

        -- Trigger for automatic profile creation
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

        -- 8. Functions for Activity Logging
        CREATE OR REPLACE FUNCTION public.log_user_activity(
            action_type TEXT,
            action_description TEXT,
            project_uuid UUID DEFAULT NULL,
            metadata_json JSONB DEFAULT '{}'
        )
        RETURNS UUID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
            activity_id UUID;
        BEGIN
            INSERT INTO public.activity_log (user_id, project_id, action_type, action_description, metadata)
            VALUES (auth.uid(), project_uuid, action_type, action_description, metadata_json)
            RETURNING id INTO activity_id;
            
            RETURN activity_id;
        END;
        $$;

        -- 9. Mock Data for Development
        DO $$
        DECLARE
            admin_uuid UUID := gen_random_uuid();
            user_uuid UUID := gen_random_uuid();
            project1_uuid UUID := gen_random_uuid();
            project2_uuid UUID := gen_random_uuid();
            template1_uuid UUID := gen_random_uuid();
        BEGIN
            -- Create auth users with required fields
            INSERT INTO auth.users (
                id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
                created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
                is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
                recovery_token, recovery_sent_at, email_change_token_new, email_change,
                email_change_sent_at, email_change_token_current, email_change_confirm_status,
                reauthentication_token, reauthentication_sent_at, phone, phone_change,
                phone_change_token, phone_change_sent_at
            ) VALUES
                (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
                 'admin@rapidai.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
                 '{"full_name": "Admin User", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
                 false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
                (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
                 'user@rapidai.com', crypt('user123', gen_salt('bf', 10)), now(), now(), now(),
                 '{"full_name": "Demo User", "role": "premium"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
                 false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

            -- Create sample projects
            INSERT INTO public.projects (id, user_id, name, description, status, ai_model) VALUES
                (project1_uuid, admin_uuid, 'Marketing Campaign Analysis', 'AI-powered analysis of marketing campaign performance data', 'completed'::public.project_status, 'gpt-4'),
                (project2_uuid, user_uuid, 'Financial Report Processing', 'Automated processing and insights from quarterly financial reports', 'processing'::public.project_status, 'claude-3');

            -- Create sample project files
            INSERT INTO public.project_files (project_id, user_id, file_name, file_type, file_size_mb, file_url, status) VALUES
                (project1_uuid, admin_uuid, 'campaign_data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 2.5, '/uploads/campaign_data.xlsx', 'completed'::public.file_status),
                (project2_uuid, user_uuid, 'q4_report.pdf', 'application/pdf', 5.2, '/uploads/q4_report.pdf', 'processing'::public.file_status);

            -- Create sample templates
            INSERT INTO public.templates (id, user_id, name, description, category, template_data, is_public, tags) VALUES
                (template1_uuid, admin_uuid, 'Executive Summary Template', 'Professional template for executive summaries', 'document'::public.template_category, '{"sections": ["overview", "key_findings", "recommendations"]}'::jsonb, true, ARRAY['business', 'professional', 'summary']);

            -- Create sample export history
            INSERT INTO public.export_history (project_id, user_id, file_name, export_format, file_size_mb) VALUES
                (project1_uuid, admin_uuid, 'campaign_analysis_report.pdf', 'pdf'::public.export_format, 1.8),
                (project1_uuid, admin_uuid, 'campaign_data_processed.xlsx', 'xlsx'::public.export_format, 3.2);

            -- Create sample activity log
            INSERT INTO public.activity_log (user_id, project_id, action_type, action_description) VALUES
                (admin_uuid, project1_uuid, 'project_created', 'Created new project: Marketing Campaign Analysis'),
                (admin_uuid, project1_uuid, 'file_uploaded', 'Uploaded file: campaign_data.xlsx'),
                (admin_uuid, project1_uuid, 'ai_processing_completed', 'AI analysis completed successfully'),
                (user_uuid, project2_uuid, 'project_created', 'Created new project: Financial Report Processing'),
                (user_uuid, project2_uuid, 'file_uploaded', 'Uploaded file: q4_report.pdf');

        EXCEPTION
            WHEN foreign_key_violation THEN
                RAISE NOTICE 'Foreign key error: %', SQLERRM;
            WHEN unique_violation THEN
                RAISE NOTICE 'Unique constraint error: %', SQLERRM;
            WHEN OTHERS THEN
                RAISE NOTICE 'Unexpected error: %', SQLERRM;
        END $$;
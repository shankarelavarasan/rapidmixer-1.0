import { supabase } from './supabase';

        class ProjectService {
          // Get all projects for the current user
          async getUserProjects() {
            try {
              const { data, error } = await supabase
                .from('projects')
                .select(`
                  id,
                  name,
                  description,
                  status,
                  ai_model,
                  created_at,
                  updated_at,
                  processing_started_at,
                  processing_completed_at,
                  project_files(id, file_name, file_type, file_size_mb, status)
                `)
                .order('created_at', { ascending: false });

              if (error) {
                return { success: false, error: error.message };
              }

              return { success: true, data };
            } catch (error) {
              if (error?.message?.includes('Failed to fetch') || 
                  error?.message?.includes('NetworkError')) {
                return { 
                  success: false, 
                  error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
                };
              }
              return { success: false, error: 'Failed to load projects' };
            }
          }

          // Create a new project
          async createProject(projectData) {
            try {
              const { data, error } = await supabase
                .from('projects')
                .insert({
                  name: projectData.name,
                  description: projectData.description,
                  ai_model: projectData.aiModel || 'gpt-4',
                  custom_prompt: projectData.customPrompt,
                  status: 'draft'
                })
                .select()
                .single();

              if (error) {
                return { success: false, error: error.message };
              }

              // Log activity
              await this.logActivity('project_created', `Created new project: ${projectData.name}`, data.id);

              return { success: true, data };
            } catch (error) {
              return { success: false, error: 'Failed to create project' };
            }
          }

          // Update project
          async updateProject(projectId, updates) {
            try {
              const { data, error } = await supabase
                .from('projects')
                .update({
                  ...updates,
                  updated_at: new Date().toISOString()
                })
                .eq('id', projectId)
                .select()
                .single();

              if (error) {
                return { success: false, error: error.message };
              }

              return { success: true, data };
            } catch (error) {
              return { success: false, error: 'Failed to update project' };
            }
          }

          // Delete project
          async deleteProject(projectId) {
            try {
              const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

              if (error) {
                return { success: false, error: error.message };
              }

              return { success: true };
            } catch (error) {
              return { success: false, error: 'Failed to delete project' };
            }
          }

          // Get project statistics
          async getProjectStats() {
            try {
              const { data, error } = await supabase
                .from('projects')
                .select('status')
                .neq('status', null);

              if (error) {
                return { success: false, error: error.message };
              }

              const stats = {
                total: data.length,
                draft: data.filter(p => p.status === 'draft').length,
                processing: data.filter(p => p.status === 'processing').length,
                completed: data.filter(p => p.status === 'completed').length,
                failed: data.filter(p => p.status === 'failed').length
              };

              return { success: true, data: stats };
            } catch (error) {
              return { success: false, error: 'Failed to load project statistics' };
            }
          }

          // Log user activity
          async logActivity(actionType, actionDescription, projectId = null, metadata = {}) {
            try {
              const { error } = await supabase.rpc('log_user_activity', {
                action_type: actionType,
                action_description: actionDescription,
                project_uuid: projectId,
                metadata_json: metadata
              });

              if (error) {
                console.log('Failed to log activity:', error.message);
              }
            } catch (error) {
              console.log('Activity logging error:', error);
            }
          }

          // Get recent activity
          async getRecentActivity(limit = 10) {
            try {
              const { data, error } = await supabase
                .from('activity_log')
                .select(`
                  id,
                  action_type,
                  action_description,
                  created_at,
                  projects(name)
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

              if (error) {
                return { success: false, error: error.message };
              }

              return { success: true, data };
            } catch (error) {
              return { success: false, error: 'Failed to load recent activity' };
            }
          }

          // Real-time subscription for project updates
          subscribeToProjectUpdates(callback) {
            const subscription = supabase
              .channel('projects')
              .on(
                'postgres_changes',
                { 
                  event: '*', 
                  schema: 'public', 
                  table: 'projects',
                  filter: `user_id=eq.${supabase.auth.getUser()?.data?.user?.id}`
                },
                callback
              )
              .subscribe();

            return subscription;
          }

          // Unsubscribe from real-time updates
          unsubscribeFromUpdates(subscription) {
            if (subscription) {
              supabase.removeChannel(subscription);
            }
          }
        }

        export default new ProjectService();
import { supabase } from './supabase';

        class FileService {
          // Upload file to Supabase Storage
          async uploadFile(file, projectId) {
            try {
              const fileExt = file.name.split('.').pop();
              const fileName = `${projectId}/${Date.now()}_${file.name}`;
              const filePath = `project-files/${fileName}`;

              // Upload file to storage
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('project-files')
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: false
                });

              if (uploadError) {
                return { success: false, error: uploadError.message };
              }

              // Get public URL
              const { data: { publicUrl } } = supabase.storage
                .from('project-files')
                .getPublicUrl(filePath);

              // Save file record to database
              const { data: fileRecord, error: dbError } = await supabase
                .from('project_files')
                .insert({
                  project_id: projectId,
                  file_name: file.name,
                  file_type: file.type,
                  file_size_mb: (file.size / (1024 * 1024)).toFixed(2),
                  file_url: publicUrl,
                  status: 'uploaded'
                })
                .select()
                .single();

              if (dbError) {
                // Clean up uploaded file if database insert fails
                await supabase.storage
                  .from('project-files')
                  .remove([filePath]);
                return { success: false, error: dbError.message };
              }

              return { success: true, data: fileRecord };
            } catch (error) {
              return { success: false, error: 'Failed to upload file' };
            }
          }

          // Get files for a project
          async getProjectFiles(projectId) {
            try {
              const { data, error } = await supabase
                .from('project_files')
                .select('*')
                .eq('project_id', projectId)
                .order('uploaded_at', { ascending: false });

              if (error) {
                return { success: false, error: error.message };
              }

              return { success: true, data };
            } catch (error) {
              return { success: false, error: 'Failed to load project files' };
            }
          }

          // Update file processing status
          async updateFileStatus(fileId, status, progress = null, extractedText = null, aiAnalysis = null) {
            try {
              const updates = {
                status,
                updated_at: new Date().toISOString()
              };

              if (progress !== null) updates.processing_progress = progress;
              if (extractedText) updates.extracted_text = extractedText;
              if (aiAnalysis) updates.ai_analysis = aiAnalysis;
              if (status === 'completed') updates.processed_at = new Date().toISOString();

              const { data, error } = await supabase
                .from('project_files')
                .update(updates)
                .eq('id', fileId)
                .select()
                .single();

              if (error) {
                return { success: false, error: error.message };
              }

              return { success: true, data };
            } catch (error) {
              return { success: false, error: 'Failed to update file status' };
            }
          }

          // Delete file
          async deleteFile(fileId) {
            try {
              // Get file info first
              const { data: fileInfo, error: fetchError } = await supabase
                .from('project_files')
                .select('file_url')
                .eq('id', fileId)
                .single();

              if (fetchError) {
                return { success: false, error: fetchError.message };
              }

              // Extract file path from URL
              const urlParts = fileInfo.file_url.split('/');
              const fileName = urlParts[urlParts.length - 1];
              const projectPath = urlParts[urlParts.length - 2];
              const filePath = `project-files/${projectPath}/${fileName}`;

              // Delete from storage
              const { error: storageError } = await supabase.storage
                .from('project-files')
                .remove([filePath]);

              if (storageError) {
                console.log('Storage deletion error:', storageError.message);
                // Continue with database deletion even if storage fails
              }

              // Delete from database
              const { error: dbError } = await supabase
                .from('project_files')
                .delete()
                .eq('id', fileId);

              if (dbError) {
                return { success: false, error: dbError.message };
              }

              return { success: true };
            } catch (error) {
              return { success: false, error: 'Failed to delete file' };
            }
          }

          // Get file processing statistics
          async getFileStats() {
            try {
              const { data, error } = await supabase
                .from('project_files')
                .select('status, file_size_mb');

              if (error) {
                return { success: false, error: error.message };
              }

              const stats = {
                total: data.length,
                uploading: data.filter(f => f.status === 'uploading').length,
                uploaded: data.filter(f => f.status === 'uploaded').length,
                processing: data.filter(f => f.status === 'processing').length,
                completed: data.filter(f => f.status === 'completed').length,
                failed: data.filter(f => f.status === 'failed').length,
                totalSizeMB: data.reduce((sum, f) => sum + parseFloat(f.file_size_mb || 0), 0)
              };

              return { success: true, data: stats };
            } catch (error) {
              return { success: false, error: 'Failed to load file statistics' };
            }
          }

          // Real-time subscription for file updates
          subscribeToFileUpdates(projectId, callback) {
            const subscription = supabase
              .channel(`project-files-${projectId}`)
              .on(
                'postgres_changes',
                { 
                  event: '*', 
                  schema: 'public', 
                  table: 'project_files',
                  filter: `project_id=eq.${projectId}`
                },
                callback
              )
              .subscribe();

            return subscription;
          }

          // Unsubscribe from file updates
          unsubscribeFromFileUpdates(subscription) {
            if (subscription) {
              supabase.removeChannel(subscription);
            }
          }
        }

        export default new FileService();
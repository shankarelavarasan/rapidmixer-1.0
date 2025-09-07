import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/upload_provider.dart';
import '../providers/theme_provider.dart';
import '../models/upload_job.dart';
import '../utils/constants.dart';
import '../theme/app_theme.dart';
import '../utils/utils.dart' as UtilsHelper;

class UploadHistory extends StatefulWidget {
  const UploadHistory({super.key});

  @override
  State<UploadHistory> createState() => _UploadHistoryState();
}

class _UploadHistoryState extends State<UploadHistory>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  
  String _sortBy = 'date';
  bool _sortAscending = false;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      duration: AppConstants.mediumAnimationDuration,
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<UploadProvider>(
      builder: (context, uploadProvider, child) {
        final history = _getSortedHistory(uploadProvider.uploadHistory);
        
        if (history.isEmpty) {
          return _buildEmptyState(context);
        }

        return FadeTransition(
          opacity: _fadeAnimation,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with controls
              _buildHeader(context, history.length),
              
              const SizedBox(height: Spacing.lg),
              
              // History List
              _buildHistoryList(context, history),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context, int totalCount) {
    final theme = Theme.of(context);
    
    return Row(
      children: [
        Expanded(
          child: Text(
            '$totalCount ${totalCount == 1 ? 'Upload' : 'Uploads'}',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
        
        // Sort Controls
        _buildSortControls(context),
      ],
    );
  }

  Widget _buildSortControls(BuildContext context) {
    final theme = Theme.of(context);
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'Sort by:',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        
        const SizedBox(width: Spacing.sm),
        
        DropdownButton<String>(
          value: _sortBy,
          underline: const SizedBox.shrink(),
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurface,
          ),
          items: const [
            DropdownMenuItem(
              value: 'date',
              child: Text('Date'),
            ),
            DropdownMenuItem(
              value: 'name',
              child: Text('Name'),
            ),
            DropdownMenuItem(
              value: 'size',
              child: Text('Size'),
            ),
            DropdownMenuItem(
              value: 'status',
              child: Text('Status'),
            ),
          ],
          onChanged: (value) {
            if (value != null) {
              setState(() {
                _sortBy = value;
              });
            }
          },
        ),
        
        const SizedBox(width: Spacing.xs),
        
        IconButton(
          onPressed: () {
            setState(() {
              _sortAscending = !_sortAscending;
            });
          },
          icon: Icon(
            _sortAscending ? Icons.arrow_upward : Icons.arrow_downward,
            size: 16,
          ),
          tooltip: _sortAscending ? 'Sort Ascending' : 'Sort Descending',
        ),
      ],
    );
  }

  Widget _buildHistoryList(BuildContext context, List<UploadJob> history) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: history.length,
      separatorBuilder: (context, index) => const SizedBox(height: Spacing.md),
      itemBuilder: (context, index) {
        final job = history[index];
        return _buildHistoryItem(context, job, index);
      },
    );
  }

  Widget _buildHistoryItem(BuildContext context, UploadJob job, int index) {
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>();
    
    return TweenAnimationBuilder<double>(
      duration: Duration(milliseconds: 300 + (index * 100)),
      tween: Tween(begin: 0.0, end: 1.0),
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Card(
        elevation: 2,
        child: InkWell(
          onTap: () => _showJobDetails(context, job),
          borderRadius: BorderRadius.circular(BorderRadii.md),
          child: Padding(
            padding: const EdgeInsets.all(Spacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row
                Row(
                  children: [
                    // File Icon
                    Container(
                      padding: const EdgeInsets.all(Spacing.sm),
                      decoration: BoxDecoration(
                        color: _getStatusColor(job.status, theme).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(BorderRadii.sm),
                      ),
                      child: Icon(
                        Icons.video_file,
                        color: _getStatusColor(job.status, theme),
                        size: 20,
                      ),
                    ),
                    
                    const SizedBox(width: Spacing.md),
                    
                    // File Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            job.fileName,
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          
                          const SizedBox(height: Spacing.xs),
                          
                          Row(
                            children: [
                              Text(
                                UtilsHelper.Utils.formatFileSize(job.fileSize),
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                              
                              const SizedBox(width: Spacing.sm),
                              
                              Text(
                                '•',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                              
                              const SizedBox(width: Spacing.sm),
                              
                              Text(
                                UtilsHelper.Utils.formatDateTime(job.createdAt),
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    
                    // Status Badge
                    _buildStatusBadge(context, job.status),
                  ],
                ),
                
                const SizedBox(height: Spacing.md),
                
                // Progress Bar (for active jobs)
                if (job.isProcessing)
                  Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            job.currentStage?.name ?? 'Processing...',
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            '${(job.overallProgress * 100).toInt()}%',
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: Spacing.xs),
                      
                      ClipRRect(
                        borderRadius: BorderRadius.circular(BorderRadii.xs),
                        child: LinearProgressIndicator(
                          value: job.overallProgress,
                          backgroundColor: theme.colorScheme.surfaceContainerHighest,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _getStatusColor(job.status, theme),
                          ),
                          minHeight: 4,
                        ),
                      ),
                      
                      const SizedBox(height: Spacing.sm),
                    ],
                  ),
                
                // Action Buttons
                _buildActionButtons(context, job),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BuildContext context, UploadStatus status) {
    final theme = Theme.of(context);
    final color = _getStatusColor(status, theme);
    
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: Spacing.sm,
        vertical: Spacing.xs,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(BorderRadii.round),
        border: Border.all(
          color: color,
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getStatusIcon(status),
            size: 12,
            color: color,
          ),
          const SizedBox(width: Spacing.xs),
          Text(
            _getStatusText(status),
            style: theme.textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, UploadJob job) {
    final theme = Theme.of(context);
    
    return Row(
      children: [
        // View Details
        TextButton.icon(
          onPressed: () => _showJobDetails(context, job),
          icon: const Icon(Icons.info_outline, size: 16),
          label: const Text('Details'),
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(
              horizontal: Spacing.sm,
              vertical: Spacing.xs,
            ),
          ),
        ),
        
        const SizedBox(width: Spacing.sm),
        
        // Download (if completed)
        if (job.isSuccessful)
          TextButton.icon(
            onPressed: () => _downloadResult(context, job),
            icon: const Icon(Icons.download, size: 16),
            label: const Text('Download'),
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(
                horizontal: Spacing.sm,
                vertical: Spacing.xs,
              ),
            ),
          ),
        
        // Retry (if failed)
        if (job.isFailed)
          TextButton.icon(
            onPressed: () => _retryJob(context, job),
            icon: const Icon(Icons.refresh, size: 16),
            label: const Text('Retry'),
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(
                horizontal: Spacing.sm,
                vertical: Spacing.xs,
              ),
            ),
          ),
        
        const Spacer(),
        
        // Delete
        IconButton(
          onPressed: () => _deleteJob(context, job),
          icon: const Icon(Icons.delete_outline, size: 16),
          tooltip: 'Delete',
          style: IconButton.styleFrom(
            foregroundColor: theme.colorScheme.error,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.all(Spacing.xxl),
      child: Column(
        children: [
          Icon(
            Icons.history,
            size: 64,
            color: theme.colorScheme.onSurfaceVariant.withOpacity(0.5),
          ),
          
          const SizedBox(height: Spacing.lg),
          
          Text(
            'No Upload History',
            style: theme.textTheme.titleLarge?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          
          const SizedBox(height: Spacing.sm),
          
          Text(
            'Your uploaded videos will appear here',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  List<UploadJob> _getSortedHistory(List<UploadJob> history) {
    final sortedHistory = List<UploadJob>.from(history);
    
    sortedHistory.sort((a, b) {
      int comparison;
      
      switch (_sortBy) {
        case 'name':
          comparison = a.fileName.compareTo(b.fileName);
          break;
        case 'size':
          comparison = a.fileSize.compareTo(b.fileSize);
          break;
        case 'status':
          comparison = a.status.index.compareTo(b.status.index);
          break;
        case 'date':
        default:
          comparison = a.createdAt.compareTo(b.createdAt);
          break;
      }
      
      return _sortAscending ? comparison : -comparison;
    });
    
    return sortedHistory;
  }

  Color _getStatusColor(UploadStatus status, ThemeData theme) {
    final themeProvider = context.read<ThemeProvider>();
    
    switch (status) {
      case UploadStatus.uploading:
      case UploadStatus.processing:
        return theme.colorScheme.primary;
      case UploadStatus.completed:
        return themeProvider.currentThemeColors['success']!;
      case UploadStatus.failed:
        return theme.colorScheme.error;
      default:
        return theme.colorScheme.onSurfaceVariant;
    }
  }

  IconData _getStatusIcon(UploadStatus status) {
    switch (status) {
      case UploadStatus.uploading:
        return Icons.cloud_upload;
      case UploadStatus.processing:
        return Icons.auto_awesome;
      case UploadStatus.completed:
        return Icons.check_circle;
      case UploadStatus.failed:
        return Icons.error;
      default:
        return Icons.hourglass_empty;
    }
  }

  String _getStatusText(UploadStatus status) {
    switch (status) {
      case UploadStatus.uploading:
        return 'Uploading';
      case UploadStatus.processing:
        return 'Processing';
      case UploadStatus.completed:
        return 'Completed';
      case UploadStatus.failed:
        return 'Failed';
      default:
        return 'Pending';
    }
  }

  void _showJobDetails(BuildContext context, UploadJob job) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Upload Details'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDetailRow('File Name', job.fileName),
              _buildDetailRow('File Size', UtilsHelper.Utils.formatFileSize(job.fileSize)),
              _buildDetailRow('Status', job.statusDisplayName),
              _buildDetailRow('Created', UtilsHelper.Utils.formatDateTime(job.createdAt)),
              if (job.completedAt != null)
                _buildDetailRow('Completed', UtilsHelper.Utils.formatDateTime(job.completedAt!)),
              if (job.processingDuration != null)
                _buildDetailRow('Processing Time', UtilsHelper.Utils.formatDuration(job.processingDuration!)),
              if (job.errorMessage != null)
                _buildDetailRow('Error', job.errorMessage!),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    final theme = Theme.of(context);
    
    return Padding(
      padding: const EdgeInsets.only(bottom: Spacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodySmall,
            ),
          ),
        ],
      ),
    );
  }

  void _downloadResult(BuildContext context, UploadJob job) {
    // TODO: Implement download functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Download started: ${job.fileName}'),
        action: SnackBarAction(
          label: 'Open',
          onPressed: () {
            // TODO: Open download URL
          },
        ),
      ),
    );
  }

  void _retryJob(BuildContext context, UploadJob job) {
    final uploadProvider = context.read<UploadProvider>();
    uploadProvider.retryJob(job.id);
  }

  void _deleteJob(BuildContext context, UploadJob job) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Upload'),
        content: Text(
          'Are you sure you want to delete "${job.fileName}"? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              final uploadProvider = context.read<UploadProvider>();
              uploadProvider.deleteJob(job.id);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
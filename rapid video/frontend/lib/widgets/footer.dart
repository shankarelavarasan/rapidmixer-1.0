import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../utils/constants.dart';
import '../theme/app_theme.dart';

class Footer extends StatefulWidget {
  const Footer({super.key});

  @override
  State<Footer> createState() => _FooterState();
}

class _FooterState extends State<Footer>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

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
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>();
    
    return FadeTransition(
      opacity: _fadeAnimation,
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          border: Border(
            top: BorderSide(
              color: theme.colorScheme.outline.withOpacity(0.1),
              width: 1,
            ),
          ),
        ),
        child: Column(
          children: [
            // Main Footer Content
            _buildMainFooter(context),
            
            // Copyright Bar
            _buildCopyrightBar(context),
          ],
        ),
      ),
    );
  }

  Widget _buildMainFooter(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: Spacing.xl,
        vertical: Spacing.xxl,
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isDesktop = Breakpoints.isDesktop(context);
          
          if (isDesktop) {
            return _buildDesktopFooter(context);
          } else {
            return _buildMobileFooter(context);
          }
        },
      ),
    );
  }

  Widget _buildDesktopFooter(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Company Info
        Expanded(
          flex: 2,
          child: _buildCompanyInfo(context),
        ),
        
        const SizedBox(width: Spacing.xxl),
        
        // Quick Links
        Expanded(
          child: _buildQuickLinks(context),
        ),
        
        const SizedBox(width: Spacing.xxl),
        
        // Support
        Expanded(
          child: _buildSupport(context),
        ),
        
        const SizedBox(width: Spacing.xxl),
        
        // Social Links
        Expanded(
          child: _buildSocialLinks(context),
        ),
      ],
    );
  }

  Widget _buildMobileFooter(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Company Info
        _buildCompanyInfo(context),
        
        const SizedBox(height: Spacing.xl),
        
        // Links Grid
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildQuickLinks(context),
            ),
            const SizedBox(width: Spacing.lg),
            Expanded(
              child: _buildSupport(context),
            ),
          ],
        ),
        
        const SizedBox(height: Spacing.xl),
        
        // Social Links
        _buildSocialLinks(context),
      ],
    );
  }

  Widget _buildCompanyInfo(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Logo and Name
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary,
                    theme.colorScheme.secondary,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(BorderRadii.sm),
              ),
              child: Icon(
                Icons.video_library,
                color: theme.colorScheme.onPrimary,
                size: 20,
              ),
            ),
            
            const SizedBox(width: Spacing.sm),
            
            Text(
              AppConstants.appName,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ],
        ),
        
        const SizedBox(height: Spacing.md),
        
        // Description
        Text(
          'Transform your videos with the power of AI. Fast, reliable, and professional video processing for creators worldwide.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
            height: 1.5,
          ),
        ),
        
        const SizedBox(height: Spacing.lg),
        
        // Contact Info
        _buildContactInfo(context),
      ],
    );
  }

  Widget _buildContactInfo(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildContactItem(
          context,
          Icons.email_outlined,
          'support@rapidvideo.ai',
        ),
        const SizedBox(height: Spacing.xs),
        _buildContactItem(
          context,
          Icons.language,
          'www.rapidvideo.ai',
        ),
      ],
    );
  }

  Widget _buildContactItem(BuildContext context, IconData icon, String text) {
    final theme = Theme.of(context);
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 16,
          color: theme.colorScheme.onSurfaceVariant,
        ),
        const SizedBox(width: Spacing.sm),
        Text(
          text,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildQuickLinks(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Links',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
          ),
        ),
        
        const SizedBox(height: Spacing.md),
        
        ..._getQuickLinks().map((link) => _buildFooterLink(context, link)),
      ],
    );
  }

  Widget _buildSupport(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Support',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
          ),
        ),
        
        const SizedBox(height: Spacing.md),
        
        ..._getSupportLinks().map((link) => _buildFooterLink(context, link)),
      ],
    );
  }

  Widget _buildSocialLinks(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Follow Us',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
          ),
        ),
        
        const SizedBox(height: Spacing.md),
        
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildSocialButton(context, Icons.facebook, 'Facebook'),
            const SizedBox(width: Spacing.sm),
            _buildSocialButton(context, Icons.alternate_email, 'Twitter'),
            const SizedBox(width: Spacing.sm),
            _buildSocialButton(context, Icons.video_library, 'YouTube'),
            const SizedBox(width: Spacing.sm),
            _buildSocialButton(context, Icons.code, 'GitHub'),
          ],
        ),
      ],
    );
  }

  Widget _buildFooterLink(BuildContext context, FooterLink link) {
    final theme = Theme.of(context);
    
    return Padding(
      padding: const EdgeInsets.only(bottom: Spacing.sm),
      child: InkWell(
        onTap: link.onTap,
        borderRadius: BorderRadius.circular(BorderRadii.xs),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            vertical: Spacing.xs,
            horizontal: Spacing.xs,
          ),
          child: Text(
            link.title,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSocialButton(BuildContext context, IconData icon, String tooltip) {
    final theme = Theme.of(context);
    
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: () {
          // TODO: Open social media links
        },
        borderRadius: BorderRadius.circular(BorderRadii.round),
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(BorderRadii.round),
          ),
          child: Icon(
            icon,
            size: 20,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ),
    );
  }

  Widget _buildCopyrightBar(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: Spacing.xl,
        vertical: Spacing.md,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isDesktop = Breakpoints.isDesktop(context);
          
          if (isDesktop) {
            return Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildCopyrightText(context),
                _buildLegalLinks(context),
              ],
            );
          } else {
            return Column(
              children: [
                _buildCopyrightText(context),
                const SizedBox(height: Spacing.sm),
                _buildLegalLinks(context),
              ],
            );
          }
        },
      ),
    );
  }

  Widget _buildCopyrightText(BuildContext context) {
    final theme = Theme.of(context);
    
    return Text(
      '© ${DateTime.now().year} ${AppConstants.appName}. All rights reserved.',
      style: theme.textTheme.bodySmall?.copyWith(
        color: theme.colorScheme.onSurfaceVariant,
      ),
    );
  }

  Widget _buildLegalLinks(BuildContext context) {
    final theme = Theme.of(context);
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        InkWell(
          onTap: () {
            // TODO: Show privacy policy
          },
          child: Text(
            'Privacy Policy',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
        
        const SizedBox(width: Spacing.md),
        
        Text(
          '•',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        
        const SizedBox(width: Spacing.md),
        
        InkWell(
          onTap: () {
            // TODO: Show terms of service
          },
          child: Text(
            'Terms of Service',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      ],
    );
  }

  List<FooterLink> _getQuickLinks() {
    return [
      FooterLink(
        title: 'Home',
        onTap: () {
          // TODO: Navigate to home
        },
      ),
      FooterLink(
        title: 'Features',
        onTap: () {
          // TODO: Navigate to features
        },
      ),
      FooterLink(
        title: 'Pricing',
        onTap: () {
          // TODO: Navigate to pricing
        },
      ),
      FooterLink(
        title: 'Gallery',
        onTap: () {
          // TODO: Navigate to gallery
        },
      ),
    ];
  }

  List<FooterLink> _getSupportLinks() {
    return [
      FooterLink(
        title: 'Help Center',
        onTap: () {
          // TODO: Open help center
        },
      ),
      FooterLink(
        title: 'Contact Us',
        onTap: () {
          // TODO: Open contact form
        },
      ),
      FooterLink(
        title: 'API Documentation',
        onTap: () {
          // TODO: Open API docs
        },
      ),
      FooterLink(
        title: 'Status',
        onTap: () {
          // TODO: Open status page
        },
      ),
    ];
  }
}

class FooterLink {
  final String title;
  final VoidCallback onTap;

  const FooterLink({
    required this.title,
    required this.onTap,
  });
}
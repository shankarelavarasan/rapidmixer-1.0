import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../utils/constants.dart';
import '../theme/app_theme.dart';

class AppHeader extends StatefulWidget {
  const AppHeader({super.key});

  @override
  State<AppHeader> createState() => _AppHeaderState();
}

class _AppHeaderState extends State<AppHeader>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
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

    _slideAnimation = Tween<double>(
      begin: -50.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));

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
    
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _slideAnimation.value),
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: Spacing.xl,
                vertical: Spacing.lg,
              ),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                border: Border(
                  bottom: BorderSide(
                    color: theme.colorScheme.outline.withOpacity(0.1),
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                children: [
                  // Logo and Title
                  _buildLogo(context),
                  
                  const Spacer(),
                  
                  // Navigation Items
                  if (Breakpoints.isDesktop(context))
                    _buildDesktopNavigation(context),
                  
                  // Theme Toggle
                  _buildThemeToggle(context),
                  
                  // Mobile Menu
                  if (!Breakpoints.isDesktop(context))
                    _buildMobileMenu(context),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLogo(BuildContext context) {
    final theme = Theme.of(context);
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Logo Icon
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                theme.colorScheme.primary,
                theme.colorScheme.secondary,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(BorderRadii.md),
          ),
          child: Icon(
            Icons.video_library,
            color: theme.colorScheme.onPrimary,
            size: 24,
          ),
        ),
        
        const SizedBox(width: Spacing.md),
        
        // App Title
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              AppConstants.appName,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            Text(
              'AI Video Processing',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDesktopNavigation(BuildContext context) {
    final theme = Theme.of(context);
    
    return Row(
      children: [
        _buildNavItem(context, 'Home', Icons.home, true),
        const SizedBox(width: Spacing.lg),
        _buildNavItem(context, 'Gallery', Icons.photo_library, false),
        const SizedBox(width: Spacing.lg),
        _buildNavItem(context, 'Settings', Icons.settings, false),
        const SizedBox(width: Spacing.lg),
        _buildNavItem(context, 'Help', Icons.help_outline, false),
      ],
    );
  }

  Widget _buildNavItem(BuildContext context, String label, IconData icon, bool isActive) {
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>();
    
    return InkWell(
      onTap: () {
        // TODO: Implement navigation
      },
      borderRadius: BorderRadius.circular(BorderRadii.sm),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: Spacing.md,
          vertical: Spacing.sm,
        ),
        decoration: BoxDecoration(
          color: isActive 
              ? theme.colorScheme.primary.withOpacity(0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(BorderRadii.sm),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 18,
              color: isActive 
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(width: Spacing.xs),
            Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: isActive 
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurfaceVariant,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeToggle(BuildContext context) {
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>();
    
    return Container(
      margin: const EdgeInsets.only(left: Spacing.lg),
      child: PopupMenuButton<ThemeMode>(
        icon: Icon(
          themeProvider.isDarkMode 
              ? Icons.dark_mode 
              : Icons.light_mode,
          color: theme.colorScheme.onSurfaceVariant,
        ),
        tooltip: 'Theme',
        onSelected: (ThemeMode mode) {
          themeProvider.setThemeMode(mode);
        },
        itemBuilder: (context) => [
          PopupMenuItem(
            value: ThemeMode.system,
            child: Row(
              children: [
                Icon(
                  Icons.brightness_auto,
                  size: 18,
                  color: themeProvider.themeMode == ThemeMode.system
                      ? theme.colorScheme.primary
                      : theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: Spacing.sm),
                Text(
                  'System',
                  style: TextStyle(
                    color: themeProvider.themeMode == ThemeMode.system
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
          PopupMenuItem(
            value: ThemeMode.light,
            child: Row(
              children: [
                Icon(
                  Icons.light_mode,
                  size: 18,
                  color: themeProvider.themeMode == ThemeMode.light
                      ? theme.colorScheme.primary
                      : theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: Spacing.sm),
                Text(
                  'Light',
                  style: TextStyle(
                    color: themeProvider.themeMode == ThemeMode.light
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
          PopupMenuItem(
            value: ThemeMode.dark,
            child: Row(
              children: [
                Icon(
                  Icons.dark_mode,
                  size: 18,
                  color: themeProvider.themeMode == ThemeMode.dark
                      ? theme.colorScheme.primary
                      : theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: Spacing.sm),
                Text(
                  'Dark',
                  style: TextStyle(
                    color: themeProvider.themeMode == ThemeMode.dark
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileMenu(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      margin: const EdgeInsets.only(left: Spacing.md),
      child: PopupMenuButton<String>(
        icon: Icon(
          Icons.menu,
          color: theme.colorScheme.onSurfaceVariant,
        ),
        tooltip: 'Menu',
        onSelected: (String value) {
          // TODO: Implement navigation
        },
        itemBuilder: (context) => [
          const PopupMenuItem(
            value: 'home',
            child: ListTile(
              leading: Icon(Icons.home),
              title: Text('Home'),
              dense: true,
            ),
          ),
          const PopupMenuItem(
            value: 'gallery',
            child: ListTile(
              leading: Icon(Icons.photo_library),
              title: Text('Gallery'),
              dense: true,
            ),
          ),
          const PopupMenuItem(
            value: 'settings',
            child: ListTile(
              leading: Icon(Icons.settings),
              title: Text('Settings'),
              dense: true,
            ),
          ),
          const PopupMenuItem(
            value: 'help',
            child: ListTile(
              leading: Icon(Icons.help_outline),
              title: Text('Help'),
              dense: true,
            ),
          ),
        ],
      ),
    );
  }
}

class SliverAppHeader extends StatelessWidget {
  const SliverAppHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return SliverToBoxAdapter(
      child: AppHeader(),
    );
  }
}
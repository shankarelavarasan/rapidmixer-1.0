import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class PremiumBadgeWidget extends StatelessWidget {
  final String text;
  final bool isSmall;
  final VoidCallback? onTap;

  const PremiumBadgeWidget({
    Key? key,
    this.text = 'PRO',
    this.isSmall = false,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isSmall ? 6 : 8,
          vertical: isSmall ? 2 : 4,
        ),
        decoration: BoxDecoration(
          gradient: AppColors.premiumGradient,
          borderRadius: BorderRadius.circular(isSmall ? 8 : 12),
          boxShadow: [
            BoxShadow(
              color: AppColors.premiumGold.withOpacity(0.3),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.star,
              size: isSmall ? 12 : 16,
              color: Colors.white,
            ),
            const SizedBox(width: 4),
            Text(
              text,
              style: TextStyle(
                color: Colors.white,
                fontSize: isSmall ? 10 : 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PremiumFeatureWidget extends StatelessWidget {
  final Widget child;
  final bool isPremium;
  final VoidCallback? onUpgrade;

  const PremiumFeatureWidget({
    Key? key,
    required this.child,
    this.isPremium = false,
    this.onUpgrade,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (isPremium) {
      return child;
    }

    return Stack(
      children: [
        Opacity(
          opacity: 0.5,
          child: child,
        ),
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.3),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.lock,
                    color: AppColors.premiumGold,
                    size: 32,
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Premium Feature',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  ElevatedButton(
                    onPressed: onUpgrade,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.premiumGold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                    ),
                    child: const Text('Upgrade'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
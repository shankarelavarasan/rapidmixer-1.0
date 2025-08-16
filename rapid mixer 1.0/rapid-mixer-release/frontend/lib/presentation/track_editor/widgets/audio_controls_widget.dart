import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../theme/app_theme.dart';
import '../../../widgets/custom_icon_widget.dart';

class AudioControlsWidget extends StatelessWidget {
  final double volume;
  final double pitch;
  final double speed;
  final Function(double) onVolumeChanged;
  final Function(double) onPitchChanged;
  final Function(double) onSpeedChanged;
  final VoidCallback? onReset;

  const AudioControlsWidget({
    super.key,
    required this.volume,
    required this.pitch,
    required this.speed,
    required this.onVolumeChanged,
    required this.onPitchChanged,
    required this.onSpeedChanged,
    this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.darkTheme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppTheme.borderColor,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Audio Controls',
                style: AppTheme.darkTheme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (onReset != null)
                TextButton(
                  onPressed: onReset,
                  child: Text(
                    'Reset',
                    style: TextStyle(
                      color: AppTheme.accentColor,
                      fontSize: 12.sp,
                    ),
                  ),
                ),
            ],
          ),
          SizedBox(height: 3.h),

          // Volume Control
          _buildControlSlider(
            label: 'Volume',
            value: volume,
            min: 0.0,
            max: 1.0,
            onChanged: onVolumeChanged,
            icon: 'volume_up',
            displayValue: '${(volume * 100).round()}%',
          ),

          SizedBox(height: 2.h),

          // Pitch Control
          _buildControlSlider(
            label: 'Pitch',
            value: pitch,
            min: -12.0,
            max: 12.0,
            onChanged: onPitchChanged,
            icon: 'tune',
            displayValue: '${pitch > 0 ? '+' : ''}${pitch.toStringAsFixed(1)}',
          ),

          SizedBox(height: 2.h),

          // Speed Control
          _buildControlSlider(
            label: 'Speed',
            value: speed,
            min: 0.25,
            max: 4.0,
            onChanged: onSpeedChanged,
            icon: 'speed',
            displayValue: '${speed.toStringAsFixed(2)}x',
          ),
        ],
      ),
    );
  }

  Widget _buildControlSlider({
    required String label,
    required double value,
    required double min,
    required double max,
    required Function(double) onChanged,
    required String icon,
    required String displayValue,
  }) {
    return Builder(
      builder: (context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  CustomIconWidget(
                    iconName: icon,
                    color: AppTheme.accentColor,
                    size: 4.w,
                  ),
                  SizedBox(width: 2.w),
                  Text(
                    label,
                    style: AppTheme.darkTheme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                decoration: BoxDecoration(
                  color: AppTheme.accentColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  displayValue,
                  style: AppTheme.darkTheme.textTheme.bodySmall?.copyWith(
                    color: AppTheme.accentColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 1.h),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppTheme.accentColor,
              inactiveTrackColor: AppTheme.borderColor,
              thumbColor: AppTheme.accentColor,
              overlayColor: AppTheme.accentColor.withValues(alpha: 0.2),
              valueIndicatorColor: AppTheme.accentColor,
              trackHeight: 3,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
            ),
            child: Slider(
              value: value,
              min: min,
              max: max,
              onChanged: onChanged,
              divisions: label == 'Volume' ? 100 : (label == 'Pitch' ? 240 : 150),
              label: displayValue,
            ),
          ),
        ],
      ),
    );
  }
}
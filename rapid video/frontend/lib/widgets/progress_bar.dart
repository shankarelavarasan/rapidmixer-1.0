import 'package:flutter/material.dart';

class ProgressBar extends StatelessWidget {
  final double progress;
  final String? label;
  final Color? color;
  final Color? backgroundColor;
  final double height;
  final bool showPercentage;
  final TextStyle? labelStyle;

  const ProgressBar({
    Key? key,
    required this.progress,
    this.label,
    this.color,
    this.backgroundColor,
    this.height = 8.0,
    this.showPercentage = true,
    this.labelStyle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progressColor = color ?? theme.primaryColor;
    final bgColor = backgroundColor ?? theme.dividerColor;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null || showPercentage) ..[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (label != null)
                Text(
                  label!,
                  style: labelStyle ?? theme.textTheme.bodyMedium,
                ),
              if (showPercentage)
                Text(
                  '${(progress * 100).toInt()}%',
                  style: labelStyle ?? theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
        ],
        Container(
          height: height,
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(height / 2),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(height / 2),
            child: LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              backgroundColor: Colors.transparent,
              valueColor: AlwaysStoppedAnimation<Color>(progressColor),
            ),
          ),
        ),
      ],
    );
  }
}

class AnimatedProgressBar extends StatefulWidget {
  final double progress;
  final String? label;
  final Color? color;
  final Color? backgroundColor;
  final double height;
  final bool showPercentage;
  final TextStyle? labelStyle;
  final Duration animationDuration;

  const AnimatedProgressBar({
    Key? key,
    required this.progress,
    this.label,
    this.color,
    this.backgroundColor,
    this.height = 8.0,
    this.showPercentage = true,
    this.labelStyle,
    this.animationDuration = const Duration(milliseconds: 300),
  }) : super(key: key);

  @override
  State<AnimatedProgressBar> createState() => _AnimatedProgressBarState();
}

class _AnimatedProgressBarState extends State<AnimatedProgressBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  double _currentProgress = 0.0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.animationDuration,
      vsync: this,
    );
    _animation = Tween<double>(
      begin: 0.0,
      end: widget.progress,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    
    _animation.addListener(() {
      setState(() {
        _currentProgress = _animation.value;
      });
    });
    
    _controller.forward();
  }

  @override
  void didUpdateWidget(AnimatedProgressBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.progress != widget.progress) {
      _animation = Tween<double>(
        begin: _currentProgress,
        end: widget.progress,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ));
      _controller.reset();
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ProgressBar(
      progress: _currentProgress,
      label: widget.label,
      color: widget.color,
      backgroundColor: widget.backgroundColor,
      height: widget.height,
      showPercentage: widget.showPercentage,
      labelStyle: widget.labelStyle,
    );
  }
}

class MultiStepProgressBar extends StatelessWidget {
  final List<ProgressStep> steps;
  final int currentStep;
  final Color? activeColor;
  final Color? inactiveColor;
  final Color? completedColor;
  final double height;
  final TextStyle? labelStyle;

  const MultiStepProgressBar({
    Key? key,
    required this.steps,
    required this.currentStep,
    this.activeColor,
    this.inactiveColor,
    this.completedColor,
    this.height = 4.0,
    this.labelStyle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final activeCol = activeColor ?? theme.primaryColor;
    final inactiveCol = inactiveColor ?? theme.dividerColor;
    final completedCol = completedColor ?? theme.primaryColor;

    return Column(
      children: [
        // Step labels
        Row(
          children: steps.asMap().entries.map((entry) {
            final index = entry.key;
            final step = entry.value;
            final isActive = index == currentStep;
            final isCompleted = index < currentStep;
            
            return Expanded(
              child: Text(
                step.label,
                textAlign: TextAlign.center,
                style: labelStyle?.copyWith(
                  color: isActive || isCompleted 
                      ? activeCol 
                      : inactiveCol,
                  fontWeight: isActive 
                      ? FontWeight.w600 
                      : FontWeight.normal,
                ) ?? theme.textTheme.bodySmall?.copyWith(
                  color: isActive || isCompleted 
                      ? activeCol 
                      : inactiveCol,
                  fontWeight: isActive 
                      ? FontWeight.w600 
                      : FontWeight.normal,
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 8),
        // Progress bars
        Row(
          children: steps.asMap().entries.map((entry) {
            final index = entry.key;
            final step = entry.value;
            final isActive = index == currentStep;
            final isCompleted = index < currentStep;
            
            Color barColor;
            double progress;
            
            if (isCompleted) {
              barColor = completedCol;
              progress = 1.0;
            } else if (isActive) {
              barColor = activeCol;
              progress = step.progress;
            } else {
              barColor = inactiveCol;
              progress = 0.0;
            }
            
            return Expanded(
              child: Container(
                margin: EdgeInsets.only(
                  right: index < steps.length - 1 ? 4 : 0,
                ),
                child: ProgressBar(
                  progress: progress,
                  color: barColor,
                  height: height,
                  showPercentage: false,
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class ProgressStep {
  final String label;
  final double progress;
  final String? description;

  const ProgressStep({
    required this.label,
    this.progress = 0.0,
    this.description,
  });
}

class CircularProgressBar extends StatelessWidget {
  final double progress;
  final double size;
  final double strokeWidth;
  final Color? color;
  final Color? backgroundColor;
  final Widget? child;
  final bool showPercentage;
  final TextStyle? textStyle;

  const CircularProgressBar({
    Key? key,
    required this.progress,
    this.size = 100.0,
    this.strokeWidth = 8.0,
    this.color,
    this.backgroundColor,
    this.child,
    this.showPercentage = true,
    this.textStyle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progressColor = color ?? theme.primaryColor;
    final bgColor = backgroundColor ?? theme.dividerColor;
    
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CircularProgressIndicator(
            value: progress.clamp(0.0, 1.0),
            strokeWidth: strokeWidth,
            backgroundColor: bgColor,
            valueColor: AlwaysStoppedAnimation<Color>(progressColor),
          ),
          if (child != null)
            child!
          else if (showPercentage)
            Text(
              '${(progress * 100).toInt()}%',
              style: textStyle ?? theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
        ],
      ),
    );
  }
}
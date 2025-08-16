import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_colors.dart';
import '../widgets/premium_badge_widget.dart';

class AdvancedMixerConsole extends StatefulWidget {
  final Map<String, dynamic> stems;
  final Function(String, Map<String, dynamic>) onStemUpdate;
  final bool isPremium;

  const AdvancedMixerConsole({
    Key? key,
    required this.stems,
    required this.onStemUpdate,
    this.isPremium = false,
  }) : super(key: key);

  @override
  State<AdvancedMixerConsole> createState() => _AdvancedMixerConsoleState();
}

class _AdvancedMixerConsoleState extends State<AdvancedMixerConsole>
    with TickerProviderStateMixin {
  late AnimationController _vuMeterController;
  late AnimationController _spectrumController;
  
  Map<String, double> _volumes = {};
  Map<String, double> _pans = {};
  Map<String, bool> _mutes = {};
  Map<String, bool> _solos = {};
  Map<String, Map<String, double>> _eqs = {};
  Map<String, Map<String, double>> _effects = {};

  @override
  void initState() {
    super.initState();
    _vuMeterController = AnimationController(
      duration: const Duration(milliseconds: 100),
      vsync: this,
    )..repeat();
    
    _spectrumController = AnimationController(
      duration: const Duration(milliseconds: 50),
      vsync: this,
    )..repeat();

    _initializeMixerState();
  }

  void _initializeMixerState() {
    widget.stems.forEach((stemName, stemData) {
      _volumes[stemName] = 0.8;
      _pans[stemName] = 0.0;
      _mutes[stemName] = false;
      _solos[stemName] = false;
      _eqs[stemName] = {
        'high': 0.0,
        'mid': 0.0,
        'low': 0.0,
      };
      _effects[stemName] = {
        'reverb': 0.0,
        'delay': 0.0,
        'compression': 0.0,
      };
    });
  }

  @override
  void dispose() {
    _vuMeterController.dispose();
    _spectrumController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.darkSurface,
            AppColors.darkBackground,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildConsoleHeader(),
          Expanded(
            child: Row(
              children: [
                _buildMasterSection(),
                Expanded(
                  child: _buildChannelStrips(),
                ),
              ],
            ),
          ),
          _buildTransportControls(),
        ],
      ),
    );
  }

  Widget _buildConsoleHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkCard,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.tune,
            color: AppColors.primaryColor,
            size: 24,
          ),
          const SizedBox(width: 12),
          const Text(
            'Advanced Mixer Console',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          if (!widget.isPremium)
            PremiumBadgeWidget(
              onTap: () => _showUpgradeDialog(),
            ),
        ],
      ),
    );
  }

  Widget _buildMasterSection() {
    return Container(
      width: 120,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkCard.withOpacity(0.5),
        border: Border(
          right: BorderSide(
            color: AppColors.darkBorder,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          const Text(
            'MASTER',
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: _buildMasterVolumeSlider(),
          ),
          const SizedBox(height: 20),
          _buildMasterVUMeter(),
          const SizedBox(height: 20),
          _buildMasterControls(),
        ],
      ),
    );
  }

  Widget _buildChannelStrips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: widget.stems.entries.map((entry) {
          return _buildChannelStrip(entry.key, entry.value);
        }).toList(),
      ),
    );
  }

  Widget _buildChannelStrip(String stemName, dynamic stemData) {
    return Container(
      width: 100,
      margin: const EdgeInsets.symmetric(horizontal: 2),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: AppColors.darkBorder,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          _buildChannelHeader(stemName),
          const SizedBox(height: 12),
          _buildEQSection(stemName),
          const SizedBox(height: 12),
          _buildEffectsSection(stemName),
          const SizedBox(height: 12),
          _buildPanKnob(stemName),
          const SizedBox(height: 12),
          Expanded(
            child: _buildVolumeSlider(stemName),
          ),
          const SizedBox(height: 12),
          _buildChannelButtons(stemName),
          const SizedBox(height: 8),
          _buildVUMeter(stemName),
        ],
      ),
    );
  }

  Widget _buildChannelHeader(String stemName) {
    return Column(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            shape: BoxShape.circle,
          ),
          child: Icon(
            _getStemIcon(stemName),
            color: Colors.white,
            size: 20,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          stemName.toUpperCase(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildEQSection(String stemName) {
    return PremiumFeatureWidget(
      isPremium: widget.isPremium,
      onUpgrade: _showUpgradeDialog,
      child: Column(
        children: [
          const Text(
            'EQ',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          _buildEQKnob(stemName, 'high', 'H'),
          _buildEQKnob(stemName, 'mid', 'M'),
          _buildEQKnob(stemName, 'low', 'L'),
        ],
      ),
    );
  }

  Widget _buildEffectsSection(String stemName) {
    return PremiumFeatureWidget(
      isPremium: widget.isPremium,
      onUpgrade: _showUpgradeDialog,
      child: Column(
        children: [
          const Text(
            'FX',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          _buildEffectKnob(stemName, 'reverb', 'REV'),
          _buildEffectKnob(stemName, 'delay', 'DLY'),
          _buildEffectKnob(stemName, 'compression', 'CMP'),
        ],
      ),
    );
  }

  Widget _buildEQKnob(String stemName, String band, String label) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 2),
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 8,
            ),
          ),
          SizedBox(
            width: 30,
            height: 30,
            child: _buildRotaryKnob(
              value: _eqs[stemName]?[band] ?? 0.0,
              onChanged: (value) {
                setState(() {
                  _eqs[stemName]![band] = value;
                });
                _updateStem(stemName);
              },
              color: AppColors.secondaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEffectKnob(String stemName, String effect, String label) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 2),
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 8,
            ),
          ),
          SizedBox(
            width: 30,
            height: 30,
            child: _buildRotaryKnob(
              value: _effects[stemName]?[effect] ?? 0.0,
              onChanged: (value) {
                setState(() {
                  _effects[stemName]![effect] = value;
                });
                _updateStem(stemName);
              },
              color: AppColors.accentColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRotaryKnob({
    required double value,
    required ValueChanged<double> onChanged,
    required Color color,
  }) {
    return GestureDetector(
      onPanUpdate: (details) {
        final delta = details.delta.dy * -0.01;
        final newValue = (value + delta).clamp(-1.0, 1.0);
        onChanged(newValue);
        HapticFeedback.lightImpact();
      },
      child: CustomPaint(
        painter: RotaryKnobPainter(
          value: value,
          color: color,
        ),
        size: const Size(30, 30),
      ),
    );
  }

  Widget _buildPanKnob(String stemName) {
    return Column(
      children: [
        const Text(
          'PAN',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        SizedBox(
          width: 40,
          height: 40,
          child: _buildRotaryKnob(
            value: _pans[stemName] ?? 0.0,
            onChanged: (value) {
              setState(() {
                _pans[stemName] = value;
              });
              _updateStem(stemName);
            },
            color: AppColors.primaryColor,
          ),
        ),
      ],
    );
  }

  Widget _buildVolumeSlider(String stemName) {
    return RotatedBox(
      quarterTurns: 3,
      child: SliderTheme(
        data: SliderTheme.of(context).copyWith(
          trackHeight: 4,
          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
          overlayShape: const RoundSliderOverlayShape(overlayRadius: 16),
          activeTrackColor: AppColors.primaryColor,
          inactiveTrackColor: AppColors.darkBorder,
          thumbColor: AppColors.primaryColor,
        ),
        child: Slider(
          value: _volumes[stemName] ?? 0.8,
          onChanged: (value) {
            setState(() {
              _volumes[stemName] = value;
            });
            _updateStem(stemName);
            HapticFeedback.lightImpact();
          },
          min: 0.0,
          max: 1.0,
        ),
      ),
    );
  }

  Widget _buildChannelButtons(String stemName) {
    return Column(
      children: [
        _buildChannelButton(
          'MUTE',
          _mutes[stemName] ?? false,
          AppColors.error,
          () {
            setState(() {
              _mutes[stemName] = !(_mutes[stemName] ?? false);
            });
            _updateStem(stemName);
          },
        ),
        const SizedBox(height: 4),
        _buildChannelButton(
          'SOLO',
          _solos[stemName] ?? false,
          AppColors.warning,
          () {
            setState(() {
              _solos[stemName] = !(_solos[stemName] ?? false);
            });
            _updateStem(stemName);
          },
        ),
      ],
    );
  }

  Widget _buildChannelButton(
    String label,
    bool isActive,
    Color activeColor,
    VoidCallback onPressed,
  ) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 60,
        height: 20,
        decoration: BoxDecoration(
          color: isActive ? activeColor : AppColors.darkBorder,
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: isActive ? activeColor : AppColors.darkBorder,
            width: 1,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : Colors.white54,
              fontSize: 8,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVUMeter(String stemName) {
    return AnimatedBuilder(
      animation: _vuMeterController,
      builder: (context, child) {
        return CustomPaint(
          painter: VUMeterPainter(
            level: _calculateVULevel(stemName),
            isActive: !(_mutes[stemName] ?? false),
          ),
          size: const Size(60, 8),
        );
      },
    );
  }

  Widget _buildMasterVolumeSlider() {
    return RotatedBox(
      quarterTurns: 3,
      child: SliderTheme(
        data: SliderTheme.of(context).copyWith(
          trackHeight: 6,
          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 12),
          activeTrackColor: AppColors.primaryColor,
          inactiveTrackColor: AppColors.darkBorder,
          thumbColor: AppColors.primaryColor,
        ),
        child: Slider(
          value: 0.8,
          onChanged: (value) {
            // Update master volume
          },
          min: 0.0,
          max: 1.0,
        ),
      ),
    );
  }

  Widget _buildMasterVUMeter() {
    return AnimatedBuilder(
      animation: _vuMeterController,
      builder: (context, child) {
        return CustomPaint(
          painter: MasterVUMeterPainter(
            leftLevel: 0.7,
            rightLevel: 0.6,
          ),
          size: const Size(80, 20),
        );
      },
    );
  }

  Widget _buildMasterControls() {
    return Column(
      children: [
        _buildMasterButton('REC', false, AppColors.error),
        const SizedBox(height: 8),
        _buildMasterButton('PLAY', true, AppColors.success),
        const SizedBox(height: 8),
        _buildMasterButton('STOP', false, AppColors.textSecondary),
      ],
    );
  }

  Widget _buildMasterButton(String label, bool isActive, Color color) {
    return Container(
      width: 60,
      height: 30,
      decoration: BoxDecoration(
        color: isActive ? color : AppColors.darkBorder,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: color,
          width: 1,
        ),
      ),
      child: Center(
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.white : color,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildTransportControls() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkCard,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(16),
          bottomRight: Radius.circular(16),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildTransportButton(Icons.skip_previous, () {}),
          const SizedBox(width: 16),
          _buildTransportButton(Icons.play_arrow, () {}, isLarge: true),
          const SizedBox(width: 16),
          _buildTransportButton(Icons.pause, () {}),
          const SizedBox(width: 16),
          _buildTransportButton(Icons.stop, () {}),
          const SizedBox(width: 16),
          _buildTransportButton(Icons.skip_next, () {}),
        ],
      ),
    );
  }

  Widget _buildTransportButton(
    IconData icon,
    VoidCallback onPressed, {
    bool isLarge = false,
  }) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: isLarge ? 60 : 40,
        height: isLarge ? 60 : 40,
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryColor.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: isLarge ? 30 : 20,
        ),
      ),
    );
  }

  IconData _getStemIcon(String stemName) {
    switch (stemName.toLowerCase()) {
      case 'vocals':
        return Icons.mic;
      case 'drums':
        return Icons.album;
      case 'bass':
        return Icons.graphic_eq;
      case 'piano':
        return Icons.piano;
      default:
        return Icons.music_note;
    }
  }

  double _calculateVULevel(String stemName) {
    // Simulate VU meter levels based on volume and activity
    final volume = _volumes[stemName] ?? 0.0;
    final isMuted = _mutes[stemName] ?? false;
    
    if (isMuted) return 0.0;
    
    // Add some randomness to simulate real audio levels
    final randomFactor = (DateTime.now().millisecondsSinceEpoch % 100) / 100.0;
    return (volume * 0.8 + randomFactor * 0.2).clamp(0.0, 1.0);
  }

  void _updateStem(String stemName) {
    final stemSettings = {
      'volume': _volumes[stemName],
      'pan': _pans[stemName],
      'mute': _mutes[stemName],
      'solo': _solos[stemName],
      'eq': _eqs[stemName],
      'effects': _effects[stemName],
    };
    
    widget.onStemUpdate(stemName, stemSettings);
  }

  void _showUpgradeDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Upgrade to Premium'),
        content: const Text(
          'Unlock advanced mixing features including EQ, effects, and professional controls.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Later'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to subscription page
            },
            child: const Text('Upgrade Now'),
          ),
        ],
      ),
    );
  }
}

// Custom painters for the mixer components
class RotaryKnobPainter extends CustomPainter {
  final double value;
  final Color color;

  RotaryKnobPainter({required this.value, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    
    // Draw knob base
    final basePaint = Paint()
      ..color = AppColors.knobBase
      ..style = PaintingStyle.fill;
    
    canvas.drawCircle(center, radius, basePaint);
    
    // Draw knob indicator
    final angle = (value + 1) * 0.75 * 3.14159; // -135° to +135°
    final indicatorStart = center;
    final indicatorEnd = Offset(
      center.dx + (radius * 0.7) * cos(angle - 1.5708), // -90° offset
      center.dy + (radius * 0.7) * sin(angle - 1.5708),
    );
    
    final indicatorPaint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    
    canvas.drawLine(indicatorStart, indicatorEnd, indicatorPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class VUMeterPainter extends CustomPainter {
  final double level;
  final bool isActive;

  VUMeterPainter({required this.level, required this.isActive});

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    
    // Background
    final bgPaint = Paint()..color = AppColors.darkBorder;
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect, const Radius.circular(4)),
      bgPaint,
    );
    
    if (isActive && level > 0) {
      // Level indicator
      final levelWidth = size.width * level;
      final levelRect = Rect.fromLTWH(0, 0, levelWidth, size.height);
      
      Color levelColor;
      if (level < 0.7) {
        levelColor = AppColors.success;
      } else if (level < 0.9) {
        levelColor = AppColors.warning;
      } else {
        levelColor = AppColors.error;
      }
      
      final levelPaint = Paint()..color = levelColor;
      canvas.drawRRect(
        RRect.fromRectAndRadius(levelRect, const Radius.circular(4)),
        levelPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class MasterVUMeterPainter extends CustomPainter {
  final double leftLevel;
  final double rightLevel;

  MasterVUMeterPainter({required this.leftLevel, required this.rightLevel});

  @override
  void paint(Canvas canvas, Size size) {
    final leftRect = Rect.fromLTWH(0, 0, size.width, size.height / 2 - 1);
    final rightRect = Rect.fromLTWH(0, size.height / 2 + 1, size.width, size.height / 2 - 1);
    
    _drawChannel(canvas, leftRect, leftLevel);
    _drawChannel(canvas, rightRect, rightLevel);
  }

  void _drawChannel(Canvas canvas, Rect rect, double level) {
    // Background
    final bgPaint = Paint()..color = AppColors.darkBorder;
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect, const Radius.circular(2)),
      bgPaint,
    );
    
    if (level > 0) {
      // Level indicator
      final levelWidth = rect.width * level;
      final levelRect = Rect.fromLTWH(rect.left, rect.top, levelWidth, rect.height);
      
      Color levelColor;
      if (level < 0.7) {
        levelColor = AppColors.success;
      } else if (level < 0.9) {
        levelColor = AppColors.warning;
      } else {
        levelColor = AppColors.error;
      }
      
      final levelPaint = Paint()..color = levelColor;
      canvas.drawRRect(
        RRect.fromRectAndRadius(levelRect, const Radius.circular(2)),
        levelPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// Helper function for cos calculation
double cos(double radians) => math.cos(radians);
double sin(double radians) => math.sin(radians);

import 'dart:math' as math;
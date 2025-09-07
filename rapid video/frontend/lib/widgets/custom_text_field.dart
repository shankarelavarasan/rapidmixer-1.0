import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/spacing.dart';

/// A customizable text field widget with consistent styling
class CustomTextField extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? helperText;
  final String? errorText;
  final TextEditingController? controller;
  final String? initialValue;
  final bool obscureText;
  final bool enabled;
  final bool readOnly;
  final bool autofocus;
  final int? maxLines;
  final int? minLines;
  final int? maxLength;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final VoidCallback? onEditingComplete;
  final FormFieldValidator<String>? validator;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final String? prefixText;
  final String? suffixText;
  final EdgeInsetsGeometry? contentPadding;
  final bool dense;
  final bool filled;
  final Color? fillColor;
  final InputBorder? border;
  final InputBorder? enabledBorder;
  final InputBorder? focusedBorder;
  final InputBorder? errorBorder;
  final InputBorder? disabledBorder;
  final TextStyle? style;
  final TextStyle? labelStyle;
  final TextStyle? hintStyle;
  final TextStyle? helperStyle;
  final TextStyle? errorStyle;
  final TextAlign textAlign;
  final TextAlignVertical? textAlignVertical;
  final FocusNode? focusNode;
  final bool expands;
  final TextCapitalization textCapitalization;
  final bool autocorrect;
  final bool enableSuggestions;
  final double? cursorHeight;
  final Color? cursorColor;
  final Radius? cursorRadius;
  final double cursorWidth;
  final Brightness? keyboardAppearance;
  final EdgeInsets scrollPadding;
  final bool enableInteractiveSelection;
  final DragStartBehavior dragStartBehavior;
  final ScrollController? scrollController;
  final ScrollPhysics? scrollPhysics;
  final Iterable<String>? autofillHints;
  final String? restorationId;
  final bool enableIMEPersonalizedLearning;

  const CustomTextField({
    Key? key,
    this.label,
    this.hint,
    this.helperText,
    this.errorText,
    this.controller,
    this.initialValue,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.maxLines = 1,
    this.minLines,
    this.maxLength,
    this.keyboardType,
    this.textInputAction,
    this.inputFormatters,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.onEditingComplete,
    this.validator,
    this.prefixIcon,
    this.suffixIcon,
    this.prefixText,
    this.suffixText,
    this.contentPadding,
    this.dense = false,
    this.filled = true,
    this.fillColor,
    this.border,
    this.enabledBorder,
    this.focusedBorder,
    this.errorBorder,
    this.disabledBorder,
    this.style,
    this.labelStyle,
    this.hintStyle,
    this.helperStyle,
    this.errorStyle,
    this.textAlign = TextAlign.start,
    this.textAlignVertical,
    this.focusNode,
    this.expands = false,
    this.textCapitalization = TextCapitalization.none,
    this.autocorrect = true,
    this.enableSuggestions = true,
    this.cursorHeight,
    this.cursorColor,
    this.cursorRadius,
    this.cursorWidth = 2.0,
    this.keyboardAppearance,
    this.scrollPadding = const EdgeInsets.all(20.0),
    this.enableInteractiveSelection = true,
    this.dragStartBehavior = DragStartBehavior.start,
    this.scrollController,
    this.scrollPhysics,
    this.autofillHints,
    this.restorationId,
    this.enableIMEPersonalizedLearning = true,
  }) : super(key: key);

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  late bool _obscureText;
  late FocusNode _focusNode;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.obscureText;
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _onFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  void _toggleObscureText() {
    setState(() {
      _obscureText = !_obscureText;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ..[
          Text(
            widget.label!,
            style: widget.labelStyle ?? theme.textTheme.labelMedium?.copyWith(
              color: _isFocused 
                ? colorScheme.primary 
                : colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
          ),
          AppSpacing.verticalSpaceXS,
        ],
        TextFormField(
          controller: widget.controller,
          initialValue: widget.initialValue,
          focusNode: _focusNode,
          obscureText: _obscureText,
          enabled: widget.enabled,
          readOnly: widget.readOnly,
          autofocus: widget.autofocus,
          maxLines: widget.obscureText ? 1 : widget.maxLines,
          minLines: widget.minLines,
          maxLength: widget.maxLength,
          keyboardType: widget.keyboardType,
          textInputAction: widget.textInputAction,
          inputFormatters: widget.inputFormatters,
          onChanged: widget.onChanged,
          onFieldSubmitted: widget.onSubmitted,
          onTap: widget.onTap,
          onEditingComplete: widget.onEditingComplete,
          validator: widget.validator,
          style: widget.style ?? theme.textTheme.bodyLarge,
          textAlign: widget.textAlign,
          textAlignVertical: widget.textAlignVertical,
          expands: widget.expands,
          textCapitalization: widget.textCapitalization,
          autocorrect: widget.autocorrect,
          enableSuggestions: widget.enableSuggestions,
          cursorHeight: widget.cursorHeight,
          cursorColor: widget.cursorColor ?? colorScheme.primary,
          cursorRadius: widget.cursorRadius,
          cursorWidth: widget.cursorWidth,
          keyboardAppearance: widget.keyboardAppearance,
          scrollPadding: widget.scrollPadding,
          enableInteractiveSelection: widget.enableInteractiveSelection,
          dragStartBehavior: widget.dragStartBehavior,
          scrollController: widget.scrollController,
          scrollPhysics: widget.scrollPhysics,
          autofillHints: widget.autofillHints,
          restorationId: widget.restorationId,
          enableIMEPersonalizedLearning: widget.enableIMEPersonalizedLearning,
          decoration: InputDecoration(
            hintText: widget.hint,
            helperText: widget.helperText,
            errorText: widget.errorText,
            prefixIcon: widget.prefixIcon,
            suffixIcon: widget.obscureText
                ? IconButton(
                    icon: Icon(
                      _obscureText ? Icons.visibility : Icons.visibility_off,
                      color: colorScheme.onSurfaceVariant,
                    ),
                    onPressed: _toggleObscureText,
                  )
                : widget.suffixIcon,
            prefixText: widget.prefixText,
            suffixText: widget.suffixText,
            contentPadding: widget.contentPadding ?? AppSpacing.paddingMD,
            isDense: widget.dense,
            filled: widget.filled,
            fillColor: widget.fillColor ?? colorScheme.surfaceContainerHighest.withOpacity(0.3),
            border: widget.border ?? _buildBorder(colorScheme.outline),
            enabledBorder: widget.enabledBorder ?? _buildBorder(colorScheme.outline),
            focusedBorder: widget.focusedBorder ?? _buildBorder(colorScheme.primary, width: 2),
            errorBorder: widget.errorBorder ?? _buildBorder(colorScheme.error),
            focusedErrorBorder: _buildBorder(colorScheme.error, width: 2),
            disabledBorder: widget.disabledBorder ?? _buildBorder(colorScheme.outline.withOpacity(0.5)),
            hintStyle: widget.hintStyle ?? theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant.withOpacity(0.6),
            ),
            helperStyle: widget.helperStyle ?? theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
            errorStyle: widget.errorStyle ?? theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.error,
            ),
          ),
        ),
      ],
    );
  }

  OutlineInputBorder _buildBorder(Color color, {double width = 1}) {
    return OutlineInputBorder(
      borderRadius: AppSpacing.borderRadiusMD,
      borderSide: BorderSide(
        color: color,
        width: width,
      ),
    );
  }
}

/// A password text field with built-in visibility toggle
class PasswordTextField extends StatelessWidget {
  final String? label;
  final String? hint;
  final TextEditingController? controller;
  final String? initialValue;
  final FormFieldValidator<String>? validator;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool autofocus;
  final FocusNode? focusNode;
  final TextInputAction? textInputAction;
  final bool enabled;
  final String? errorText;
  final String? helperText;
  final EdgeInsetsGeometry? contentPadding;
  final Widget? prefixIcon;

  const PasswordTextField({
    Key? key,
    this.label,
    this.hint,
    this.controller,
    this.initialValue,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.autofocus = false,
    this.focusNode,
    this.textInputAction,
    this.enabled = true,
    this.errorText,
    this.helperText,
    this.contentPadding,
    this.prefixIcon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CustomTextField(
      label: label,
      hint: hint ?? 'Enter your password',
      controller: controller,
      initialValue: initialValue,
      obscureText: true,
      validator: validator,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      autofocus: autofocus,
      focusNode: focusNode,
      textInputAction: textInputAction,
      enabled: enabled,
      errorText: errorText,
      helperText: helperText,
      contentPadding: contentPadding,
      prefixIcon: prefixIcon ?? const Icon(Icons.lock_outline),
      keyboardType: TextInputType.visiblePassword,
      textCapitalization: TextCapitalization.none,
      autocorrect: false,
      enableSuggestions: false,
    );
  }
}

/// An email text field with built-in validation
class EmailTextField extends StatelessWidget {
  final String? label;
  final String? hint;
  final TextEditingController? controller;
  final String? initialValue;
  final FormFieldValidator<String>? validator;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool autofocus;
  final FocusNode? focusNode;
  final TextInputAction? textInputAction;
  final bool enabled;
  final String? errorText;
  final String? helperText;
  final EdgeInsetsGeometry? contentPadding;

  const EmailTextField({
    Key? key,
    this.label,
    this.hint,
    this.controller,
    this.initialValue,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.autofocus = false,
    this.focusNode,
    this.textInputAction,
    this.enabled = true,
    this.errorText,
    this.helperText,
    this.contentPadding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CustomTextField(
      label: label,
      hint: hint ?? 'Enter your email',
      controller: controller,
      initialValue: initialValue,
      validator: validator ?? _defaultEmailValidator,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      autofocus: autofocus,
      focusNode: focusNode,
      textInputAction: textInputAction,
      enabled: enabled,
      errorText: errorText,
      helperText: helperText,
      contentPadding: contentPadding,
      prefixIcon: const Icon(Icons.email_outlined),
      keyboardType: TextInputType.emailAddress,
      textCapitalization: TextCapitalization.none,
      autocorrect: false,
      enableSuggestions: false,
      autofillHints: const [AutofillHints.email],
    );
  }

  String? _defaultEmailValidator(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  }
}

/// A search text field with built-in search icon
class SearchTextField extends StatelessWidget {
  final String? hint;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onClear;
  final bool autofocus;
  final FocusNode? focusNode;
  final bool enabled;
  final EdgeInsetsGeometry? contentPadding;

  const SearchTextField({
    Key? key,
    this.hint,
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.onClear,
    this.autofocus = false,
    this.focusNode,
    this.enabled = true,
    this.contentPadding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CustomTextField(
      hint: hint ?? 'Search...',
      controller: controller,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      autofocus: autofocus,
      focusNode: focusNode,
      enabled: enabled,
      contentPadding: contentPadding,
      prefixIcon: const Icon(Icons.search),
      suffixIcon: controller?.text.isNotEmpty == true
          ? IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                controller?.clear();
                onClear?.call();
              },
            )
          : null,
      keyboardType: TextInputType.text,
      textInputAction: TextInputAction.search,
    );
  }
}
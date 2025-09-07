import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/firebase_service.dart';
import '../services/api_service.dart';
import '../widgets/custom_button.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/spacing.dart';
import 'dart:html' as html;
import 'dart:js' as js;

class PaymentScreen extends StatefulWidget {
  final double amount;
  final double videoDuration;
  final String jobId;

  const PaymentScreen({
    Key? key,
    required this.amount,
    required this.videoDuration,
    required this.jobId,
  }) : super(key: key);

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  bool _isProcessingPayment = false;
  String? _errorMessage;
  bool _paymentSuccess = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment Required'),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Theme.of(context).colorScheme.surface,
              Theme.of(context).colorScheme.surfaceContainerHighest.withOpacity(0.3),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(Spacing.lg),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 500),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Payment Header
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(Spacing.xl),
                        child: Column(
                          children: [
                            Icon(
                              Icons.payment,
                              size: 64,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            const SizedBox(height: Spacing.md),
                            Text(
                              'Complete Your Payment',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: Spacing.sm),
                            Text(
                              'Secure payment powered by Stripe',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: Spacing.lg),

                    // Video Details
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(Spacing.lg),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Video Details',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: Spacing.md),
                            _buildDetailRow(
                              'Duration:',
                              '${widget.videoDuration.toStringAsFixed(1)} seconds',
                            ),
                            _buildDetailRow(
                              'Processing Type:',
                              '2D to 3D AI Conversion',
                            ),
                            _buildDetailRow(
                              'Features:',
                              'Scene splitting, AI enhancement, Audio sync',
                            ),
                            const Divider(height: Spacing.lg),
                            _buildDetailRow(
                              'Total Amount:',
                              '\$${widget.amount.toStringAsFixed(2)}',
                              isTotal: true,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: Spacing.lg),

                    // Payment Methods
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(Spacing.lg),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Payment Method',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: Spacing.md),
                            
                            // Stripe Payment Button
                            CustomButton(
                              onPressed: _isProcessingPayment ? null : _processStripePayment,
                              isLoading: _isProcessingPayment,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.credit_card,
                                    color: Theme.of(context).colorScheme.onPrimary,
                                  ),
                                  const SizedBox(width: Spacing.sm),
                                  Text(
                                    _isProcessingPayment
                                        ? 'Processing...'
                                        : 'Pay with Stripe',
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: Spacing.md),
                            
                            // Payment Info
                            Container(
                              padding: const EdgeInsets.all(Spacing.sm),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.surfaceContainerHighest,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.security,
                                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                                    size: 16,
                                  ),
                                  const SizedBox(width: Spacing.xs),
                                  Expanded(
                                    child: Text(
                                      'Your payment is secure and encrypted. We never store your card details.',
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Error Message
                    if (_errorMessage != null) ..[
                      const SizedBox(height: Spacing.lg),
                      Container(
                        padding: const EdgeInsets.all(Spacing.md),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.errorContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.error_outline,
                              color: Theme.of(context).colorScheme.error,
                            ),
                            const SizedBox(width: Spacing.sm),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: TextStyle(
                                  color: Theme.of(context).colorScheme.error,
                                ),
                              ),
                            ),
                            IconButton(
                              onPressed: () => setState(() => _errorMessage = null),
                              icon: Icon(
                                Icons.close,
                                color: Theme.of(context).colorScheme.error,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Success Message
                    if (_paymentSuccess) ..[
                      const SizedBox(height: Spacing.lg),
                      Container(
                        padding: const EdgeInsets.all(Spacing.md),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.check_circle_outline,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            const SizedBox(width: Spacing.sm),
                            Expanded(
                              child: Text(
                                'Payment successful! Your video is now being processed.',
                                style: TextStyle(
                                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: Spacing.xl),

                    // Cancel Button
                    if (!_paymentSuccess)
                      TextButton(
                        onPressed: _isProcessingPayment ? null : () => Navigator.of(context).pop(false),
                        child: const Text('Cancel'),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: Spacing.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal ? Theme.of(context).colorScheme.primary : null,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _processStripePayment() async {
    setState(() {
      _isProcessingPayment = true;
      _errorMessage = null;
    });

    try {
      final firebaseService = Provider.of<FirebaseService>(context, listen: false);
      final apiService = Provider.of<ApiService>(context, listen: false);
      final user = firebaseService.currentUser;

      if (user == null) {
        throw Exception('User not authenticated');
      }

      // Create payment intent
      final paymentIntent = await apiService.createPaymentIntent(
        amount: widget.amount,
        userId: user.uid,
        jobId: widget.jobId,
      );

      if (paymentIntent['success'] != true) {
        throw Exception(paymentIntent['error'] ?? 'Failed to create payment intent');
      }

      final clientSecret = paymentIntent['client_secret'];
      final publishableKey = paymentIntent['publishable_key'];

      // Initialize Stripe (this would typically be done with Stripe's JS SDK)
      // For demo purposes, we'll simulate the payment process
      await _simulateStripePayment(clientSecret, publishableKey);

    } catch (e) {
      setState(() {
        _errorMessage = 'Payment failed: ${e.toString()}';
        _isProcessingPayment = false;
      });
    }
  }

  Future<void> _simulateStripePayment(String clientSecret, String publishableKey) async {
    try {
      // In a real implementation, you would use Stripe's JavaScript SDK
      // to handle the payment securely in the browser
      
      // For demo purposes, we'll simulate a successful payment
      await Future.delayed(const Duration(seconds: 2));
      
      // Verify payment with backend
      final apiService = Provider.of<ApiService>(context, listen: false);
      final firebaseService = Provider.of<FirebaseService>(context, listen: false);
      final user = firebaseService.currentUser;
      
      final verificationResult = await apiService.verifyPayment(
        paymentIntentId: 'pi_demo_${DateTime.now().millisecondsSinceEpoch}',
        userId: user!.uid,
        jobId: widget.jobId,
      );

      if (verificationResult['success'] == true) {
        setState(() {
          _paymentSuccess = true;
          _isProcessingPayment = false;
        });

        // Wait a moment to show success message
        await Future.delayed(const Duration(seconds: 2));
        
        // Return success to previous screen
        if (mounted) {
          Navigator.of(context).pop(true);
        }
      } else {
        throw Exception(verificationResult['error'] ?? 'Payment verification failed');
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Payment verification failed: ${e.toString()}';
        _isProcessingPayment = false;
      });
    }
  }

  // Real Stripe integration would look like this:
  /*
  Future<void> _processRealStripePayment(String clientSecret, String publishableKey) async {
    try {
      // Load Stripe.js
      js.context.callMethod('loadStripe', [publishableKey]);
      
      // Confirm payment
      final result = await js.context.callMethod('confirmCardPayment', [
        clientSecret,
        {
          'payment_method': {
            'card': js.context['stripeElements']['card'],
            'billing_details': {
              'name': 'Customer Name',
            },
          }
        }
      ]);
      
      if (result['error'] != null) {
        throw Exception(result['error']['message']);
      }
      
      // Payment succeeded
      final paymentIntent = result['paymentIntent'];
      await _verifyPaymentWithBackend(paymentIntent['id']);
      
    } catch (e) {
      setState(() {
        _errorMessage = 'Payment failed: ${e.toString()}';
        _isProcessingPayment = false;
      });
    }
  }
  */
}
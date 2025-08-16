import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/app_config.dart';

class SubscriptionService {
  static const String baseUrl = AppConfig.apiBaseUrl;
  
  // Get available subscription plans
  static Future<List<SubscriptionPlan>> getPlans() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/subscription/plans'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['plans'] as List)
            .map((plan) => SubscriptionPlan.fromJson(plan))
            .toList();
      } else {
        throw Exception('Failed to load subscription plans');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Get current subscription status
  static Future<SubscriptionStatus> getSubscriptionStatus(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/subscription/status'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return SubscriptionStatus.fromJson(data);
      } else {
        throw Exception('Failed to get subscription status');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Create subscription
  static Future<SubscriptionResult> createSubscription({
    required String token,
    required String planId,
    required String paymentMethodId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/subscription/create'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'planId': planId,
          'paymentMethodId': paymentMethodId,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return SubscriptionResult.fromJson(data);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Failed to create subscription');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Cancel subscription
  static Future<bool> cancelSubscription(String token) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/subscription/cancel'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Reactivate subscription
  static Future<bool> reactivateSubscription(String token) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/subscription/reactivate'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Create payment intent
  static Future<PaymentIntent> createPaymentIntent({
    required String token,
    required int amount,
    String currency = 'usd',
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/subscription/payment-intent'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'amount': amount,
          'currency': currency,
          'metadata': metadata ?? {},
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return PaymentIntent.fromJson(data);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Failed to create payment intent');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}

class SubscriptionPlan {
  final String id;
  final String name;
  final int price;
  final String currency;
  final String interval;
  final List<String> features;

  SubscriptionPlan({
    required this.id,
    required this.name,
    required this.price,
    required this.currency,
    required this.interval,
    required this.features,
  });

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlan(
      id: json['id'],
      name: json['name'],
      price: json['price'],
      currency: json['currency'],
      interval: json['interval'],
      features: List<String>.from(json['features']),
    );
  }

  String get formattedPrice {
    final dollars = price / 100;
    return '\$${dollars.toStringAsFixed(2)}';
  }

  String get billingPeriod {
    switch (interval) {
      case 'month':
        return 'per month';
      case 'year':
        return 'per year';
      default:
        return 'per $interval';
    }
  }
}

class SubscriptionStatus {
  final String status;
  final String type;
  final DateTime? expiresAt;
  final bool? cancelAtPeriodEnd;
  final DateTime? currentPeriodStart;
  final DateTime? currentPeriodEnd;
  final UsageStats? usage;

  SubscriptionStatus({
    required this.status,
    required this.type,
    this.expiresAt,
    this.cancelAtPeriodEnd,
    this.currentPeriodStart,
    this.currentPeriodEnd,
    this.usage,
  });

  factory SubscriptionStatus.fromJson(Map<String, dynamic> json) {
    final subscription = json['subscription'];
    final usage = json['usage'];

    return SubscriptionStatus(
      status: subscription['status'],
      type: subscription['type'],
      expiresAt: subscription['expiresAt'] != null
          ? DateTime.parse(subscription['expiresAt'])
          : null,
      cancelAtPeriodEnd: subscription['cancelAtPeriodEnd'],
      currentPeriodStart: subscription['currentPeriodStart'] != null
          ? DateTime.parse(subscription['currentPeriodStart'])
          : null,
      currentPeriodEnd: subscription['currentPeriodEnd'] != null
          ? DateTime.parse(subscription['currentPeriodEnd'])
          : null,
      usage: usage != null ? UsageStats.fromJson(usage) : null,
    );
  }

  bool get isPremium => type == 'premium';
  bool get isActive => status == 'active';
  bool get isExpired => expiresAt != null && expiresAt!.isBefore(DateTime.now());
}

class UsageStats {
  final String subscription;
  final UsageLimits limits;
  final CurrentUsage usage;

  UsageStats({
    required this.subscription,
    required this.limits,
    required this.usage,
  });

  factory UsageStats.fromJson(Map<String, dynamic> json) {
    return UsageStats(
      subscription: json['subscription'],
      limits: UsageLimits.fromJson(json['limits']),
      usage: CurrentUsage.fromJson(json['usage']),
    );
  }
}

class UsageLimits {
  final int projects;
  final int exports;
  final int storage;

  UsageLimits({
    required this.projects,
    required this.exports,
    required this.storage,
  });

  factory UsageLimits.fromJson(Map<String, dynamic> json) {
    return UsageLimits(
      projects: json['projects'],
      exports: json['exports'],
      storage: json['storage'],
    );
  }
}

class CurrentUsage {
  final int projects;
  final int exportsToday;
  final int storageUsed;

  CurrentUsage({
    required this.projects,
    required this.exportsToday,
    required this.storageUsed,
  });

  factory CurrentUsage.fromJson(Map<String, dynamic> json) {
    return CurrentUsage(
      projects: json['projects'],
      exportsToday: json['exportsToday'],
      storageUsed: json['storageUsed'],
    );
  }

  String get formattedStorage {
    if (storageUsed < 1024 * 1024) {
      return '${(storageUsed / 1024).toStringAsFixed(1)} KB';
    } else if (storageUsed < 1024 * 1024 * 1024) {
      return '${(storageUsed / (1024 * 1024)).toStringAsFixed(1)} MB';
    } else {
      return '${(storageUsed / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
    }
  }
}

class SubscriptionResult {
  final String message;
  final String subscriptionId;
  final String? clientSecret;
  final String status;

  SubscriptionResult({
    required this.message,
    required this.subscriptionId,
    this.clientSecret,
    required this.status,
  });

  factory SubscriptionResult.fromJson(Map<String, dynamic> json) {
    final subscription = json['subscription'];
    return SubscriptionResult(
      message: json['message'],
      subscriptionId: subscription['subscriptionId'],
      clientSecret: subscription['clientSecret'],
      status: subscription['status'],
    );
  }
}

class PaymentIntent {
  final String clientSecret;
  final String paymentIntentId;

  PaymentIntent({
    required this.clientSecret,
    required this.paymentIntentId,
  });

  factory PaymentIntent.fromJson(Map<String, dynamic> json) {
    return PaymentIntent(
      clientSecret: json['clientSecret'],
      paymentIntentId: json['paymentIntentId'],
    );
  }
}
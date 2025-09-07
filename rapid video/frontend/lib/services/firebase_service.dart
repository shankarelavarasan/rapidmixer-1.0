import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';

class FirebaseService extends ChangeNotifier {
  static FirebaseService? _instance;
  static FirebaseService get instance {
    _instance ??= FirebaseService._internal();
    return _instance!;
  }

  FirebaseService._internal();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  User? get currentUser => _auth.currentUser;
  bool get isSignedIn => _auth.currentUser != null;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Initialize Firebase
  static Future<void> initialize() async {
    try {
      await Firebase.initializeApp(
        options: const FirebaseOptions(
          apiKey: "your-api-key",
          authDomain: "your-project.firebaseapp.com",
          projectId: "your-project-id",
          storageBucket: "your-project.appspot.com",
          messagingSenderId: "123456789",
          appId: "1:123456789:web:abcdef123456",
        ),
      );
    } catch (e) {
      print('Firebase initialization error: $e');
      // For demo purposes, we'll continue without Firebase
      // In production, you should handle this error appropriately
    }
  }

  // Email/Password Sign Up
  Future<UserCredential?> signUpWithEmailPassword({
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Update display name if provided
      if (displayName != null && credential.user != null) {
        await credential.user!.updateDisplayName(displayName);
        await credential.user!.reload();
      }

      // Create user document in Firestore
      if (credential.user != null) {
        await _createUserDocument(credential.user!);
      }

      notifyListeners();
      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('Sign up failed: ${e.toString()}');
    }
  }

  // Email/Password Sign In
  Future<UserCredential?> signInWithEmailPassword({
    required String email,
    required String password,
  }) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Ensure user document exists
      if (credential.user != null) {
        await _createUserDocument(credential.user!);
      }

      notifyListeners();
      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('Sign in failed: ${e.toString()}');
    }
  }

  // Alias methods for compatibility with login screen
  Future<User?> signUpWithEmail(String email, String password) async {
    final credential = await signUpWithEmailPassword(
      email: email,
      password: password,
    );
    return credential?.user;
  }

  Future<User?> signInWithEmail(String email, String password) async {
    final credential = await signInWithEmailPassword(
      email: email,
      password: password,
    );
    return credential?.user;
  }

  // Get current user
  User? getCurrentUser() {
    return _auth.currentUser;
  }

  // Google Sign In
  Future<UserCredential?> signInWithGoogle() async {
    try {
      // Trigger the authentication flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        // User canceled the sign-in
        return null;
      }

      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Create a new credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase with the Google credential
      final userCredential = await _auth.signInWithCredential(credential);

      // Create user document in Firestore
      if (userCredential.user != null) {
        await _createUserDocument(userCredential.user!);
      }

      notifyListeners();
      return userCredential;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('Google sign in failed: ${e.toString()}');
    }
  }

  // Anonymous Sign In
  Future<UserCredential?> signInAnonymously() async {
    try {
      final credential = await _auth.signInAnonymously();

      // Create user document in Firestore
      if (credential.user != null) {
        await _createUserDocument(credential.user!);
      }

      notifyListeners();
      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('Anonymous sign in failed: ${e.toString()}');
    }
  }

  // Sign Out
  Future<void> signOut() async {
    try {
      await Future.wait([
        _auth.signOut(),
        _googleSignIn.signOut(),
      ]);
      notifyListeners();
    } catch (e) {
      throw Exception('Sign out failed: ${e.toString()}');
    }
  }

  // Password Reset
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('Password reset failed: ${e.toString()}');
    }
  }

  // Create or update user document in Firestore
  Future<void> _createUserDocument(User user) async {
    try {
      final userDoc = _firestore.collection('users').doc(user.uid);
      final docSnapshot = await userDoc.get();

      if (!docSnapshot.exists) {
        // Create new user document
        await userDoc.set({
          'uid': user.uid,
          'email': user.email,
          'displayName': user.displayName,
          'photoURL': user.photoURL,
          'isAnonymous': user.isAnonymous,
          'first_video_used': false,
          'videos_created': 0,
          'balance_paid': 0.0,
          'subscription_active': false,
          'created_at': FieldValue.serverTimestamp(),
          'updated_at': FieldValue.serverTimestamp(),
        });
      } else {
        // Update existing user document
        await userDoc.update({
          'email': user.email,
          'displayName': user.displayName,
          'photoURL': user.photoURL,
          'updated_at': FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      print('Error creating/updating user document: $e');
      // Don't throw here as authentication was successful
    }
  }

  // Get user quota information
  Future<Map<String, dynamic>> getUserQuota(String userId) async {
    try {
      final userDoc = await _firestore.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw Exception('User document not found');
      }

      final data = userDoc.data()!;
      final firstVideoUsed = data['first_video_used'] ?? false;
      final videosCreated = data['videos_created'] ?? 0;
      final balancePaid = (data['balance_paid'] ?? 0.0).toDouble();
      final subscriptionActive = data['subscription_active'] ?? false;

      return {
        'first_video_used': firstVideoUsed,
        'videos_created': videosCreated,
        'balance_paid': balancePaid,
        'subscription_active': subscriptionActive,
        'can_create_free_video': !firstVideoUsed,
      };
    } catch (e) {
      throw Exception('Failed to get user quota: ${e.toString()}');
    }
  }

  // Update user quota after video creation
  Future<void> updateUserQuota({
    required String userId,
    required double cost,
    bool markFirstVideoUsed = false,
  }) async {
    try {
      final userDoc = _firestore.collection('users').doc(userId);
      
      final updates = <String, dynamic>{
        'videos_created': FieldValue.increment(1),
        'updated_at': FieldValue.serverTimestamp(),
      };

      if (markFirstVideoUsed) {
        updates['first_video_used'] = true;
      }

      if (cost > 0) {
        updates['balance_paid'] = FieldValue.increment(-cost);
      }

      await userDoc.update(updates);
    } catch (e) {
      throw Exception('Failed to update user quota: ${e.toString()}');
    }
  }

  // Add payment to user balance
  Future<void> addPayment({
    required String userId,
    required double amount,
    required String paymentId,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final batch = _firestore.batch();

      // Update user balance
      final userDoc = _firestore.collection('users').doc(userId);
      batch.update(userDoc, {
        'balance_paid': FieldValue.increment(amount),
        'updated_at': FieldValue.serverTimestamp(),
      });

      // Create transaction record
      final transactionDoc = _firestore
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .doc();
      
      batch.set(transactionDoc, {
        'payment_id': paymentId,
        'amount': amount,
        'type': 'payment',
        'status': 'completed',
        'metadata': metadata ?? {},
        'created_at': FieldValue.serverTimestamp(),
      });

      await batch.commit();
    } catch (e) {
      throw Exception('Failed to add payment: ${e.toString()}');
    }
  }

  // Get user transactions
  Future<List<Map<String, dynamic>>> getUserTransactions(String userId) async {
    try {
      final querySnapshot = await _firestore
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .orderBy('created_at', descending: true)
          .limit(50)
          .get();

      return querySnapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      throw Exception('Failed to get transactions: ${e.toString()}');
    }
  }

  // Create job document
  Future<void> createJobDocument({
    required String jobId,
    required String userId,
    required Map<String, dynamic> jobData,
  }) async {
    try {
      await _firestore.collection('jobs').doc(jobId).set({
        'user_id': userId,
        'status': 'created',
        'created_at': FieldValue.serverTimestamp(),
        'updated_at': FieldValue.serverTimestamp(),
        ...jobData,
      });
    } catch (e) {
      throw Exception('Failed to create job document: ${e.toString()}');
    }
  }

  // Update job status
  Future<void> updateJobStatus({
    required String jobId,
    required String status,
    Map<String, dynamic>? additionalData,
  }) async {
    try {
      final updates = {
        'status': status,
        'updated_at': FieldValue.serverTimestamp(),
        ...?additionalData,
      };

      await _firestore.collection('jobs').doc(jobId).update(updates);
    } catch (e) {
      throw Exception('Failed to update job status: ${e.toString()}');
    }
  }

  // Get job details
  Future<Map<String, dynamic>?> getJobDetails(String jobId) async {
    try {
      final doc = await _firestore.collection('jobs').doc(jobId).get();
      
      if (!doc.exists) {
        return null;
      }

      final data = doc.data()!;
      data['id'] = doc.id;
      return data;
    } catch (e) {
      throw Exception('Failed to get job details: ${e.toString()}');
    }
  }

  // Handle Firebase Auth exceptions
  String _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No user found with this email address.';
      case 'wrong-password':
        return 'Incorrect password.';
      case 'email-already-in-use':
        return 'An account already exists with this email address.';
      case 'weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'invalid-email':
        return 'Invalid email address.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'operation-not-allowed':
        return 'This sign-in method is not enabled.';
      case 'network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return e.message ?? 'Authentication failed. Please try again.';
    }
  }
}
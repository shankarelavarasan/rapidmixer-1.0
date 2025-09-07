import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:rapid_video/providers/video_provider.dart';
import 'package:rapid_video/screens/home_screen.dart';
import 'package:rapid_video/screens/login_screen.dart';
import 'package:rapid_video/screens/upload_screen.dart';
import 'package:rapid_video/screens/payment_screen.dart';
import 'package:rapid_video/screens/preview_screen.dart';
import 'package:rapid_video/theme/app_theme.dart';
import 'package:rapid_video/services/storage_service.dart';
import 'package:rapid_video/services/api_service.dart';
import 'package:rapid_video/services/firebase_service.dart';
import 'package:rapid_video/utils/constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: "your-api-key",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "your-app-id",
    ),
  );
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  // Set preferred orientations for web
  if (kIsWeb) {
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
  }
  
  // Initialize services
  await _initializeServices();
  
  runApp(const RapidVideoApp());
}

Future<void> _initializeServices() async {
  try {
    // Initialize storage service
    await StorageService.instance.initialize();
    
    // Initialize API service
    ApiService.instance.initialize();
    
    // Preload Google Fonts
    if (kIsWeb) {
      await GoogleFonts.pendingFonts([
        GoogleFonts.inter(),
        GoogleFonts.jetBrainsMono(),
      ]);
    }
  } catch (e) {
    debugPrint('Error initializing services: $e');
  }
}

class RapidVideoApp extends StatelessWidget {
  const RapidVideoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (context) => VideoProvider(),
        ),
        ChangeNotifierProvider(create: (_) => FirebaseService()),
        ChangeNotifierProvider(create: (_) => ApiService()),
        // Add more providers here as needed
      ],
      child: MaterialApp(
        title: 'Rapid Video - AI 2D to 3D Converter',
        debugShowCheckedModeBanner: false,
        
        // Theme configuration
        theme: ThemeData(
          primarySwatch: Colors.deepPurple,
          primaryColor: const Color(0xFF6C63FF),
          scaffoldBackgroundColor: const Color(0xFFF8F9FA),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF6C63FF),
            foregroundColor: Colors.white,
            elevation: 0,
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6C63FF),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF6C63FF), width: 2),
            ),
            filled: true,
            fillColor: Colors.white,
          ),
          cardTheme: CardTheme(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          visualDensity: VisualDensity.adaptivePlatformDensity,
        ),
        darkTheme: RapidVideoTheme.darkTheme,
        themeMode: ThemeMode.system,
        
        // Navigation
        home: const AuthWrapper(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/upload': (context) => const UploadScreen(),
          '/payment': (context) => const PaymentScreen(
                jobId: '',
                cost: 0.0,
                duration: 0,
              ),
          '/preview': (context) => const PreviewScreen(jobId: ''),
        },
        
        // Error handling
        builder: (context, child) {
          return MediaQuery(
            data: MediaQuery.of(context).copyWith(
              textScaler: TextScaler.linear(1.0), // Prevent text scaling
            ),
            child: child!,
          );
        },
        
        // Localization
        supportedLocales: const [
          Locale('en', 'US'),
        ],
        
        // Performance optimizations
        scrollBehavior: const MaterialScrollBehavior().copyWith(
          dragDevices: {
            PointerDeviceKind.mouse,
            PointerDeviceKind.touch,
            PointerDeviceKind.stylus,
            PointerDeviceKind.unknown,
          },
        ),
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text(
                    'Initializing Rapid Video...',
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF6C63FF),
                    ),
                  ),
                ],
              ),
            ),
          );
        }
        
        if (snapshot.hasData) {
          return const UploadScreen();
        }
        
        return const LoginScreen();
      },
    );
  }
}
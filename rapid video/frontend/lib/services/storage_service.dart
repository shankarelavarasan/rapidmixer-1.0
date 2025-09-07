import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  static StorageService get instance => _instance;
  StorageService._internal();

  late Box _settingsBox;
  late Box _cacheBox;
  late SharedPreferences _prefs;

  // Box names
  static const String _settingsBoxName = 'settings';
  static const String _cacheBoxName = 'cache';

  // Keys
  static const String _themeKey = 'theme_mode';
  static const String _apiBaseUrlKey = 'api_base_url';
  static const String _userPreferencesKey = 'user_preferences';
  static const String _uploadHistoryKey = 'upload_history';
  static const String _processingJobsKey = 'processing_jobs';

  Future<void> initialize() async {
    try {
      // Initialize SharedPreferences
      _prefs = await SharedPreferences.getInstance();

      // Initialize Hive boxes
      _settingsBox = await Hive.openBox(_settingsBoxName);
      _cacheBox = await Hive.openBox(_cacheBoxName);

      debugPrint('StorageService initialized successfully');
    } catch (e) {
      debugPrint('Error initializing StorageService: $e');
      rethrow;
    }
  }

  // Theme settings
  String? getThemeMode() {
    return _settingsBox.get(_themeKey);
  }

  Future<void> setThemeMode(String themeMode) async {
    await _settingsBox.put(_themeKey, themeMode);
  }

  // API settings
  String? getApiBaseUrl() {
    return _settingsBox.get(_apiBaseUrlKey);
  }

  Future<void> setApiBaseUrl(String url) async {
    await _settingsBox.put(_apiBaseUrlKey, url);
  }

  // User preferences
  Map<String, dynamic>? getUserPreferences() {
    final prefs = _settingsBox.get(_userPreferencesKey);
    return prefs != null ? Map<String, dynamic>.from(prefs) : null;
  }

  Future<void> setUserPreferences(Map<String, dynamic> preferences) async {
    await _settingsBox.put(_userPreferencesKey, preferences);
  }

  // Upload history
  List<Map<String, dynamic>> getUploadHistory() {
    final history = _cacheBox.get(_uploadHistoryKey, defaultValue: <dynamic>[]);
    return List<Map<String, dynamic>>.from(
      history.map((item) => Map<String, dynamic>.from(item)),
    );
  }

  Future<void> addToUploadHistory(Map<String, dynamic> uploadData) async {
    final history = getUploadHistory();
    history.insert(0, uploadData); // Add to beginning
    
    // Keep only last 50 uploads
    if (history.length > 50) {
      history.removeRange(50, history.length);
    }
    
    await _cacheBox.put(_uploadHistoryKey, history);
  }

  Future<void> setUploadHistory(List<dynamic> uploadHistory) async {
    final historyMaps = uploadHistory.map((item) {
      if (item is Map<String, dynamic>) {
        return item;
      } else {
        // Convert UploadJob to Map if needed
        return (item as dynamic).toJson();
      }
    }).toList();
    
    await _cacheBox.put(_uploadHistoryKey, historyMaps);
  }

  Future<void> clearUploadHistory() async {
    await _cacheBox.delete(_uploadHistoryKey);
  }

  // Processing jobs
  List<Map<String, dynamic>> getProcessingJobs() {
    final jobs = _cacheBox.get(_processingJobsKey, defaultValue: <dynamic>[]);
    return List<Map<String, dynamic>>.from(
      jobs.map((item) => Map<String, dynamic>.from(item)),
    );
  }

  Future<void> saveProcessingJob(Map<String, dynamic> jobData) async {
    final jobs = getProcessingJobs();
    
    // Update existing job or add new one
    final existingIndex = jobs.indexWhere(
      (job) => job['id'] == jobData['id'],
    );
    
    if (existingIndex != -1) {
      jobs[existingIndex] = jobData;
    } else {
      jobs.add(jobData);
    }
    
    await _cacheBox.put(_processingJobsKey, jobs);
  }

  Future<void> removeProcessingJob(String jobId) async {
    final jobs = getProcessingJobs();
    jobs.removeWhere((job) => job['id'] == jobId);
    await _cacheBox.put(_processingJobsKey, jobs);
  }

  Future<void> clearProcessingJobs() async {
    await _cacheBox.delete(_processingJobsKey);
  }

  // Generic cache methods
  T? getCached<T>(String key) {
    return _cacheBox.get(key);
  }

  Future<void> setCached<T>(String key, T value) async {
    await _cacheBox.put(key, value);
  }

  Future<void> removeCached(String key) async {
    await _cacheBox.delete(key);
  }

  // SharedPreferences methods
  String? getString(String key) {
    return _prefs.getString(key);
  }

  Future<bool> setString(String key, String value) {
    return _prefs.setString(key, value);
  }

  bool? getBool(String key) {
    return _prefs.getBool(key);
  }

  Future<bool> setBool(String key, bool value) {
    return _prefs.setBool(key, value);
  }

  int? getInt(String key) {
    return _prefs.getInt(key);
  }

  Future<bool> setInt(String key, int value) {
    return _prefs.setInt(key, value);
  }

  double? getDouble(String key) {
    return _prefs.getDouble(key);
  }

  Future<bool> setDouble(String key, double value) {
    return _prefs.setDouble(key, value);
  }

  List<String>? getStringList(String key) {
    return _prefs.getStringList(key);
  }

  Future<bool> setStringList(String key, List<String> value) {
    return _prefs.setStringList(key, value);
  }

  Future<bool> remove(String key) {
    return _prefs.remove(key);
  }

  // Clear all data
  Future<void> clearAll() async {
    await _settingsBox.clear();
    await _cacheBox.clear();
    await _prefs.clear();
  }

  // Get storage stats
  Map<String, dynamic> getStorageStats() {
    return {
      'settings_entries': _settingsBox.length,
      'cache_entries': _cacheBox.length,
      'upload_history_count': getUploadHistory().length,
      'processing_jobs_count': getProcessingJobs().length,
    };
  }

  // Cleanup old data
  Future<void> cleanup() async {
    try {
      // Remove old cache entries (older than 7 days)
      final now = DateTime.now();
      final cutoff = now.subtract(const Duration(days: 7));
      
      final history = getUploadHistory();
      final filteredHistory = history.where((item) {
        final timestamp = DateTime.tryParse(item['timestamp'] ?? '');
        return timestamp != null && timestamp.isAfter(cutoff);
      }).toList();
      
      if (filteredHistory.length != history.length) {
        await _cacheBox.put(_uploadHistoryKey, filteredHistory);
      }
      
      // Remove completed processing jobs older than 1 day
      final jobs = getProcessingJobs();
      final activeCutoff = now.subtract(const Duration(days: 1));
      final filteredJobs = jobs.where((job) {
        final timestamp = DateTime.tryParse(job['updated_at'] ?? '');
        final status = job['status'] ?? '';
        
        // Keep active jobs regardless of age
        if (['processing', 'uploading', 'queued'].contains(status)) {
          return true;
        }
        
        // Remove old completed/failed jobs
        return timestamp != null && timestamp.isAfter(activeCutoff);
      }).toList();
      
      if (filteredJobs.length != jobs.length) {
        await _cacheBox.put(_processingJobsKey, filteredJobs);
      }
      
      debugPrint('Storage cleanup completed');
    } catch (e) {
      debugPrint('Error during storage cleanup: $e');
    }
  }

  // Dispose resources
  Future<void> dispose() async {
    await _settingsBox.close();
    await _cacheBox.close();
  }
}
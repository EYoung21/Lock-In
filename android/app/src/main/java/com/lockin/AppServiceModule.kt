package com.lockin

import android.app.AppOpsManager
import android.content.Context
import android.os.Process
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import android.content.Intent
import android.provider.Settings
import android.net.Uri // Import Uri
import android.os.Build // Import Build
import android.util.Log

import com.lockin.ForegroundService


class AppServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        Log.e("AppServiceModule", "Module initialized")
    }

    override fun getName(): String {
        return "AppServiceModule"
    }

    @ReactMethod
    fun openUsageAccessSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("OPEN_SETTINGS_ERROR", "Failed to open usage access settings", e)
        }
    }

    @ReactMethod
    fun hasUsageStatsPermission(promise: Promise) {
        val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager
        
        if (appOps == null) {
            promise.reject("ERROR", "AppOpsManager not available")
            return
        }
        
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            reactApplicationContext.packageName
        )
        
        val granted = mode == AppOpsManager.MODE_ALLOWED
        promise.resolve(granted)
    }

    @ReactMethod
    fun openManageOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${reactApplicationContext.packageName}")
                )
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } else {
                // For devices below Android Marshmallow, the overlay permission is granted by default
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("OPEN_OVERLAY_PERMISSION_ERROR", "Failed to open manage overlay permission settings", e)
        }
    }

    @ReactMethod
    fun hasManageOverlayPermission(promise: Promise) {
        try {
            val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(reactApplicationContext)
            } else {
                true // Overlay permission is granted by default on Android versions below Marshmallow
            }
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("CHECK_OVERLAY_PERMISSION_ERROR", "Failed to check overlay permission", e)
        }
    }

    @ReactMethod
    fun updateWhitelistedApps(apps: ReadableArray, promise: Promise) {
        val whitelistedApps = apps.toArrayList().mapNotNull { it as? String }
        ForegroundService.updateWhitelistedApps(whitelistedApps, reactApplicationContext)
        promise.resolve(null)
    }

    @ReactMethod
    fun startService(promise: Promise) {
        try {
            android.util.Log.d("AppServiceModule", "Starting ForegroundService")
            ForegroundService.startService(reactApplicationContext)
            promise.resolve(null)
        } catch (e: Exception) {
            android.util.Log.e("AppServiceModule", "Failed to start service", e)
            promise.reject("SERVICE_START_ERROR", "Failed to start the service", e)
        }
    }
    
    @ReactMethod
    fun stopService(promise: Promise) {
        try {
            ForegroundService.stopService(reactApplicationContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SERVICE_STOP_ERROR", "Failed to stop the service", e)
        }
    }
}
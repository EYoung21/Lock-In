package com.lockin

import android.app.AppOpsManager
import android.content.Context
import android.os.Process
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray

class AppServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppServiceModule"
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
    fun updateWhitelistedApps(apps: ReadableArray, promise: Promise) {
        val whitelistedApps = apps.toArrayList().mapNotNull { it as? String }
        ForegroundService.updateWhitelistedApps(whitelistedApps, reactApplicationContext)
        promise.resolve(null)
    }

    @ReactMethod
    fun startService(promise: Promise) {
        try {
            ForegroundService.startService(reactApplicationContext)
            promise.resolve(null)
        } catch (e: Exception) {
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
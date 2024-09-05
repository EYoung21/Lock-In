package com.lockin

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
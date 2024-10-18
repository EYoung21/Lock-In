package com.lockin

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

class PermissionListenerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var usageStatsReceiver: BroadcastReceiver? = null
    private var overlayReceiver: BroadcastReceiver? = null

    override fun getName(): String = "PermissionListener"

    @ReactMethod
    fun addListener(eventName: String) {
        // Keep track of event listeners
        Log.d("PermissionListener", "addListener called for $eventName")
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Remove event listeners
        Log.d("PermissionListener", "removeListeners called")
    }

    @ReactMethod
    fun startListening() {
        Log.d("PermissionListener", "Starting to listen for permission changes")
        
        // Usage Stats permission listener
        val usageStatsFilter = IntentFilter(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        usageStatsReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                Log.d("PermissionListener", "Usage stats permission change detected")
                sendEvent("usageStatsPermissionChanged", null)
            }
        }
        reactApplicationContext.registerReceiver(usageStatsReceiver, usageStatsFilter)

        // Overlay permission listener
        val overlayFilter = IntentFilter(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
        overlayReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                Log.d("PermissionListener", "Overlay permission change detected")
                sendEvent("overlayPermissionChanged", null)
            }
        }
        reactApplicationContext.registerReceiver(overlayReceiver, overlayFilter)
    }

    @ReactMethod
    fun stopListening() {
        Log.d("PermissionListener", "Stopping permission listeners")
        usageStatsReceiver?.let { reactApplicationContext.unregisterReceiver(it) }
        overlayReceiver?.let { reactApplicationContext.unregisterReceiver(it) }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params ?: Arguments.createMap())
    }
}
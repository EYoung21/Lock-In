package com.lockin

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.app.usage.UsageStatsManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.annotation.RequiresApi
import android.util.Log

import android.app.usage.UsageEvents

class ForegroundService : Service() {

    companion object {
        private const val TAG = "ForegroundService"
        private var whitelistedApps: List<String> = emptyList()
        private var reactContext: ReactApplicationContext? = null

        fun updateWhitelistedApps(apps: List<String>, context: ReactApplicationContext) {
            whitelistedApps = apps
            reactContext = context
            android.util.Log.d("ForegroundService", "Updated whitelisted apps: $whitelistedApps")
        }

        fun startService(context: Context) {
            val intent = Intent(context, ForegroundService::class.java)
            context.startForegroundService(intent)
        }

        fun stopService(context: Context) {
            val intent = Intent(context, ForegroundService::class.java)
            context.stopService(intent)
        }
    }

    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate() {
        Log.e(TAG, "ForegroundService created")
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
    }

    private fun createOverlayView() {
        if (overlayView == null) {
            val inflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
            overlayView = inflater.inflate(R.layout.overlay_layout, null)

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                android.graphics.PixelFormat.TRANSLUCENT
            )
            params.gravity = Gravity.CENTER

            try {
                windowManager.addView(overlayView, params)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to add overlay view", e)
            }
        }
    }

    private fun removeOverlayView() {
        overlayView?.let {
            try {
                windowManager.removeView(it)
                overlayView = null
            } catch (e: Exception) {
                // Handle exception
                e.printStackTrace()
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startMonitoring()
        return START_STICKY
    }

    private fun startMonitoring() {
        handler.post(object : Runnable {
            override fun run() {
                val currentApp = getCurrentForegroundApp(this@ForegroundService)
                if (currentApp != null && !whitelistedApps.contains(currentApp)) {
                    showOverlay()
                    sendEventToReactNative("handleAppProhibited")
                } else {
                    hideOverlay()
                }
                handler.postDelayed(this, 1000) // Check every 5 seconds
            }
        })
    }

    private fun showOverlay() {
        handler.post {
            if (overlayView == null) {
                createOverlayView()
            }
            overlayView?.visibility = View.VISIBLE
            android.util.Log.d("ForegroundService", "Showing overlay")
        }
    }

    private fun hideOverlay() {
        handler.post {
            overlayView?.visibility = View.GONE
            android.util.Log.d("ForegroundService", "Hiding overlay")
        }
    }

    private fun sendEventToReactNative(eventName: String) {
        reactContext?.let { context ->
            if (context.hasActiveCatalystInstance()) {
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, null)
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun getCurrentForegroundApp(context: Context): String? {
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val endTime = System.currentTimeMillis()
        val beginTime = endTime - 1000 * 10 // Check usage in the last 10 seconds
        val usageEvents = usageStatsManager.queryEvents(beginTime, endTime)
        var currentApp: String? = null

        while (usageEvents.hasNextEvent()) {
            val event = UsageEvents.Event()
            usageEvents.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                currentApp = event.packageName
            }
        }
        android.util.Log.d("ForegroundService", "Current foreground app: $currentApp")
        return currentApp
    }

    override fun onDestroy() {
        super.onDestroy()
        removeOverlayView()
        handler.removeCallbacksAndMessages(null)
    }
}
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

class ForegroundService : Service() {

    companion object {
        private var whitelistedApps: List<String> = emptyList()
        private var reactContext: ReactApplicationContext? = null

        fun updateWhitelistedApps(apps: List<String>, context: ReactApplicationContext) {
            whitelistedApps = apps
            reactContext = context
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
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
                android.graphics.PixelFormat.TRANSLUCENT
            )
            params.gravity = Gravity.CENTER

            try {
                windowManager.addView(overlayView, params)
            } catch (e: Exception) {
                // Handle exception (e.g., permission denied)
                e.printStackTrace()
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
                handler.postDelayed(this, 5000) // Check every 5 seconds
            }
        })
    }

    private fun showOverlay() {
        handler.post {
            if (overlayView == null) {
                createOverlayView()
            }
            overlayView?.visibility = View.VISIBLE
        }
    }

    private fun hideOverlay() {
        handler.post {
            overlayView?.visibility = View.GONE
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

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    private fun getCurrentForegroundApp(context: Context): String? {
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val endTime = System.currentTimeMillis()
        val beginTime = endTime - 1000 * 60 // Check usage in the last 1 minute
        val usageStatsList = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, beginTime, endTime)

        return usageStatsList?.maxByOrNull { it.lastTimeUsed }?.packageName
    }

    override fun onDestroy() {
        super.onDestroy()
        removeOverlayView()
        handler.removeCallbacksAndMessages(null)
    }
}
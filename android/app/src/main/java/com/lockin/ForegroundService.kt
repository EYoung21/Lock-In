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
import androidx.core.app.NotificationCompat
import android.app.NotificationChannel
import android.app.NotificationManager
import android.widget.Button
import android.content.pm.ServiceInfo

import android.app.usage.UsageEvents

class ForegroundService : Service() {

    companion object {
        private const val TAG = "ForegroundService"
        private var blacklistedApps: List<String> = emptyList()
        private var reactContext: ReactApplicationContext? = null

        fun updateBlacklistedApps(apps: List<String>, context: ReactApplicationContext) {
            blacklistedApps = apps
            reactContext = context
            android.util.Log.d("ForegroundService", "Updated blacklisted apps: $blacklistedApps")
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

            // Find and set up the close button
            val closeButton = overlayView?.findViewById<Button>(R.id.closeButton)
            closeButton?.setOnClickListener {
                hideOverlay()
            }

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
        startForeground()
        return START_STICKY
    }

    private fun startForeground() {
        val channelId = "ForegroundServiceChannel"
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setContentTitle("App Monitor")
            .setContentText("Monitoring app usage")
            .setSmallIcon(R.drawable.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_LOW)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Foreground Service Channel",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(1, notificationBuilder.build(), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
        } else {
            startForeground(1, notificationBuilder.build())
        }
    }

    private fun updateOverlayVisibility(show: Boolean) {
        if (show && overlayView == null) {
            createOverlayView()
        }
        overlayView?.visibility = if (show) View.VISIBLE else View.GONE
    }

    private fun startMonitoring() {
        handler.post(object : Runnable {
            override fun run() {
                val currentApp = getCurrentForegroundApp(this@ForegroundService)
                if (currentApp != null && blacklistedApps.contains(currentApp)) {
                    // Redirect to Lock In app
                    val lockInIntent = packageManager.getLaunchIntentForPackage("com.lockin")
                    if (lockInIntent != null) {
                        lockInIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        startActivity(lockInIntent)
                        sendEventToReactNative("handleAppProhibited")
                    } else {
                        Log.e(TAG, "Failed to launch Lock In app")
                    }
                }
                handler.postDelayed(this, 500) // Check every half second for quicker response
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

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    private fun getCurrentForegroundApp(context: Context): String? {
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val time = System.currentTimeMillis()
        val appList = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 1000, time)
        if (appList != null && appList.size > 0) {
            val sortedMap = appList.sortedByDescending { it.lastTimeUsed }
            return sortedMap[0].packageName
        }
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        removeOverlayView()
        handler.removeCallbacksAndMessages(null)
    }
}
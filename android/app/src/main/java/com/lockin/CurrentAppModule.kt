package com.lockin.modules


import android.app.ActivityManager
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactMethod


class CurrentAppModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {


    override fun getName(): String {
        return "CurrentAppModule"
    }


    @ReactMethod
    fun getCurrentRunningApp(callback: Callback) {
        val context: Context = reactApplicationContext
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val currentApp = activityManager.runningAppProcesses.firstOrNull()


        if (currentApp != null) {
            callback.invoke(currentApp.processName)
        } else {
            callback.invoke("unknown")
        }
    }
}

package com.lockin

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView
import com.facebook.react.modules.core.PermissionListener
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler
import android.util.Log

class MainActivity : ReactActivity() {

    private var mPermissionListener: PermissionListener? = null

    override fun getMainComponentName(): String? {
        return "LockIn"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.e("MainApp", "Application started")
        super.onCreate(savedInstanceState)
        // Remove setContentView for splash screen here
        // SplashScreen.show(this) // If using react-native-splash-screen
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        mPermissionListener?.onRequestPermissionsResult(requestCode, permissions, grantResults)
    }

    fun setPermissionListener(listener: PermissionListener?) {
        mPermissionListener = listener
    }

    override fun onBackPressed() {
        if (getReactInstanceManager() != null) {
            getReactInstanceManager().onBackPressed()
        } else {
            super.onBackPressed()
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        if (getReactInstanceManager() != null) {
            getReactInstanceManager().onNewIntent(intent)
        }
    }

    override fun onPause() {
        super.onPause()
        if (getReactInstanceManager() != null) {
            getReactInstanceManager().onHostPause(this)
        }
    }

    override fun onResume() {
        super.onResume()
        if (getReactInstanceManager() != null) {
            getReactInstanceManager().onHostResume(this, this)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (getReactInstanceManager() != null) {
            getReactInstanceManager().onHostDestroy(this)
        }
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return object : ReactActivityDelegate(this, mainComponentName) {
            override fun createRootView(): ReactRootView {
                return RNGestureHandlerEnabledRootView(this@MainActivity)
            }
        }
    }
}
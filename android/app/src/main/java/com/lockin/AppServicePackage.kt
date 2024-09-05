package com.lockin

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.JavaScriptModule
import com.facebook.react.uimanager.ViewManager
import java.util.Collections.emptyList

class AppServicePackage : ReactPackage {

    override fun createNativeModules(reactContext: ReactApplicationContext): List<ReactContextBaseJavaModule> {
        return listOf(AppServiceModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}

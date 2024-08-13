package com.lockin

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.lockin.modules.CurrentAppPackage // Import your package
import com.facebook.react.PackageList // Import PackageList

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> {
            // Add your custom package here along with the packages from PackageList
            return PackageList(this).packages + listOf(CurrentAppPackage())
        }

        override fun getJSMainModuleName(): String = "index"

        // Implement the abstract method
        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        // Remove New Architecture Entry Point if not using new architecture
    }
}

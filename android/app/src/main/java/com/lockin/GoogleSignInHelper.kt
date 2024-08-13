package com.lockin

import android.app.Activity
import android.content.Intent
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import com.google.api.services.drive.DriveScopes
import com.google.android.gms.common.api.Scope

object GoogleSignInHelper {
    private const val RC_SIGN_IN = 9001
    private lateinit var googleSignInClient: GoogleSignInClient

    fun initialize(activity: Activity) {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestIdToken("YOUR_CLIENT_ID.apps.googleusercontent.com")
            .requestScopes(Scope(DriveScopes.DRIVE_FILE))
            .build()

        googleSignInClient = GoogleSignIn.getClient(activity, gso)

        val signInIntent = googleSignInClient.signInIntent
        activity.startActivityForResult(signInIntent, RC_SIGN_IN)
    }

    fun handleSignInResult(requestCode: Int, resultCode: Int, data: Intent?): Boolean {
        if (requestCode == RC_SIGN_IN) {
            val task: Task<GoogleSignInAccount> = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)
                // Handle successful sign-in here
            } catch (e: ApiException) {
                // Handle sign-in failure
            }
            return true
        }
        return false
    }
}

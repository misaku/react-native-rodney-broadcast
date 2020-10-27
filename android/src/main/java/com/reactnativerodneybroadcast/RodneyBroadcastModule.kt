package com.reactnativerodneybroadcast

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Handler
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

class RodneyBroadcastModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private var reciverList: ArrayList<BroadcastReceiver> = ArrayList()
  override fun getName(): String {
    return "RodneyBroadcast"
  }

  private fun displayScanResult(initiatingIntent: Intent, actionName: String, eventName: String) {
    val map: WritableMap = WritableNativeMap()
    map.putString("data", initiatingIntent.getStringExtra(actionName))
    this.sendEvent(eventName, map)
  }

  @ReactMethod
  fun unregister(idx: Int, promise: Promise) {
    if(this.reciverList.size>0) {
      val reciver = this.reciverList.get(idx)
      this.reactApplicationContext.unregisterReceiver(reciver)
      this.reciverList.remove(reciver)
    }
    promise.resolve(true)
  }

  // Example method
  // See https://facebook.github.io/react-native/docs/native-modules-android
  @ReactMethod
  fun register(filterName: String, actionName: String, eventName: String, promise: Promise) {
    val filter = IntentFilter()
    filter.addAction(filterName)

    val myBroadcastReceiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action

        if (action == filterName) {
          try {
            displayScanResult(intent, actionName, eventName)
          } catch (e: Exception) {
            Log.d("ReactNativeJS", "Exception in displayScanResult in BroadcastReceiver is:$e")
          }

        }
      }
    }
    this.reactApplicationContext.registerReceiver(myBroadcastReceiver, filter)

    this.reciverList.add(myBroadcastReceiver)

    promise.resolve(this.reciverList.indexOf(myBroadcastReceiver))

  }

  private fun sendEvent(eventName: String, map: WritableMap) {

    try {
      this.reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventName, map)
    } catch (e: Exception) {
      Log.d("ReactNativeJS", "Exception in sendEvent in BroadcastReceiver is:$e")
    }
  }

}

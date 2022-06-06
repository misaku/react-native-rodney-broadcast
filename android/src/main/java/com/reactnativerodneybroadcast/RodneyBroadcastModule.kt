package com.reactnativerodneybroadcast

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter


class RodneyBroadcastModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private var reciverList: ArrayList<BroadcastReceiver> = ArrayList()
  override fun getName(): String {
    return "RodneyBroadcast"
  }

  /**
   * Method used to prepare and get data to send
   * @param initiatingIntent Intent
   * @param actionNames List<String> of names to use for get data
   * @param eventName String name of event
   *
   * @returns Void
   */
  private fun displayScanResult(initiatingIntent: Intent, actionNames: List<String>, eventName: String) {
    val map: WritableMap = WritableNativeMap()
    for (actionName in actionNames){
      map.putString(actionName, initiatingIntent.getStringExtra(actionName))
    }
    this.sendEvent(eventName, map)
  }

  /**
   * Method used to register broadcast reciver
   * @param filterName Sring name used to filter
   * @param actionNames Sring names used to map
   *
   * @returns Promise<bolean>
   */
  @ReactMethod
  fun unregister(idx: Int, promise: Promise) {
    if(this.reciverList.size>0) {
      val reciver = this.reciverList.get(idx)
      this.reactApplicationContext.unregisterReceiver(reciver)
      this.reciverList.remove(reciver)
    }
    promise.resolve(true)
  }

  /**
   * Method used to register broadcast reciver
   * @param filterName Sring name used to filter
   * @param actionNames Sring names used to map
   * @param eventName Sring names used to evente emitter
   *
   * @returns Promise<Int> index of reciver
   */
  @ReactMethod
  fun register(filterName: String, actionNames: String, eventName: String, promise: Promise) {

    val filter = IntentFilter()
    filter.addAction(filterName)

    val myBroadcastReceiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action

        if (action == filterName) {
          try {
            displayScanResult(intent, actionNames.split(";"), eventName)
          } catch (e: Exception) {
            Log.d("RNRodneyBroadcast", "Exception in displayScanResult in BroadcastReceiver is:$e")
          }

        }
      }
    }

    this.reactApplicationContext.registerReceiver(myBroadcastReceiver, filter)

    this.reciverList.add(myBroadcastReceiver)

    promise.resolve(this.reciverList.indexOf(myBroadcastReceiver))

  }

  /**
   * Method used to simulate event
   * @param actionName Sring name of broadcast intent
   * @param putExtra Sring names used to map
   * @param value Sring names used to map
   *
   * @returns Promise<Int> index of reciver
   */
  @ReactMethod
  fun sendBroadcast(actionName: String, putExtra: String, value: String, promise: Promise){
    Intent().also { intent ->
      intent.setAction(actionName)
      intent.putExtra(putExtra, value)
      this.reactApplicationContext.sendBroadcast(intent)
    }
    promise.resolve(true);
  }

  /**
   * Send event to device event emitter
   * @param eventName Sring of event name
   * @param map WritableMap to send
   *
   * @returns Void
   */
  private fun sendEvent(eventName: String, map: WritableMap) {

    try {
      this.reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventName, map)
    } catch (e: Exception) {
      Log.d("RNRodneyBroadcast", "Exception in sendEvent in BroadcastReceiver is:$e")
    }
  }

}

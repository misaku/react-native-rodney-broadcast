@objc(RodneyBroadcast)
class RodneyBroadcast: RCTEventEmitter & NSObject{
    var reciverList = []

    /**
* Method used to prepare and get data to send
* @param actionNames List<String> of names to use for get data
* @param eventName String name of event
*
* @returns function
*/
    @objc func displayScanResult(actionNames: Array<String>, eventName: String) -> (NSNotification) -> Void {

        func notification(notification: NSNotification) -> void {
          var message: [String: String] = [:]

            for actionName in actionNames {
                message[actionName] = notification[actionName]
            }
            self.sendEventRodney(eventName: eventName, map: message)
        }

        return notification
    }

    /**
* Send event to device event emitter
* @param eventName Sring of event name
* @param map WritableMap to send
*
* @returns Void
*/
    private func sendEventRodney(eventName: String, map: [String: String]) ->Void{

         try{
               self.sendEvent(withName: name, body: map)
          }catch(e){
              println("RNRodneyBroadcast", "Exception in sendEventRodney in BroadcastReceiver is",e,separator:' ')
          }
    }


/**
 * Method used to register broadcast reciver
 * @param filterName Sring name used to filter
 * @param actionNames Sring names used to map
 *
 * @returns Promise<Bool>
 */
    @objc
    func unregister(idx: Int, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Bool {
        if (self.reciverList.size > 0) {
            let reciver = self.reciverList[idx]
            NotificationCenter.default
                    .removeObserver(self, name: reciver, object: nil)
            self.reciverList.remove(reciver)
        }
        resolve(true)
    }

/**
 * Method used to register broadcast reciver
 * @param filterName Sring name used to filter
 * @param actionNames Sring names used to map
 * @param eventName Sring names used to evente emitter
 *
 * @returns Promise<Int> index of reciver
 */
    @objc
    func register(filterName: String, actionNames: String, eventName: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Int {

        let notificationName = Notification.Name(filterName)

        NotificationCenter.default.addObserver(self, selector: #selector(self.displayScanResult(actionNames: actionNames.split(separator: ";"), eventName: eventName)), name: notificationName, object: nil)

        self.reciverList.append(notificationName)

        resolve(find(self.reciverList, notificationName)!)

    }

/**
 * Method used to simulate event
 * @param actionName Sring name of broadcast intent
 * @param putExtra Sring names used to map
 * @param value Sring names used to map
 *
 * @returns Promise<Bool> index of reciver
 */
    @objc
    func sendBroadcast(actionName: String, putExtra: String, value: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Bool {
        var message:[String:String] = []
        message[putExtra] = value;
        NotificationCenter.default
                .post(name: NSNotification.Name(actionName),
                 object: nil,
                 userInfo: message)

      resolve(true)
    }


}

@objc(RodneyBroadcast)
class RodneyBroadcast: RCTEventEmitter{
    var reciverList = []
    var hasListener: Bool = false

    override func startObserving() {
        hasListener = true
    }

    override func stopObserving() {
        hasListener = false
    }

    var listSuportedEvents:[String] = []

    override func supportedEvents() -> [String]! {
       return listSuportedEvents
    }

    @objc(addName:)
        func addName(name:String)->Void{
            listSuportedEvents.append(name)
    }
    /**
* Method used to prepare and get data to send
* @param actionNames List<String> of names to use for get data
* @param eventName String name of event
*
* @returns function
*/
    private func displayScanResult(actionNames: Array<String>, eventName: String) -> (NSNotification) -> Void {

        func notification(notification: NSNotification) -> Void {
          var message: [String: String] = [:]

            for actionName in actionNames {
                message[actionName] = notification[actionName]
            }

            self.sendEvent(withName: eventName, body: message)
        }

        return notification
    }


/**
 * Method used to register broadcast reciver
 * @param filterName Sring name used to filter
 * @param actionNames Sring names used to map
 *
 * @returns Promise<Bool>
 */
    @objc(unregister:withResolver:withRejecter:)
    func unregister(idx: Int, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
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
    @objc(register:withActionNames:withEventName:withResolver:withRejecter:)
    func register(filterName: String, actionNames: String, eventName: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {

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
    @objc(sendBroadcast:withPutExtra:withValue:withResolver:withRejecter:)
    func sendBroadcast(actionName: String, putExtra: String, value: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var message:[String:String] = []
        message[putExtra] = value;
        NotificationCenter.default
                .post(name: NSNotification.Name(actionName),
                 object: nil,
                 userInfo: message)

      resolve(true)
    }


}

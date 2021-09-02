@objc(RodneyBroadcast)
class RodneyBroadcast: RCTEventEmitter {
    var reciverList: [String] = []
    var hasListener: Bool = false
    var actionNameList: [String]=[]
    var eventName: String=""

    override func startObserving() {
        hasListener = true
    }

    override func stopObserving() {
        hasListener = false
    }

    var listSuportedEvents: [String] = []

    override func supportedEvents() -> [String]! {
        return listSuportedEvents
    }

    @objc(addName:)
    func addName(name: String) -> Void {
        listSuportedEvents.append(name)
    }

    /**
* Method used to prepare and get data to send
* @param actionNames List<String> of names to use for get data
* @param eventName String name of event
*
* @returns function
*/
    @objc func displayScanResult(notification:NSNotification) ->  Void {

            var message: [String: String] = [:]

            for actionName in self.actionNameList {
                message[actionName] = notification.userInfo?[actionName] as? String
            }

            self.sendEvent(withName: self.eventName, body: message)
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
        if (!self.reciverList.isEmpty) {
            let reciver = self.reciverList[idx]
            NotificationCenter.default
                    .removeObserver(self, name: NSNotification.Name(reciver), object: nil)
            self.reciverList.remove(at: idx)
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
        self.actionNameList = actionNames.components(separatedBy: ";")
        self.eventName = eventName

        NotificationCenter.default.addObserver(self, selector: #selector(self.displayScanResult(notification:)), name: notificationName, object: nil)

        self.reciverList.append(filterName)

        resolve(self.reciverList.firstIndex(of: filterName))

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
        var message: [String: String] = [:]
        message[putExtra] = value;
        NotificationCenter.default
                .post(name: NSNotification.Name(actionName),
                object: nil,
                userInfo: message)

        resolve(true)
    }


}

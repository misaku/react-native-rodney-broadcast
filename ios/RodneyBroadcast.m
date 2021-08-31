#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RodneyBroadcast, NSObject, RCTEventEmitter)

RCT_EXTERN_METHOD(register:(String)filterName withActionNames:(String)actionNames withEventName:(String)eventName
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(unregister:(Int)idx withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendBroadcast:(String)actionName withPutExtra:(String)putExtra
                 withValue:(String)value
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(displayScanResult:(Array<String>)actionNames withEventName:(String)eventName)


@end

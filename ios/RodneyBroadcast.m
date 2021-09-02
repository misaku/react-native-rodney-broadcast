#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RodneyBroadcast, RCTEventEmitter)

RCT_EXTERN_METHOD(register:(NSString)filterName withActionNames:(NSString)actionNames withEventName:(NSString)eventName
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(unregister:(int)idx withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendBroadcast:(NSString)actionName withPutExtra:(NSString)putExtra
                 withValue:(NSString)value
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(addName:(NSString)name)
@end

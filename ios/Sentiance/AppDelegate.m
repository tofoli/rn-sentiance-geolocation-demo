/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <RNSentiance.h>
@import SENTSDK;

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"Sentiance"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  RNSentiance *sentiance = [bridge moduleForClass:RNSentiance.class];
  [self initializeSentianceSdk:launchOptions  sentiance:sentiance];

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void) initializeSentianceSdk:( NSDictionary*) launchOptions sentiance:( RNSentiance*)sentiance {

  NSString *APP_ID = @"***";
  NSString *SECRET = @"***";

  //user linking disabled
  //SENTConfig *config = [[SENTConfig alloc] initWithAppId:APP_ID secret:SECRET link:nil launchOptions:launchOptions];


  //user linking enabled
  //when user linking is enabled 'SDKMetaUserLink' event will be sent to JS with parameter {installId}
  //after successfull linking RNSentiance.metaUserLinkCallback(true) must be called form JS otherwise SDK will keep waiting for userlinking to be done

  //uncomment below code if user linking is enabled
  SENTConfig *config = [[SENTConfig alloc] initWithAppId:APP_ID secret:SECRET link:sentiance.getMetaUserLinker launchOptions:launchOptions];

  [config setDidReceiveSdkStatusUpdate:sentiance.getSdkStatusUpdateHandler];


  [[SENTSDK sharedInstance] initWithConfig:config success :^{
    NSLog(@"initWithConfig Success");
  } failure:^(SENTInitIssue issue) {
    NSLog(@"initWithConfig Failure issue: %lu", (unsigned long)issue);
  }];
}

@end

## Demo Sentiance with Background Geolocation

### Purpose

To test the integration of [Sentiance](https://github.com/sentiance/react-native-sentiance) together with [React Native Background Geolocation](https://github.com/transistorsoft/react-native-background-geolocation)

### Debug
#### Background Geolocation
Change `APP_IDENTIFY` constant in file `src/task/GeolocationTask.js`

```js
import  BackgroundGeolocation  from  'react-native-background-geolocation';
import  DeviceInfo  from  'react-native-device-info';
import  Log  from  'react-native-device-log';

const  APP_IDENTIFY = '****'; // << -- here

export  default  class  GeolocationTask {
```
Is only a string identifier to separate information on the server side
To view the information, go to `http://tracker.transistorsoft.com/APP_IDENTIFY`

#### Sentiance
Configure the access keys in the files `src/task/SentianceTask.js`

`ios/Sentiance/AppDelegate.m`
```objc
- (void) initializeSentianceSdk:( NSDictionary*) launchOptions sentiance:( RNSentiance*)sentiance {

  NSString *APP_ID = @"***"; // << -- here
  NSString *SECRET = @"***"; // << -- here

  //user linking disabled
  //SENTConfig *config = [[SENTConfig alloc] initWithAppId:APP_ID secret:SECRET link:nil launchOptions:launchOptions];
```

`android/app/src/main/java/com/sentiance/MainApplication.java`
```java
public class MainApplication extends Application implements ReactApplication {
  private static final String SENTIANCE_APP_ID = "***"; // << -- here
  private static final String SENTIANCE_SECRET = "***"; // << -- here

  private final RNSentiancePackage rnSentiancePackage = new RNSentiancePackage();
```

## Demo Sentiance with Background Geolocation

### Purpose

To test the integration of [Sentiance]([https://github.com/sentiance/react-native-sentiance](https://github.com/sentiance/react-native-sentiance)) together with [React Native Background Geolocation]([https://github.com/transistorsoft/react-native-background-geolocation](https://github.com/transistorsoft/react-native-background-geolocation))

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
Configure the access keys in the file `src/task/SentianceTask.js`

```js
import  RNSentiance  from  'react-native-sentiance';
import { NativeEventEmitter } from  'react-native';
import  AsyncStorage  from  '@react-native-community/async-storage';
import  Log  from  'react-native-device-log';

const  APP_ID = '****'; // << -- here
const  SECRET = '****'; // << -- here

export  default  class  SentianceTask {
```

import BackgroundGeolocation from 'react-native-background-geolocation';
import DeviceInfo from 'react-native-device-info';
import Log from 'react-native-device-log';

const APP_IDENTIFY = '****';

export default class GeolocationTask {
  static listeners() {
    BackgroundGeolocation.onLocation(event => Log.info('👻 onLocation', event));
    BackgroundGeolocation.onMotionChange(event => Log.info('👻 onMotionChange', event));
    BackgroundGeolocation.onHeartbeat(event => Log.info('👻 onHeartbeat', event));
    BackgroundGeolocation.onHttp(event => Log.info('👻 onHttp', event));
    BackgroundGeolocation.onGeofence(event => Log.info('👻 onGeofence', event));
    BackgroundGeolocation.onSchedule(event => Log.info('👻 onSchedule', event));
    BackgroundGeolocation.onActivityChange(event => Log.info('👻 onActivityChange', event));
    BackgroundGeolocation.onProviderChange(event => Log.info('👻 onProviderChange', event));
    BackgroundGeolocation.onGeofencesChange(event => Log.info('👻 onGeofencesChange', event));
    BackgroundGeolocation.onPowerSaveChange(event => Log.info('👻 onPowerSaveChange', event));
    BackgroundGeolocation.onConnectivityChange(event => Log.info('👻 onConnectivityChange', event));
    BackgroundGeolocation.onEnabledChange(event => Log.info('👻 onEnabledChange', event));
    BackgroundGeolocation.onNotificationAction(event => Log.info('👻 onNotificationAction', event));
  }

  static async schedule() {
    const state = await BackgroundGeolocation.ready({
      url: `http://tracker.transistorsoft.com/locations/${APP_IDENTIFY}`,
      params: BackgroundGeolocation.transistorTrackerParams(DeviceInfo),
      stationaryRadius: 30,
      distanceFilter: 10,
      enableHeadless: true,
      stopOnTerminate: false,
      startOnBoot: true,
      foregroundService: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_DEBUG,
      debug: false,
      disableLocationAuthorizationAlert: true,
      autoSync: true,
      batchSync: true,
      maxBatchSize: 50,
      maxDaysToPersist: 30,
      locationsOrderDirection: 'DESC',
    });

    if (!state.enabled)
      await BackgroundGeolocation.start();
  }

  static timer() {
    BackgroundGeolocation.registerHeadlessTask(async (event) => {
      Log.info('🤖 registerHeadlessTask', event);

      if (event.name === 'terminate')
        await BackgroundGeolocation.removeAllListeners();
    });
  }

  static async cancel() {
    Log.info('🛑 Geolocation está sendo parado');
    const stopResponse = await BackgroundGeolocation.stop();
    Log.info('🛑 Geolocation foi parado', stopResponse);
  }
}

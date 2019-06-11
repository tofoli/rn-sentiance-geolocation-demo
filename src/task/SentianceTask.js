import RNSentiance from 'react-native-sentiance';
import { Platform, NativeEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Log from 'react-native-device-log';

export default class SentianceTask {
  static listeners() {
    const sentianceEmitter = new NativeEventEmitter(RNSentiance);
    this.subSDKUserActivityUpdate = sentianceEmitter.addListener(
      'SDKUserActivityUpdate',
      event => Log.info('🙉 SDKUserActivityUpdate', event)
    );
    this.subSDKStatusUpdate = sentianceEmitter.addListener(
      'SDKStatusUpdate',
      event => Log.info('🙉 SDKStatusUpdate', event)
    );
    this.subSDKMetaUserLink = sentianceEmitter.addListener(
      'SDKMetaUserLink',
      async event => {
        Log.info('🙉 SDKMetaUserLink', event)

        if (Platform.OS === 'ios')
          await RNSentiance.metaUserLinkCallback(true);
      }
    );
  }

  static async schedule() {
    const userName = await AsyncStorage.getItem('@auth/userName');
    if (!userName) {
      Log.info('🗄 User is offline');
      return await SentianceTask.cancel();
    }

    Log.info(`🗄 User logged in: ${userName}`);

    await RNSentiance.addUserMetadataField('userName', userName);
    const { startStatus } = await RNSentiance.getSdkStatus();
    Log.info(`⚛️ Sentiance status ${startStatus}`);

    if (startStatus !== 'STARTED') {
      Log.info('⚛️ Sentiance will be initialized');
      const startResponse = await RNSentiance.start();
      Log.info('⚛️ Sentiance has been initialized', startResponse);
    } else {
      Log.info('⚛️ Sentiance was already initialized');
    }
  }

  static timer() {}

  static async cancel() {
    Log.info('🛑 Sentiance is being stopped');
    if (this.subSDKUserActivityUpdate)
      this.subSDKUserActivityUpdate.remove();

    if (this.subSDKStatusUpdate)
      this.subSDKStatusUpdate.remove();

    if (this.subSDKMetaUserLink)
      this.subSDKMetaUserLink.remove();

    const stopResponse = await RNSentiance.stop();
    Log.info('🛑 Sentiance was stopped', stopResponse);
  }
}

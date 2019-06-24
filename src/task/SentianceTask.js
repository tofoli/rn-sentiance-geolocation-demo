import RNSentiance from 'react-native-sentiance';
import { NativeEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Log from 'react-native-device-log';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function saveUserSentiance(userSentianceId) {
  const userId = await AsyncStorage.getItem('@sentiance/userId');

  if (userId !== userSentianceId) {
    Log.info(`📤 Sentiance link user ${userSentianceId}`);
    // post to API
    await AsyncStorage.setItem('@sentiance/userId', userSentianceId);
  }
}

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
        await saveUserSentiance(event.installId);
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

    if (!await RNSentiance.isInitialized()) {
      Log.info('🛑 Sentiance is not initialized');

      // The initialization is done by the native code, if it has not yet started, it waits 10 seconds and does shedule again
      await delay(10000);
      return await SentianceTask.schedule();
    } else {
      Log.info('❇️ Sentiance is initialized');
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

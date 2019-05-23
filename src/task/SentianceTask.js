import RNSentiance from 'react-native-sentiance';
import { NativeEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Log from 'react-native-device-log';

const APP_ID = '****';
const SECRET = '****';

export default class SentianceTask {
  static listeners() {
    const sentianceEmitter = new NativeEventEmitter(RNSentiance);
    this.subTripTimeout = sentianceEmitter.addListener(
      'TripTimeout',
      () => Log.info('🙉 TripTimeout')
    );
    this.subSDKStatusUpdate = sentianceEmitter.addListener(
      'SDKStatusUpdate',
      () => Log.info('🙉 SDKStatusUpdate')
    );
    this.subSDKMetaUserLink = sentianceEmitter.addListener(
      'SDKMetaUserLink',
      () => Log.info('🙉 SDKMetaUserLink')
    );
  }

  static async schedule() {
    try {
      if (!await RNSentiance.isInitialized()) {
        Log.info('❇️ Sentiance is not configured');
        const initResponse = await RNSentiance.init(APP_ID, SECRET);
        Log.debug(`❇️ Sentiance has been successfully configured => ${initResponse}`);
      } else {
        Log.info('❇️ Sentiance was already configured');
      }
    } catch(e) {
      Log.error(`❇️ Sentiance failed to configure => ${e.message}`);
    }

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
    if (this.subTripTimeout)
      this.subTripTimeout.remove();

    if (this.subSDKStatusUpdate)
      this.subSDKStatusUpdate.remove();

    if (this.subSDKMetaUserLink)
      this.subSDKMetaUserLink.remove();

    const stopResponse = await RNSentiance.stop();
    Log.info('🛑 Sentiance was stopped', stopResponse);
  }
}

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
        Log.info('❇️ Sentiance não está configurado');
        const initResponse = await RNSentiance.init(APP_ID, SECRET);
        Log.debug(`❇️ Sentiance foi configurado com sucesso => ${initResponse}`);
      } else {
        Log.info('❇️ Sentiance já estava configurado');
      }
    } catch(e) {
      Log.error(`❇️ Sentiance deu erro ao configurar => ${e.message}`);
    }

    const userName = await AsyncStorage.getItem('@auth/userName');
    if (!userName) {
      Log.info('🗄 Usuário não está logado');
      return await SentianceTask.cancel();
    }

    Log.info(`🗄 Usuário logado: ${userName}`);

    await RNSentiance.addUserMetadataField('userName', userName);
    const { startStatus } = await RNSentiance.getSdkStatus();
    Log.info(`⚛️ Sentiance status ${startStatus}`);

    if (startStatus !== 'STARTED') {
      Log.info('⚛️ Sentiance vai ser inicializado');
      const startResponse = await RNSentiance.start();
      Log.info('⚛️ Sentiance foi inicializado', startResponse);
    } else {
      Log.info('⚛️ Sentiance já estava inicializado');
    }
  }

  static async cancel() {
    Log.info('🛑 Sentiance está sendo parado');
    if (this.subTripTimeout)
      this.subTripTimeout.remove();

    if (this.subSDKStatusUpdate)
      this.subSDKStatusUpdate.remove();

    if (this.subSDKMetaUserLink)
      this.subSDKMetaUserLink.remove();

    const stopResponse = await RNSentiance.stop();
    Log.info('🛑 Sentiance foi parado', stopResponse);
  }
}

import React, { PureComponent } from 'react';
import { StyleSheet, ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Log, { LogView } from 'react-native-device-log';
import Screens from './src/screens';

export default class App extends PureComponent {
  state = {
    isAppReady: false,
    isLogged: false,
    showLog: false,
  };

  async componentDidMount() {
    let newState = { isAppReady: true };
    try {
      const userName = await AsyncStorage.getItem('@auth/userName');
      newState.isLogged = !!userName;

      await Log.init(AsyncStorage, {
        logToConsole : true,
        logRNErrors : true,
        maxNumberToRender : 500,
        maxNumberToPersist : 500,
      });
    } finally {
      this.setState(newState)
    }
  }

  render() {
    const { isAppReady, isLogged, showLog } = this.state;

    if (!isAppReady) {
      return (
        <View style={styles.containerActivityIndicator}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Screens isLogged={isLogged} />

        <TouchableOpacity style={styles.showLogRoot} onPress={() => this.setState({ showLog: !showLog })}>
          <Text style={styles.showLogText}>{showLog ? '🙉': '🙈'}</Text>
        </TouchableOpacity>

        <View style={[styles.logViewRoot, { top: showLog ? 140 : 20000 }]}>
          <LogView inverted={false} multiExpanded={true} timeStampFormat='HH:mm:ss' />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  showLogRoot: {
    position: 'absolute',
    right: 20,
    top: 70,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6890DD',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1.2,
  },
  showLogText: {
    fontSize: 30,
  },
  logViewRoot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  containerActivityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

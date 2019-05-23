import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Screens from './src/screens';

export default class App extends Component {
  state = {
    isAppReady: false,
    isLogged: false,
  };

  async componentDidMount() {
    let newState = { isAppReady: true };
    try {
      const userName = await AsyncStorage.getItem('@auth/userName');
      newState.isLogged = !!userName;
    } finally {
      this.setState(newState)
    }
  }

  render() {
    const { isAppReady, isLogged } = this.state;

    if (!isAppReady) {
      return (
        <View style={styles.container}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <Screens isLogged={isLogged} />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

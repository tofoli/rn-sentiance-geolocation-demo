import React, { Component } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class Home extends Component {
  static navigationOptions = {
    title: 'Home',
  };

  state = {
    userName: '',
  }

  async componentDidMount() {
    const userName = await AsyncStorage.getItem('@auth/userName');
    this.setState({ userName });
  }

  _logoff = async () => {
    await AsyncStorage.removeItem('@auth/userName');
    this.props.navigation.navigate('LoginStack');
  }

  render() {
    const { userName } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome {userName}</Text>

        <Button
          onPress={this._logoff}
          title="Logoff"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

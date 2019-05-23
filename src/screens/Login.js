import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class Home extends Component {
  static navigationOptions = {
    title: 'Login',
  };

  state = {
    userName: '',
  }

  _login = async () => {
    const { userName } = this.state;
    await AsyncStorage.setItem('@auth/userName', userName);
    this.props.navigation.navigate('AppStack');
  }

  render() {
    const { userName } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Sentiance Demo</Text>

        <TextInput
          style={styles.input}
          placeholder="User Name"
          value={userName}
          onChangeText={userName => this.setState({ userName })}
          onSubmitEditing={this._login}
        />

        <Button
          disabled={userName.trim().length === 0}
          onPress={this._login}
          title="Login"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 40,
    backgroundColor: '#fff',
    borderBottomColor: '#c3c3c3',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
});

import React, { PureComponent } from 'react';
import { StyleSheet, View, Text, Button, SectionList, NativeEventEmitter, TouchableOpacity, Clipboard } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNSentiance from 'react-native-sentiance';
import Task from '../task';

export default class Home extends PureComponent {
  static navigationOptions = {
    title: 'Home',
  };

  state = {
    userName: '',
    sentianceId: '',
    sentianceVersion: '',
    sentianceIsInitialized: '',
    sentianceStatus: [],
  }

  async componentDidMount() {
    let newState = { ...this.state };
    Task.listeners();
    Task.schedule();

    newState.userName = await AsyncStorage.getItem('@auth/userName');

    if (await RNSentiance.isInitialized()) {
      newState.sentianceId = await RNSentiance.getUserId();
      const status = await RNSentiance.getSdkStatus();
      newState.sentianceVersion = await RNSentiance.getVersion();
      newState.sentianceIsInitialized = String(await RNSentiance.isInitialized());

      newState.sentianceStatus = this._sentianceStatusToArray(status);
    }

    this.setState(newState);

    const sentianceEmitter = new NativeEventEmitter(RNSentiance);
    this.subSDKStatusUpdate = sentianceEmitter.addListener(
      'SDKStatusUpdate',
      status => this.setState({ status: this._sentianceStatusToArray(status) })
    );
  }

  _logoff = async () => {
    await AsyncStorage.removeItem('@auth/userName');
    await Task.cancel();
    this.props.navigation.navigate('LoginStack');
  };

  _sentianceStatusToArray = status => Object.keys(status).map(key => ({
    key,
    value: String(status[key]),
  }));

  render() {
    const { userName, sentianceId, sentianceVersion, sentianceIsInitialized, sentianceStatus } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome {userName}</Text>

          <Button
            onPress={this._logoff}
            title="Logoff"
          />
        </View>

        <SectionList
          renderSectionHeader={({ section: { title } }) =>
            <Text style={styles.subtitle}>{title}</Text>
          }
          sections={[
            {
              title: 'Sentiance Status',
              data: [
                { key: 'Version', value: sentianceVersion },
                { key: 'User ID', value: sentianceId },
                { key: 'Is Initialized', value: sentianceIsInitialized },
                ...sentianceStatus,
              ]
            },
          ]}
          renderItem={({ item: { key, value } }) =>
            <TouchableOpacity style={styles.listItem} onPress={() => Clipboard.setString(value)}>
              <Text style={styles.label}>{key}</Text>
              <Text style={styles.value}>{value}</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginLeft: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  listItem: {
    borderBottomColor: '#c3c3c3',
    borderBottomWidth: 0.4,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
  },
  value: {
    fontWeight: 'bold',
  },
});

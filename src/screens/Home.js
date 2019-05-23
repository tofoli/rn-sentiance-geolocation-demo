import React, { PureComponent } from 'react';
import { StyleSheet, Platform, View, Text, Button, SectionList, NativeEventEmitter, TouchableOpacity, Clipboard, Switch } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNSentiance from 'react-native-sentiance';
import BackgroundGeolocation from 'react-native-background-geolocation';
import Permissions from 'react-native-permissions';
import GeolocationTask from '../task/GeolocationTask';
import SentianceTask from '../task/SentianceTask';

export default class Home extends PureComponent {
  static navigationOptions = {
    title: 'Home',
  };

  state = {
    sentianceEnabled: true,
    geolocationEnabled: true,
    userName: '',
    sentianceId: '',
    sentianceVersion: '',
    sentianceIsInitialized: '',
    sentianceStatus: [],
    geolocationStatus: [],
  }

  async componentDidMount() {
    const sentianceEmitter = new NativeEventEmitter(RNSentiance);
    this.subSDKStatusUpdate = sentianceEmitter.addListener(
      'SDKStatusUpdate',
      status => this.setState({ status: this._sentianceStatusToArray(status) })
    );

    let newState = { ...this.state };
    SentianceTask.listeners();
    GeolocationTask.listeners();

    await Permissions.request('location', { type: 'always' });
    if (Platform.OS === 'ios')
      await Permissions.request('motion');

    newState.sentianceEnabled = JSON.parse(await AsyncStorage.getItem('@auth/sentianceDisabled') || 'true');
    newState.geolocationEnabled = JSON.parse(await AsyncStorage.getItem('@auth/geolocationDisabled') || 'true');

    if (newState.sentianceEnabled)
      SentianceTask.schedule();

    if (newState.geolocationEnabled)
      GeolocationTask.schedule();

    if (await RNSentiance.isInitialized()) {
      newState.sentianceId = await RNSentiance.getUserId();
      const status = await RNSentiance.getSdkStatus();
      newState.sentianceVersion = await RNSentiance.getVersion();
      newState.sentianceIsInitialized = String(await RNSentiance.isInitialized());

      newState.sentianceStatus = this._sentianceStatusToArray(status);
    }

    newState.geolocationStatus = this._sentianceStatusToArray(await BackgroundGeolocation.getState());

    this.setState(newState);
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

  _sentianceSwitch = async () => {
    const { sentianceEnabled } = this.state;
    if (sentianceEnabled) { // Is being disabled
      await SentianceTask.cancel();
    } else {
      await SentianceTask.schedule();
    }

    await AsyncStorage.setItem('@auth/sentianceDisabled', JSON.stringify(!sentianceEnabled))
    this.setState({ sentianceEnabled: !sentianceEnabled });
  };

  _geolocationSwitch = async () => {
    const { geolocationEnabled } = this.state;
    console.log(geolocationEnabled);
    if (geolocationEnabled) { // Is being disabled
      await GeolocationTask.cancel();
    } else {
      await GeolocationTask.schedule();
    }

    await AsyncStorage.setItem('@auth/geolocationDisabled', JSON.stringify(!geolocationEnabled))
    this.setState({ geolocationEnabled: !geolocationEnabled });
  };

  render() {
    const {
      userName, sentianceId, sentianceVersion, sentianceIsInitialized,
      sentianceStatus, geolocationStatus, sentianceEnabled, geolocationEnabled
    } = this.state;

    console.log('render', geolocationEnabled);

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome {userName}</Text>

          <Button
            onPress={this._logoff}
            title="Logoff"
          />
        </View>

        <View style={styles.listItem}>
          <Text style={styles.value}>Sentiance Task</Text>

          <Switch
            value={sentianceEnabled}
            onValueChange={this._sentianceSwitch}
          />
        </View>

        <View style={styles.listItem}>
          <Text style={styles.value}>Geolocation Task</Text>

          <Switch
            value={geolocationEnabled}
            onValueChange={this._geolocationSwitch}
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
            }, {
              title: 'Geolocation Status',
              data: geolocationStatus,
            }
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
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 10,
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

import React, { PureComponent } from 'react';
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';
import Home from './Home';
import Login from './Login';

const LoginStack = createStackNavigator({
  Login,
});

const AppStack = createStackNavigator({
  Home,
});

export default class AppContainer extends PureComponent {
  render() {
    const { isLogged } = this.props;

    const Screens = createAppContainer(
      createSwitchNavigator({
        LoginStack,
        AppStack,
      }, {
        initialRouteName: isLogged ? 'AppStack' : 'LoginStack',
      })
    );

    return (
      <Screens
        onNavigationStateChange={(prevState, currentState) => console.log(prevState, currentState)}
      />
    );
  }
}

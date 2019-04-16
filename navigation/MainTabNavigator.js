import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import { Feed } from '../src/modules/Feed';
import AccountScreen from '../screens/AccountScreen';
import { Home } from '../src/modules/Home';

const HomeStack = createStackNavigator({
  Home
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  )
};

const FeedStack = createStackNavigator({
  Feed
});

FeedStack.navigationOptions = {
  tabBarLabel: 'Feed'
};

const AccountStack = createStackNavigator({
  Account: AccountScreen
});

AccountStack.navigationOptions = {
  tabBarLabel: 'Account'
};

export default createBottomTabNavigator({
  HomeStack,
  FeedStack,
  AccountStack
});

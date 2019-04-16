import React from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import * as firebase from 'firebase';

export default class AuthLoadingScreen extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {

		firebase.auth().onAuthStateChanged(user => {
			this.props.navigation.navigate(user ? 'App' : 'Auth')
		});

	}

  	render () {

  		return (
  			<View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
  				<ActivityIndicator size="large" />
  			</View>
  		);
  	}
}

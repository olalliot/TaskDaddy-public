import React from 'react';
import {
	View,
	Text,
	Button,
	ScrollView,
	StyleSheet,
} from 'react-native';
import * as firebase from 'firebase';
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
  return{
    loggedInUser: state.loggedUser,
  };
}

const mapDispatchToProps = (dispatch) => {
  return { };
}

class AccountScreen extends React.Component {
	static navigationOptions = {
    	header: null,
  	};
  	
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={{alignItems: 'center'}}>
				<Text> {this.props.loggedInUser} </Text>
			</View>
		);
	}

}

export default connect(mapStateToProps, mapDispatchToProps)(AccountScreen);
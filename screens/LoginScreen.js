import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	Button,
	Alert,
	ScrollView,
} from 'react-native';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { setLoggedUser } from './../redux/app-redux';

const mapStateToProps = (state) => {
  return{
    loggedInUser: state.loggedUser,
  };
}

const mapDispatchToProps = (dispatch) => {
  return { 
  	setLoggedUser: (text) => { dispatch(setLoggedUser("octave")) }
  };
}

class LoginScreen extends React.Component {
	static navigationOptions = {
    	header: null,
  	};

	constructor(props) {

		super(props);
		this.state = {
			email: "",
			password: "",
			errorMessage: "",
		};
	}

    onLogin = () => {

    	firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
    		.then(() => {
    			this.props.setLoggedUser(this.state.email);
    			this.props.navigation.navigate("Home");

    		}, (error) => {
    			this.setState({ errorMessage: error.message });
    		});

    }

    signUp = () => {

    	this.props.navigation.navigate("SignUp");

    }

	render() {

		return (
			<ScrollView keyboardShouldPersistTaps='handled'>
				<View style={{paddingTop:50, alignItems:"center"}}>
					<TextInput style={{width:200, height:40, borderWidth:1}}
						autoCapitalize="none"
						value={this.state.email}
						onChangeText={(text) => { this.setState({email: text}) }}
					/>

					<TextInput style={{width:200, height:40, borderWidth:1}}
						secureTextEntry
						autoCapitalize="none"
						value={this.state.password}
						onChangeText={(text) => { this.setState({password: text}) }}
					/>
					<Text style={{color: 'red'}}> {this.state.errorMessage} </Text>
					<Button title="Login" onPress={this.onLogin} />

					<Button title="Sign Up Now" onPress={this.signUp} />
				</View>
			</ScrollView>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
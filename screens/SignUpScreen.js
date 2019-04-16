import React from 'react';
import {
	View,
	Text,
	TextInput,
	Button,
	Alert,
	ScrollView,
} from 'react-native';
import * as firebase from 'firebase';
import { setLoggedUser } from './../redux/app-redux';
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
  return{
    loggedInUser: state.loggedUser,
  };
}

const mapDispatchToProps = (dispatch) => {
  return { 
  	setLoggedUser: (text) => { dispatch(setLoggedUser(text)) }
  };
}

class SignUp extends React.Component {
	static navigationOptions = {
    	header: null,
  	};

	constructor(props) {

		super(props);
		this.state = {
			email: "",
			password: "",
			confirmPassword: "",
			errorMessage: "",
		};

	}

	//Send User back to Login Page
	backToLogin = () => {
		this.props.navigation.navigate("LogIn");
	}

	//Sign in user with email and passsword
	onSignUp = () => {

		if (this.state.password !== this.state.confirmPassword) {

			this.setState({ errorMessage: "The passwords do not match" });
			return;

		}

		firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
			.then(() => {
				this.props.setLoggedUser(this.state.email);
			}, (error) => {
				this.setState({ errorMessage: error.message });
			});
	}

	render() {

		return (
			<ScrollView keyboardShouldPersistTaps='handled'>
				<View style={{paddingTop:100, alignItems:"center"}}>
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

					<TextInput style={{width: 200, height:40, borderWidth:1}}
						secureTextEntry
						autoCapitalize="none"
						value={this.state.confirmPassword}
						onChangeText={(text) => { this.setState({confirmPassword: text}) }}
					/>

					<Text style={{color: 'red'}}> {this.state.errorMessage} </Text>

					<Button title="Sign Up" onPress={this.onSignUp} />

					<Button title="Already have an account?" onPress={this.backToLogin} />
				</View>
			</ScrollView>
		)

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)
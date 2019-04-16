import React from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import DB from '../../model/db';
import { setUser, setPending, logIn, signUp } from './Login.module';
import User from '../../model/User';

const mapStateToProps = state => {
  return {
    loggedIn: !!state.login.user,
    user: state.login.user,
    pending: state.login.pending
  };
};

const mapDispatchToProps = dispatch => ({ dispatch });

class Login extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      password: '',
      errorMessage: '',
      confirmPassword: '',
      isLogin: true
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        const u = new User({ phoneNumber: user.email });
        this.props.dispatch(setUser(u));
      }
    });
  }

  componentDidUpdate() {
    if (this.props.loggedIn) {
      this.props.navigation.navigate('Home');
    }
  }

  onLogin = () => {
    if (this.props.pending) {
      return;
    }

    try {
      this.props.dispatch(logIn(this.state.phoneNumber, this.state.password));
    } catch (e) {
      this.setState(state => ({ errorMessage: e.message, isLogin: state.isLogin }));
    }
  };

  toggleSignUp = () => {
    this.setState(state => ({ ...state, isLogin: !state.isLogin }));
  };

  // Sign in user with email and passsword
  onSignUp = () => {
    if (this.props.pending) {
      return;
    }

    if (this.state.password !== this.state.confirmPassword) {
      this.setState(state => ({
        errorMessage: 'The passwords do not match',
        isLogin: state.isLogin
      }));
      return;
    }

    // TODO add phone number verification
    try {
      this.props.dispatch(signUp(this.state.phoneNumber, this.state.password));
    } catch (e) {
      this.setState(state => ({ errorMessage: e.message, isLogin: state.isLogin }));
    }
  };

  render() {
    const signUpComp = (
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <TextInput
            style={{ width: 200, height: 40, borderWidth: 1 }}
            autoCapitalize="none"
            value={this.state.phoneNumber}
            onChangeText={text => {
              this.setState({ phoneNumber: text });
            }}
          />

          <TextInput
            style={{ width: 200, height: 40, borderWidth: 1 }}
            secureTextEntry
            autoCapitalize="none"
            value={this.state.password}
            onChangeText={text => {
              this.setState({ password: text });
            }}
          />

          <TextInput
            style={{ width: 200, height: 40, borderWidth: 1 }}
            secureTextEntry
            autoCapitalize="none"
            value={this.state.confirmPassword}
            onChangeText={text => {
              this.setState({ confirmPassword: text });
            }}
          />

          <Text style={{ color: 'red' }}>{this.state.errorMessage}</Text>

          <Button title="Sign Up" onPress={this.onSignUp} />

          <Button title="Already have an account?" onPress={this.toggleSignUp} />
        </View>
      </ScrollView>
    );

    const loginComp = (
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: 50, alignItems: 'center' }}>
          <TextInput
            style={{ width: 200, height: 40, borderWidth: 1 }}
            autoCapitalize="none"
            value={this.state.phoneNumber}
            onChangeText={text => {
              this.setState({ phoneNumber: text });
            }}
          />
          <TextInput
            style={{ width: 200, height: 40, borderWidth: 1 }}
            secureTextEntry
            autoCapitalize="none"
            value={this.state.password}
            onChangeText={text => {
              this.setState({ password: text });
            }}
          />
          <Text style={{ color: 'red' }}> {this.state.errorMessage} </Text>
          <Button title="Login" onPress={this.onLogin} />

          <Button title="Sign Up Now" onPress={this.toggleSignUp} />
        </View>
      </ScrollView>
    );

    return this.state.isLogin ? loginComp : signUpComp;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);

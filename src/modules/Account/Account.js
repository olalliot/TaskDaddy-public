import React from 'react';
import {
	Text,
	View
} from 'react-native';
import { connect } from 'react-redux';
import * as firebase from 'firebase';

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return { dispatch };
};

class Account extends React.Component {
	static navigationOptions = {
    	header: null
  	};

  	constructor(props) {
  		super(props);
  		this.state = {};
  	}

  	componentDidMount() {

  	}

  	componentDidUpdate() {

  	}

  	render() {
  		return;
  	}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Account);
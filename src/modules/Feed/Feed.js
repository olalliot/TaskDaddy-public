import React from 'react';
import {
	View,
	Text,
	ScrollView,
	RefreshControl,
	Dimensions
} from 'react-native';
import * as firebase from 'firebase';
import moment from 'moment-timezone';
import { connect } from 'react-redux';
import { getFeedItems } from './Feed.module';

const mapStateToProps = state => {
  return {
    loggedIn: !!state.login.user,
    user: state.login.user,
    feedTasks: state.feed.feedItems,
    pending: state.login.pending || state.home.pending
  };
};

const mapDispatchToProps = dispatch => {
  return { dispatch };
};

class Feed extends React.Component {
	static navigationOptions = {
    	header: null
  	};

  	constructor(props) {
  		super(props);
  		this.state = { refreshing: false };
  		this.retrieveFeedTasks = this.retrieveFeedTasks.bind(this);
  		this.feedRefresh = this.feedRefresh.bind(this);
  	}

  	componentDidMount() {
  		this.retrieveFeedTasks();
  	}

  	componentDidUpdate() {
  		if (this.props.feedTasks.length <= 0) {
  			this.retrieveFeedTasks();
  		}
  	}

  	retrieveFeedTasks() {
  		try {
  			this.props.dispatch(getFeedItems());
  		} catch(e) {
  			console.log(e);
  		}
  	}

  	feedRefresh() {
  		this.setState({ refreshing: true });
  		this.retrieveFeedTasks();
  		this.setState({ refreshing: false });
  	}

  	render() {
  		return (
  			<View style={{paddingTop: 50, height: Dimensions.get('window').height}}>
  				<ScrollView
  				refreshControl={
  					<RefreshControl
  						refreshing={this.state.refreshing}
  						onRefresh={this.feedRefresh}
  					/>
  				}
  				>
	  				{ this.props.feedTasks.map(t => {
	  					return(
	  					<View style={{paddingTop: 5, paddingBottom: 5}} key={t.id}>
		  					<Text> {t.name} </Text>
		  					<Text> {moment(t.completionDate).fromNow()} </Text>
		  					<Text> {t.user.phoneNumber} </Text>
		  				</View>
	  					)})
	  				}
	  			</ScrollView>
  			</View>
  		)
  	}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Feed);
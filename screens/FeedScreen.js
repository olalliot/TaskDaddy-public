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
import moment from 'moment';

const mapStateToProps = (state) => {
  return{
    loggedInUser: state.loggedUser,
  };
}

const mapDispatchToProps = (dispatch) => {
  return { };
}

class FeedScreen extends React.Component {
	static navigationOptions = {
    	header: null,
  	};
  	
	constructor(props) {
		super(props);
		this.state={
			tasks: [],
		}
	}

	componentDidMount() {
		const ref = firebase.database().ref("feed");
		ref.on('value', (taskSnapshot) => {
			let feedTasks = [];
			taskSnapshot.forEach((task) => {
				feedTasks.push({
					key: task.key,
					owner: task.toJSON().owner,
					taskName: task.toJSON().taskName,
					finishedTime: moment(task.toJSON().finishedTime).fromNow(),
				});
			});
			this.setState({ tasks: feedTasks.reverse() });
		});
	}

	render () {

		return (
			<View style={{paddingTop: 20}}>
				<ScrollView>
					{this.state.tasks.map(t => (
						<View key={t.key}>
							<Button title={t.owner} onPress={() => console.log(t.taskName)} />
							<Text> {t.taskName} </Text>
							<Text> {t.finishedTime} </Text>
						</View>
					))}
				</ScrollView>
			</View>
		);
	}

}

export default connect(mapStateToProps, mapDispatchToProps)(FeedScreen);
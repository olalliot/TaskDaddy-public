import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  TextInput,
  Button,
  Dimensions,
} from 'react-native';
import { WebBrowser } from 'expo';
import * as firebase from 'firebase';
import moment from 'moment';
import { MonoText } from '../components/StyledText';
import { connect } from 'react-redux';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import Task from '../src/model/Task';
import Modal from 'react-native-modalbox';

LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'],
  monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
  dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  dayNamesShort: ['Mon.', 'Tue.', 'Wed.', 'Thur.', 'Fri.', 'Sat.', 'Sun.']
};
LocaleConfig.defaultLocale='en';

const mapStateToProps = (state) => {
  return{
    loggedInUser: state.loggedUser,
  };
}

const mapDispatchToProps = (dispatch) => {
  return { };
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      newTaskError: "",
      newTaskScreenVisible: false,
      newTaskTitle: "",
      newTaskTimeStamp: "",
      newTaskDate: "",
      tasks: [],
      taskViewVisible: false,
      taskViewKey: "",
      taskViewTitle: "",
      taskViewDue: "",
      taskNotes: "",
      updateMessage: "",
    }
    this.retrieveTasks = this.retrieveTasks.bind(this);
    this.submitNewTask = this.submitNewTask.bind(this);
    this.onDaySelect = this.onDaySelect.bind(this);
    this.completeTask = this.completeTask.bind(this);
    this.updateTask = this.updateTask.bind(this);
  }

  componentDidMount() {
    this.retrieveTasks();
  }

  logOut = () => {

    firebase.auth().signOut();

  }

  retrieveTasks() {
    const ref = firebase.database().ref("tasks/" + this.props.loggedInUser);
    const refChild = ref.child('tasks');
    refChild.on('value', (taskSnapshot) => {
      let userTasks = [];
      let dateString = "";
      let currentDate = "";
      let count = 0;
      let todayVal = new Date().toJSON();
      todayVal = todayVal.substr(0,10);
      taskSnapshot.forEach((task) => {
        let taskDateVal = task.toJSON().dueDate.split('-').join('');
        if (parseInt(taskDateVal) >= parseInt(todayVal)) {
          if (currentDate === task.toJSON().dueDate) {
            dateString = null;
          }
          else if (count < 2 && currentDate !== task.toJSON().dueDate) {
            dateString = moment(task.toJSON().dueDate).format('LL');
            currentDate = task.toJSON().dueDate;
            count++;
          }
          else if (count === 2) {
            dateString = "Upcoming";
            count++;
          }
          else {
            dateString = null;
          }
          userTasks.push({
            key: task.key,
            taskName: task.toJSON().title,
            dueDate: dateString,
            storedDate: moment(task.toJSON().dueDate).format('LL'),
            isCompleted: task.toJSON().isCompleted,
            notes: task.toJSON().notes,
          });
        }
      });
      this.setState({ tasks: userTasks });
    });
  }

  submitNewTask(newTask) {
    if (!newTask) {
      this.setState({ newTaskError: "Task title is empty" });
      return;
    }
    else if (this.state.newTaskDate === "") {
      this.setState({ newTaskError: "No due date selected"});
      return;
    }
    firebase.database().ref("tasks/" + this.props.loggedInUser + "/tasks/" + this.state.newTaskTimeStamp + Math.random().toString(36).substring(2, 15)).set({ 
      title: newTask,
      isCompleted: false,
      dueDate: this.state.newTaskDate,
      notes: "",
    });
    this.setState({ newTaskScreenVisible: false, newTaskTitle: "", newTaskError: "", tasks: [], newTaskDate: "" });
    this.retrieveTasks();
  }

  completeTask(key, name) {
    firebase.database().ref("tasks/" + this.props.loggedInUser + "/tasks/" + key).update({ isCompleted: true });
    let completedOn = new Date();
    firebase.database().ref("feed/" + completedOn.toJSON().split('.').join('')).set({
      owner: this.props.loggedInUser,
      taskName: name,
      finishedTime: completedOn.toJSON(),
    })
  }

  updateTask() {
    firebase.database().ref("tasks/" + this.props.loggedInUser + "/tasks/" + this.state.taskViewKey).update({ notes: this.state.taskNotes });
  }

  onDaySelect(day) {
    this.setState({ newTaskDate: day.dateString, newTaskTimeStamp: day.timestamp});
  }

  render() {
    LocaleConfig.defaultLocale='en';

    return (
      <View>
        <View style={{paddingTop: 20}}>
          <Button title="New Task" onPress={ () => this.setState({ newTaskScreenVisible: true }) } />
          <ScrollView>
            <View>
              {this.state.tasks.map(t => (
                <GestureRecognizer onSwipeLeft={() => this.completeTask(t.key, t.taskName)} key={t.key}>
                  <TouchableWithoutFeedback onPress={() => this.setState({ taskViewVisible: true, taskViewKey: t.key, taskViewTitle: t.taskName, taskViewDue: t.storedDate, taskNotes: t.notes }) } >
                    <View style={{ paddingTop:5, paddingBottom: 5}}>
                      { t.dueDate ? <Text style={{fontWeight: 'bold', fontSize: 20}}> { t.dueDate } </Text> : null }
                      <Text style={ t.isCompleted ? {textDecorationLine: 'line-through'} : {}} > {t.taskName} </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </GestureRecognizer>
              ))}
              <Button title="Log Out" onPress={this.logOut} />
            </View>
          </ScrollView>
        </View>
        <Modal
          isOpen={this.state.newTaskScreenVisible}
          onClosed={() => this.setState({ newTaskScreenVisible: false, newTaskError: "", newTaskDate: "" })}
          entry={'top'}
          coverScreen={true}
        >
          <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{flexGrow: 1}}>
            <View style={{flex:1, backgroundColor:'white', alignItems: 'center', justifyContent:'center'}}>
              <TextInput
                type="text"
                onChangeText={ (text) => {this.setState({ newTaskTitle: text }) }}
                value={this.state.newTaskTitle}
                placeholder={'New Task Name'}
              />
              <Calendar
                current={new Date()}
                minDate={new Date()}
                maxDate={'2025-12-31'}
                onDayPress={(day) => {this.onDaySelect(day)}}
                monthFormat={'MMMM yyyy'}
                hideDayNames={true}
                hideExtraDays={true}
                markedDates={{[this.state.newTaskDate]: {selected: true, disableTouchEvent: true} }}
                style={{width: Dimensions.get('window').width}}
              />
              <Button title="Add task" onPress={() => this.submitNewTask(this.state.newTaskTitle) } />
              <Text style={{ color: 'red'}}> {this.state.newTaskError} </Text>
            </View>
          </ScrollView>
        </Modal>
        <Modal 
          isOpen={ this.state.taskViewVisible }
          onClosed={() => this.setState({ taskViewKey: "", taskViewDue: "", taskViewTitle: "", taskViewVisible: false })}
          entry={'bottom'}
          coverScreen={true}
        >
          <View style={{flex:1, backgroundColor:'white', alignItems: 'center', justifyContent:'center'}}>
            <Text> {this.state.taskViewTitle} </Text>
            <Text> By {this.state.taskViewDue} </Text>
            <TextInput type="text" onChangeText={ (text) => {this.setState({ taskNotes: text }) }} value={this.state.taskNotes} placeholder={'Add task details'} />
            <Button title={ this.state.taskNotes ? "Update" : "" } onPress={() => this.updateTask() } />
          </View>
        </Modal>
      </View>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);


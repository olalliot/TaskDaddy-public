import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  TextInput,
  Button,
  Dimensions
} from 'react-native';
import { WebBrowser } from 'expo';
import * as firebase from 'firebase';
import moment from 'moment-timezone';
import { connect } from 'react-redux';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import Modal from 'react-native-modalbox';
import Task from '../../model/Task';
import FeedTask from '../../model/FeedTask'
import { signOut } from '../Login';
import {
  fetchItems,
  addTask,
  updateTask,
  completeTask,
  itemSort,
  fetchPreviousItems,
  addTaskToFeed
} from './Home.module';

LocaleConfig.locales.en = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'November',
    'December'
  ],
  monthNamesShort: [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr.',
    'May',
    'Jun.',
    'Jul.',
    'Aug.',
    'Sept.',
    'Oct.',
    'Nov.',
    'Dec.'
  ],
  dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  dayNamesShort: ['Mon.', 'Tue.', 'Wed.', 'Thur.', 'Fri.', 'Sat.', 'Sun.']
};
LocaleConfig.defaultLocale = 'en';

const mapStateToProps = state => {
  return {
    loggedIn: !!state.login.user,
    user: state.login.user,
    tasks: state.home.items,
    pending: state.login.pending || state.home.pending
  };
};

const mapDispatchToProps = dispatch => {
  return { dispatch };
};

class Home extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      newTaskError: '',
      newTaskScreenVisible: false,
      newTaskTitle: '',
      newTaskTimeStamp: '',
      newTaskDate: new Date(),
      tasks: [],
      taskViewVisible: false,
      taskViewKey: '',
      taskViewTitle: '',
      taskViewDue: '',
      newTaskAmount: 0,
      taskNotes: '',
      updateMessage: '',
      verifier: ''
    };
    this.retrieveTasks = this.retrieveTasks.bind(this);
    this.submitNewTask = this.submitNewTask.bind(this);
    this.onDaySelect = this.onDaySelect.bind(this);
    this.completeTask = this.completeTask.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.setAmount = this.setAmount.bind(this);
  }

  componentDidMount() {
    this.retrieveTasks();
  }

  componentDidUpdate() {
    if (!this.props.loggedIn && !this.props.pending) {
      // this.props.dispatch(signOut());
      this.props.navigation.navigate('Auth');
      return;
    }

    if (!this.props.pending && this.props.tasks.length <= 0) {
      this.retrieveTasks();
    }
  }

  onDaySelect(day) {
    this.setState({ newTaskDate: day.dateString, newTaskTimeStamp: day.timestamp });
  }

  logOut = () => {
    // firebase.auth().signOut();
    this.props.dispatch(signOut());
    this.props.navigation.navigate('Auth');
  };

  retrieveTasks() {
    if (this.props.pending) {
      return;
    }

    try {
      this.props.dispatch(fetchItems());
      this.props.dispatch(fetchPreviousItems());
    } catch (e) {
      // idk do something
      console.error(e);
    }
  }

  submitNewTask(newTask) {
    if (!newTask) {
      this.setState({ newTaskError: 'Task title is empty' });
      return;
    }
    if (this.state.newTaskDate === '') {
      this.setState({ newTaskError: 'No due date selected' });
      return;
    }

    const t = new Task();
    t.user = this.props.user;
    t.complete = false;
    t.pendingCompletion = false;
    t.name = this.state.newTaskTitle;
    t.dueDate = this.state.newTaskTimeStamp;
    t.notes = this.state.taskNotes;

    try {
      this.props.dispatch(addTask(t));
    } catch (e) {
      console.error(e);
      this.setState({ newTaskError: e.message });
    }

    this.setState({
      newTaskScreenVisible: false,
      newTaskTitle: '',
      newTaskError: '',
      tasks: [],
      newTaskDate: '',
      verifier: '',
      newTaskAmount: 0
    });

    this.retrieveTasks();
  }

  setAmount(amount) {
    this.setState({ newTaskAmount: amount });
  }

  completeTask(key, name = null) {
    const t = this.props.tasks[key];
    try {
      this.props.dispatch(completeTask(t));
    } catch (e) {
      console.error(e);
    }

    const completed = new FeedTask(this.props.tasks[key]);
    completed.completionDate = Date.now();
    
    try {
      this.props.dispatch(addTaskToFeed(completed));
    } catch(e) {
      console.error(e);
    }
  }

  updateTask() {
    const t = this.props.tasks[this.state.taskViewKey];
    t.user = this.props.user;
    t.name = this.state.newTaskTitle || t.name;
    t.dueDate = this.state.newTaskTimeStamp || t.dueDate;
    t.notes = this.state.taskNotes || t.notes;

    try {
      this.props.dispatch(updateTask(t));
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    LocaleConfig.defaultLocale = 'en';
    const currentMoment = moment(Date.now() / 1000, 'X');

    const mergeItem = (task, i, theMap) => {
      if (!theMap[task.dueDate]) {
        theMap[task.dueDate] = [];
      }

      theMap[task.dueDate].push({ task, i });
      theMap[task.dueDate].sort(({ task: taskA }, { task: taskB }) => itemSort(taskA, taskB));
    };
    let count = 0;
    let currentDate = 0;
    let mappedTasks = this.props.tasks.reduce(
      (theMap, t, i) => {
        if (
          t.momentDueDate.dayOfYear() < currentMoment.dayOfYear() ||
          currentMoment.year() > t.momentDueDate.year()
        ) {
          mergeItem(t, i, theMap.Past);
        } else if (count < 2){
          currentDate !== t.dueDate ? (count++, currentDate = t.dueDate) : null;
          mergeItem(t, i, theMap.Today);

        } else {
          mergeItem(t, i, theMap.Upcoming);
        }
        return theMap;
      },
      { Past: {}, Today: {}, Upcoming: {} }
    );

    const sortMapToEntries = theMap => {
      const mapEntries = Object.entries(theMap);
      mapEntries.sort(([a], [b]) => a - b);

      return mapEntries;
    };

    mappedTasks.Past = sortMapToEntries(mappedTasks.Past);
    mappedTasks.Upcoming = sortMapToEntries(mappedTasks.Upcoming);
    mappedTasks.Today = sortMapToEntries(mappedTasks.Today);

    const taskOrder = ['Past', 'Today', 'Upcoming'];
    mappedTasks = Object.entries(mappedTasks).sort((a, b) => taskOrder[a[0]] - taskOrder[b[0]]);

    return (
      <View>
        <View style={{ paddingTop: 50 }}>
          <Button title="New Task" onPress={() => this.setState({ newTaskScreenVisible: true })} />
          <ScrollView>
            <View>
              {mappedTasks.map(([name, taskList]) => {
                return (
                  <View key={`mapped_tasks_${name}`}>
                    {name !== 'Today' && (
                      <Text style={{ fontWeight: 'bold', fontSize: 20 }}> {name} </Text>
                    )}
                    {taskList.map(([dateOfBucket, tasksInBucket]) => {
                      return (
                        <View key={`mapped_date_${dateOfBucket}`}>
                          {name === 'Today' && (
                            <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
                              {`  ${Task.parseXToReadable(dateOfBucket)}`}
                            </Text>
                          )}
                          {tasksInBucket.map(({ task: t, i }) => (
                            <GestureRecognizer
                              onSwipeLeft={() => this.completeTask(i, t.name)}
                              key={t.id}
                            >
                              <TouchableWithoutFeedback
                                onPress={() =>
                                  this.setState({
                                    taskViewVisible: true,
                                    taskViewKey: i,
                                    taskViewTitle: t.name,
                                    taskViewDue: t.dueDate,
                                    taskNotes: t.notes
                                  })
                                }
                              >
                                <View style={{ paddingTop: 5, paddingBottom: 5 }}>
                                  {/* <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                                    {` ${t.readableDate} `}
                                  </Text> */}
                                  <Text
                                    style={t.complete ? { textDecorationLine: 'line-through', opacity: 0.5 } : {}}
                                  >
                                    {`   ${t.name} `}
                                  </Text>
                                </View>
                              </TouchableWithoutFeedback>
                            </GestureRecognizer>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <Button title="Log Out" onPress={this.logOut} />
        </View>
        <Modal
          isOpen={this.state.newTaskScreenVisible}
          onClosed={() =>
            this.setState({ newTaskScreenVisible: false, newTaskError: '', newTaskDate: '' })
          }
          entry="top"
          coverScreen
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TextInput
                type="text"
                onChangeText={text => {
                  this.setState({ newTaskTitle: text });
                }}
                value={this.state.newTaskTitle}
                placeholder="New Task Name"
              />
              <Calendar
                current={this.state.newTaskDate}
                minDate={new Date()}
                maxDate="2025-12-31"
                onDayPress={day => {
                  this.onDaySelect(day);
                }}
                monthFormat="MMMM yyyy"
                hideDayNames
                hideExtraDays
                markedDates={{
                  [this.state.newTaskDate]: { selected: true, disableTouchEvent: true }
                }}
                style={{ width: Dimensions.get('window').width }}
              />
              <Text> Wager </Text>
              <Button title="0$" onPress={() => this.setAmount(0)} />
              <Button title="5$" onPress={() => this.setAmount(5)} />
              <Button title="10$" onPress={() => this.setAmount(10)} />
              <Button title="15$" onPress={() => this.setAmount(15)} />
              {this.state.newTaskAmount ?
                <TextInput
                  type="text"
                  onChangeText={text => { this.setState({ verifier: text }) }}
                  value={this.state.verifier}
                  placeholder="Add a verifier"
                /> : null }
              <Button
                title="Add task"
                onPress={() => this.submitNewTask(this.state.newTaskTitle)}
              />
              <Text style={{ color: 'red' }}> {this.state.newTaskError} </Text>
            </View>
          </ScrollView>
        </Modal>
        <Modal
          isOpen={this.state.taskViewVisible}
          onClosed={() =>
            this.setState({
              taskViewKey: '',
              taskViewDue: '',
              taskViewTitle: '',
              taskViewVisible: false
            })
          }
          entry="bottom"
          coverScreen
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text> {this.state.taskViewTitle} </Text>
            <Text> By {Task.parseXToReadable(this.state.taskViewDue)} </Text>
            <Text> Extension </Text>
            <Button title="24 H" onPress={() => console.log("24 h extension")} />
            <Button title="48 H" onPress={() => console.log("48 h extension")} />
            <Button title="72 H" onPress={() => console.log("72 h extension")} />
            <TextInput
              type="text"
              onChangeText={text => {
                this.setState({ taskNotes: text });
              }}
              value={this.state.taskNotes}
              placeholder="Add task details"
            />
            <Button
              title={this.state.taskNotes ? 'Update' : ''}
              onPress={() => this.updateTask()}
            />
          </View>
        </Modal>
      </View>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);

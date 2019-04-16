import * as qs from 'querystring';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Axios from 'axios';
import LoggedInUser from './LoggedInUser';
import User from './User';
import Task from './Task';
import * as Errors from '../errors';
import FeedTask from './FeedTask';
import log from './log';

const phoneVerifyURL = 'https://api.authy.com/protected/json/phones/verification/start';
const phoneVerifyConfirmURLBuider = (phoneNumber, countryCode, vCode) => {
  return `https://api.authy.com/protected/json/phones/verification/check?phone_number=${phoneNumber}&country_code=${countryCode}&verification_code=${vCode}`;
};
// const phoneVerifyStatusURLBuilder = (phoneNumber, countryCode) => {
//   return `https://api.authy.com/protected/json/phones/verification/status?country_code=${countryCode}&phone_number=${phoneNumber}`;
// }
const phoneVerifyAPIKey = 'aG74n0NkCtwjR37cpNHga1RVUl0v51KQ';

export default class DB {
  constructor() {
    // setup firebase and stuff
    log().debug('Setting up db');
    this.dbf = firebase.firestore();
  }

  // -----------------
  // USER STUFF
  // -----------------
  logIn(phoneNumber, password) {
    log().debug(`logging in ${phoneNumber}...`);
    const u = new User();
    u.phoneNumber = phoneNumber;
    return firebase
      .auth()
      .signInWithEmailAndPassword(u.phoneNumberEmail, password)
      .then(() => {
        const userRef = this.dbf.collection('users').doc(u.phoneNumber);
        return userRef.get().then(doc => {
          if (doc.exists) {
            return new LoggedInUser(doc.data());
          }

          return Promise.reject(new Errors.UserNotInDatabaseInvariant());
        });
      });
  }

  signUp(phoneNumber, password) {
    log().debug(`signing up ${phoneNumber}...`);

    const u = new User();
    u.phoneNumber = phoneNumber;

    return firebase
      .auth()
      .createUserWithEmailAndPassword(u.phoneNumberEmail, password)
      .then(() => {
        const d = new User();
        d.phoneNumber = phoneNumber;
        const userRef = this.dbf.collection('users').doc(u.phoneNumber);
        return userRef.set(d.exp(), { merge: true }).then(() => {
          return d;
        });
      });
  }

  signOut() {
    return firebase.auth().signOut();
  }

  getTaskItems(count = 20, startItemId = null, lookBefore = false) {
    const { phoneNumber } = new User({ phoneNumber: this.getCurrentFirebaseUser().email });
    const tasksRef = this.dbf
      .collection('users')
      .doc(phoneNumber)
      .collection('tasks');

    let tasksQuery = tasksRef.orderBy('id');

    if (startItemId) {
      tasksQuery = tasksQuery.where('id', lookBefore ? '<' : '>', startItemId);
    } else {
      tasksQuery = tasksQuery.where(
        'id',
        lookBefore ? '<' : '>',
        this.calculateUUID({ dueDate: Date.now() }, 0)
      );
    }

    return tasksQuery
      .limit(count)
      .get()
      .then(snapshot => {
        const items = [];
        snapshot.forEach(taskDoc => {
          items.push(new Task(taskDoc.data()));
        });

        return items;
      });
  }

  phoneVerify(user) {
    const verifyPhone = () => {
      log().debug(`verifying ${user.phoneNumber}...`);
      return Axios({
        method: 'post',
        url: phoneVerifyURL,
        data: {
          via: 'sms',
          country_code: user.phoneNumberCountryCode,
          phone_number: user.phoneNumber,
          locale: 'en'
        },
        headers: {
          'X-Authy-API-Key': phoneVerifyAPIKey
        },
        paramsSerializer(params) {
          return qs.stringify(params, { arrayFormat: 'brackets' });
        }
      }).then(({ data }) => {
        return data;
      });
    };

    if (user.phoneVerified) {
      return Promise.reject(new Errors.PhoneAlreadyVerifiedError());
    }

    return verifyPhone();
  }

  phoneVerifyConfirm(user, code) {
    const confirmPhone = () => {
      log().debug(`confirming verification of ${user.phoneNumber}...`);
      return Axios({
        method: 'get',
        url: phoneVerifyConfirmURLBuider(user.phoneNumber, user.phoneNumberCountryCode, code),
        headers: {
          'X-Authy-API-Key': phoneVerifyAPIKey
        }
      }).then(({ data }) => {
        return data;
      });
    };

    const updateUser = () => {
      const userRef = this.dbf.collection('users').doc(user.phoneNumber);
      this.dbf.runTransaction(tx => {
        return tx.get(userRef).then(userDoc => {
          if (!userDoc.exists) {
            throw new Errors.UserNotInDatabaseInvariant();
          }

          user.phoneVerified = true;
          tx.update(userRef, user.exp());
        });
      });
    };

    if (user.phoneVerified) {
      return Promise.reject(new Errors.PhoneAlreadyVerifiedError());
    }

    return confirmPhone()
      .then(() => updateUser())
      .then(() => user);
  }

  updateUser(user) {
    const userRef = this.dbf.collection('users').doc(user.phoneNumber);
    return this.dbf.runTransaction(tx => {
      return tx.get(userRef).then(userDoc => {
        if (!userDoc.exists) {
          throw new Errors.UserNotInDatabaseInvariant();
        }

        tx.update(userRef, user.exp());
      });
    });
  }

  // -----------------
  // TASK STUFF
  // -----------------
  addTask(task) {
    const { phoneNumber } = new User({ phoneNumber: this.getCurrentFirebaseUser().email });
    let uuid = this.calculateUUID(task);
    const userRef = this.dbf.collection('users').doc(phoneNumber);

    task.id = uuid;
    const taskRef = userRef.collection('tasks').doc(uuid);
    log().debug(`adding task ${task.id}...`);

    return this.dbf.runTransaction(tx => {
      const fixCollisions = (theTaskRef, numCollisions = 0) => {
        return tx.get(theTaskRef).then(taskDoc => {
          if (taskDoc.exists) {
            // collision

            uuid = this.calculateUUID(task, numCollisions + 1);
            task.id = uuid;
            theTaskRef = userRef.collection('tasks').doc(uuid);
            return fixCollisions(tx, theTaskRef, numCollisions + 1);
          }

          return theTaskRef;
        });
      };

      return fixCollisions(taskRef, 0)
        .then(realTaskRef => {
          return tx.get(userRef).then(userDoc => {
            if (!userDoc.exists) {
              throw new Errors.UserNotInDatabaseInvariant();
            }

            const userData = userDoc.data();

            if (!userData.numberOfTasks) {
              userData.numberOfTasks = 0;
            }

            userData.numberOfTasks += 1;

            tx.set(realTaskRef, task.exp());
            return tx.update(userRef, userData);
          });
        })
        .then(() => task);
    });
  }

  completeTask(task) {
    log().debug(`completing task ${task.id}...`);

    if (!task.verifier) {
      task.pendingCompletion = true;
      return this.updateTask(task).then(t => this.verifyTask(t));
      // return Promise.reject(new Errors.TaskHasNoVerifierError());
    }

    const { phoneNumber } = new User({ phoneNumber: this.getCurrentFirebaseUser().email });

    const userRef = this.dbf.collection('users').doc(phoneNumber);
    const taskRef = userRef.collection('tasks').doc(task.id);

    return this.dbf.runTransaction(tx => {
      return tx
        .get(taskRef)
        .then(taskDoc => {
          return tx.get(userRef).then(userDoc => {
            if (!userDoc.exists) {
              throw new Errors.UserNotInDatabaseInvariant();
            }

            if (!taskDoc.exists) {
              throw new Errors.TaskDoesntExist();
            }

            task = new Task(taskDoc.data());
            task.id = taskDoc.id;

            if (task.pendingCompletion) {
              throw new Errors.TaskIsAlreadyPending();
            }

            if (task.complete) {
              throw new Errors.TaskIsAlreadyComplete();
            }

            // run verification script?

            task.pendingCompletion = true;
            task.complete = false;

            const userData = userDoc.data();

            if (!userData.numberOfTasksCompleted) {
              userData.numberOfTasksCompleted = 0;
            }

            userData.numberOfTasksCompleted += 1;

            tx.update(taskRef, task.exp());
            return tx.update(userRef, userData);
          });
        })
        .then(() => task);
    });
  }

  verifyTask(task) {
    if (!task.pendingCompletion) {
      return Promise.reject(new Errors.CantVerifyNoncompleteTask());
    }

    log().debug(`verifying task ${task.id}...`);
    const { phoneNumber } = task.user;
    // console/log(task.verifier.exp());
    const taskRef = this.dbf
      .collection('users')
      .doc(phoneNumber)
      .collection('tasks')
      .doc(task.id);

    return this.dbf.runTransaction(tx => {
      return tx
        .get(taskRef)
        .then(taskDoc => {
          if (!taskDoc.exists) {
            throw new Errors.TaskDoesntExist();
          }

          task = new Task(taskDoc.data());
          task.id = taskDoc.id;

          if (!task.pendingCompletion) {
            throw new Errors.TaskIsNotPending();
          }

          if (task.complete) {
            throw new Errors.TaskIsAlreadyComplete();
          }

          task.pendingCompletion = false;
          task.complete = true;

          return tx.update(taskRef, task.exp());
        })
        .then(() => task);
    });
  }

  updateTask(task) {
    const userRef = this.dbf.collection('users').doc(task.user.phoneNumber);
    // let taskRef;
    return this.dbf.runTransaction(tx => {
      return tx
        .get(userRef)
        .then(userDoc => {
          if (!userDoc.exists) {
            throw new Errors.UserNotInDatabaseInvariant();
          }

          const taskRef = userRef.collection('tasks').doc(task.id);
          return tx.get(taskRef).then(taskDoc => ({ taskDoc, taskRef }));
        })
        .then(({ taskDoc, taskRef }) => {
          if (!taskDoc.exists) {
            throw new Errors.TaskNotInDatabaseError();
          }

          tx.update(taskRef, task.exp());
          tx.update(userRef, {});
        })
        .then(() => task);
    });
  }

  // -----------------
  // FEED STUFF
  // -----------------

  // make sure you call with a FeedTask not a Task
  addTaskToFeed(feedTask) {
    log().debug(`Adding task with id ${feedTask.id} to feed...`);

    if (feedTask.className() !== FeedTask.className) {
      return Promise.reject(new Error.NotAFeedTaskInvariant());
    }

    const feedCollectionRef = this.dbf.collection('feed');
    const feedItemRef = feedCollectionRef.doc(feedTask.feedId);
    return feedItemRef.set(feedTask.exp()).then(() => feedTask);
  }

  // gets the most recent regardless of today
  getFeedItems(count = 20, startItemId = null) {
    const feedRef = this.dbf.collection('feed');

    let feedQuery = feedRef.orderBy('id', 'desc');

    if (startItemId) {
      feedQuery = feedQuery.startAfter(startItemId);
    }

    return feedQuery
      .limit(count)
      .get()
      .then(snapshot => {
        const items = [];
        snapshot.forEach(taskDoc => {
          items.push(new FeedTask(taskDoc.data()));
        });

        return items;
      });
  }

  // -----------------
  // HELPERS STUFF
  // -----------------

  getCurrentFirebaseUser() {
    const user = firebase.auth().currentUser;

    if (!user) {
      throw new Errors.NotLoggedInError();
    }

    return user;
  }

  calculateUUID(task, collisionAmount = 0) {
    return (
      task.dueDate +
      collisionAmount +
      Math.random()
        .toString(36)
        .substring(2, 15)
    );
  }
}

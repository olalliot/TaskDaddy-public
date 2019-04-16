/* eslint-disable */

const assert = require('assert');
const firebase = require('firebase');
const DB = require('../db').default;
const User = require('../User').default;
const Task = require('../Task').default;
const FeedTask = require('../FeedTask').default;

require('@babel/register')({
  rootMode: 'upward'
});

describe('db', function() {
  before(function() {
    let config = {
      apiKey: 'AIzaSyCByZ5TqUqlWmPOF0ylF1J6Vxb3Wh5_c8U',
      authDomain: 'taskdaddy-test.firebaseapp.com',
      databaseURL: 'https://taskdaddy-test.firebaseio.com',
      projectId: 'taskdaddy-test',
      storageBucket: 'taskdaddy-test.appspot.com',
      messagingSenderId: '75938196837'
    };
    firebase.initializeApp(config);
  });

  after(function() {
    const user = firebase.auth().currentUser;
    if (!user) {
      return;
    }

    return user.delete();
  });

  it('should test async', function() {
    return Promise.resolve();
  });

  describe('#testUser', function() {
    this.timeout(10000);
    it('should make a user', function() {
      const password = 'testpassword';
      const phoneNumber = '+14128051743';

      const db = new DB();

      return db
        .signUp(phoneNumber, password)
        .then(u => {
          assert.equal(u.phoneNumber, phoneNumber);

          assert.equal(firebase.auth().currentUser.email, u.phoneNumberEmail);
        })
        .then(() => {
          const user = firebase.auth().currentUser;
          return user.delete();
        });
    });

    it('should make a user, then login', function() {
      const password = 'testpassword';
      const phoneNumber = '+14128051743';

      const db = new DB();
      return db
        .signUp(phoneNumber, password)
        .then(u => {
          assert.equal(u.phoneNumber, phoneNumber);
          assert.equal(firebase.auth().currentUser.email, u.phoneNumberEmail);

          return db.logIn(phoneNumber, password);
        })
        .then(d => {
          assert.equal(d.phoneNumber, phoneNumber);
          assert.equal(firebase.auth().currentUser.email, d.phoneNumberEmail);
        })
        .then(() => {
          const user = firebase.auth().currentUser;
          return user.delete();
        });
    });
  });

  describe('#testTasks', function() {
    this.timeout(10000);
    before(function() {
      // make a user
      const password = 'testpassword';
      const phoneNumber = '+14128051743';

      const db = new DB();

      return db.signUp(phoneNumber, password);
    });

    after(function() {
      const user = firebase.auth().currentUser;
      if (!user) {
        return;
      }

      return user.delete();
    });

    afterEach(function() {
      const user = firebase.auth().currentUser;

      const userRef = firebase
        .firestore()
        .collection('users')
        .doc(new User({ phoneNumber: user.email }).phoneNumber)
        .collection('tasks');
      return userRef.get().then(refs => {
        return refs.forEach(ref => {
          return userRef.doc(ref.id).delete();
        });
      });
    });

    it('should make a task, and add to db', function() {
      const password = 'testpassword';
      const phoneNumber = '+14128051743';
      const db = new DB();
      return db
        .logIn(phoneNumber, password)
        .then(u => {
          const t = new Task();
          t.user = u;

          const v = new User({ phoneNumber: '+14128201743' });

          t.verifier = v;

          t.bet = { amount: 2 };

          t.dueDate = Date.now();

          return t;
        })
        .then(t => db.addTask(t))
        .then(t => {
          const store = firebase.firestore();
          const ref = store.doc(`users/${ 
                    t.user.phoneNumber 
                    }/tasks/${  
                    t.id}`);

          return ref.get().then(taskDoc => {
            assert.deepEqual(t.exp(), taskDoc.data());
          });
        });
    });

    it('should make a task, add to db, complete', function() {
      const password = 'testpassword';
      const phoneNumber = '+14128051743';
      const db = new DB();
      return db
        .logIn(phoneNumber, password)
        .then(u => {
          const t = new Task();
          t.user = u;

          const v = new User({ phoneNumber: '+14128201743' });

          t.verifier = v;

          t.bet = { amount: 2 };

          t.dueDate = Date.now();

          return t;
        })
        .then(t => db.addTask(t))
        .then(t => {
          return db.completeTask(t);
        })
        .then(t => {
          const store = firebase.firestore();
          const ref = store.doc(`users/${ 
                    t.user.phoneNumber 
                    }/tasks/${  
                    t.id}`);

          return ref.get().then(taskDoc => {
            assert.deepEqual(t.exp(), taskDoc.data());
            assert.equal(taskDoc.data().pendingCompletion, true);
            assert.equal(taskDoc.data().complete, false);
          });
        });
    });

    it('should make a task, add to db, complete, verify', function() {
      const password = 'testpassword';
      const phoneNumber = '+14128051743';
      const db = new DB();
      return db
        .logIn(phoneNumber, password)
        .then(u => {
          const t = new Task();
          t.user = u;

          const v = new User({ phoneNumber: '+14128201743@taskdaddy.com' });

          t.verifier = v;

          t.bet = { amount: 2 };

          t.dueDate = Date.now();

          return t;
        })
        .then(t => db.addTask(t))
        .then(t => {
          return db.completeTask(t);
        })
        .then(t => {
          return db.verifyTask(t);
        })
        .then(t => {
          const store = firebase.firestore();
          const ref = store.doc(`users/${ 
                    t.user.phoneNumber 
                    }/tasks/${  
                    t.id}`);

          return ref.get().then(taskDoc => {
            assert.deepEqual(t.exp(), taskDoc.data());
            assert.equal(taskDoc.data().pendingCompletion, false);
            assert.equal(taskDoc.data().complete, true);
          });
        });
    });

    it('should make a task, add to db, and retrieve', function() {
      const password = 'testpassword';
      const phoneNumber = '+14128051743';
      const db = new DB();
      return db
        .logIn(phoneNumber, password)
        .then(u => {
          const t = new Task();
          t.user = u;

          const v = new User({ phoneNumber: '+14128201743@taskdaddy.com' });

          t.verifier = v;

          t.bet = { amount: 2 };

          t.dueDate = Date.now() + 10000;

          return t;
        })
        .then(t => db.addTask(t))
        .then(t => {
          return db.getTaskItems(1).then(ts => {
            assert.deepEqual(ts[0].exp(), t.exp());
          });
        });
    });
  });

  describe('#testFeed', function () {
    this.timeout(10000);

    before(function() {
      // make a user
      const password = 'testpassword';
      const phoneNumber = '+14128051743';

      const db = new DB();

      return db.signUp(phoneNumber, password);
    });

    after(function() {
      const user = firebase.auth().currentUser;
      if (!user) {
        return;
      }

      return user.delete();
    });

    afterEach(function() {
      const feedRef = firebase
        .firestore()
        .collection('feed');
      return feedRef.get().then(refs => {
        return refs.forEach(ref => {
          return feedRef.doc(ref.id).delete();
        });
      });
    });

    it('should add a task to the feed', function () {
      const password = 'testpassword';
      const phoneNumber = '+14128051743';
      const db = new DB();
      return db
        .logIn(phoneNumber, password)
        .then(u => {
          const t = new Task();
          t.user = u;

          const v = new User({ phoneNumber: '+14128201743' });

          t.verifier = v;

          t.bet = { amount: 2 };
          t.name = "Test note";

          t.dueDate = Date.now();
          
          const ft = new FeedTask(t);
          ft.completionDate = Date.now();

          return ft;
        })
        .then(t => db.addTaskToFeed(t))
        .then(t => {
          const feedTaskRef = firebase.firestore().collection('feed').doc(t.feedId);
          return feedTaskRef.get().then(doc => {
            if(!doc.exists) {
              assert.fail();
            }

            assert.deepEqual(doc.data(), t.exp());
          });
        });
    });

    it('should add a task to the feed, retrieve', function () {
      const password = 'testpassword';
      const phoneNumber = '+14128051743';
      const db = new DB();
      return db
        .logIn(phoneNumber, password)
        .then(u => {
          const t = new Task();
          t.user = u;

          const v = new User({ phoneNumber: '+14128201743' });

          t.verifier = v;
          t.name = "Wow this is a task"

          t.bet = { amount: 2 };

          t.dueDate = Date.now();
          
          const ft = new FeedTask(t);
          ft.completionDate = Date.now();

          return ft;
        })
        .then(t => {
          return db.addTaskToFeed(t)
                    .then(() => db.getFeedItems(1))
                    .then(([feedItem]) => {
                        assert.equal(feedItem.className(), FeedTask.className);

                        assert.deepEqual(feedItem.exp(), t.exp());
                      });
        });
    });
  });
});

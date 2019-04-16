import User from './User';

export default class LoggedInUser extends User {
  isLoggedIn() {
    return true;
  }
}

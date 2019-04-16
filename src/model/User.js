import { PhoneNumberFormat as PNF, PhoneNumberUtil } from 'google-libphonenumber';
import Exportable from './Exportable';
// Require `PhoneNumberFormat`.

// Get an instance of `PhoneNumberUtil`.
const phoneUtil = PhoneNumberUtil.getInstance();
export const blankUser = {};

export default class User extends Exportable {
  constructor(userJson = blankUser) {
    super();
    this.exportJS = userJson;
  }

  get phoneNumber() {
    const fakePhone = this.exportJS.phoneNumber;
    return fakePhone.substr(0, fakePhone.length - '@taskdaddy.com'.length);
  }

  set phoneNumber(newNumber) {
    // assumes us
    const number = phoneUtil.parseAndKeepRawInput(newNumber, 'US');
    this.exportJS.phoneNumber = `${phoneUtil.format(number, PNF.E164)}@taskdaddy.com`;
  }

  get phoneNumberCountryCode() {
    return phoneUtil.parseAndKeepRawInput(this.phoneNumber, 'US').getCountryCodeOrDefault();
  }

  get phoneNumberEmail() {
    return this.exportJS.phoneNumber;
  }

  get phoneVerified() {
    return this.exportJS.phoneVerified;
  }

  set phoneVerified(isVerified) {
    this.exportJS.phoneVerified = isVerified;
  }

  get firstName() {
    return this.exportJS.firstName;
  }

  get lastName() {
    return this.exportJS.lastName;
  }

  get name() {
    return this.firstName + this.lastName;
  }

  set firstName(newFirstName) {
    this.exportJS.firstName = newFirstName;
  }

  set lastName(newLastName) {
    this.exportJS.lastName = newLastName;
  }

  get profilePhoto() {
    return this.exportJS.profilePhoto;
  }

  set profilePhoto(newProfilePhoto) {
    this.exportJS.profilePhoto = newProfilePhoto;
  }

  get numberOfTasks() {
    return this.exportJS.numberOfTasks || 0;
  }

  get numberOfTasksCompleted() {
    return this.exportJS.numberOfTasksCompleted || 0;
  }

  get mostRecentVerifier() {
    return this.exportJS.mostRecentVerifier ? User(this.exportJS.mostRecentVerifier) : null;
  }

  set mostRecentVerifier(newVerifier) {
    this.exportJS.mostRecentVerifier = newVerifier.exp();
  }

  get points() {
    return this.exportJS.points || 0;
  }

  set points(newPoints) {
    this.exportJS.points = newPoints;
  }

  isLoggedIn() {
    return false;
  }

  static get className() {
    return 'User';
  }

  className() {
    return User.className;
  }
}

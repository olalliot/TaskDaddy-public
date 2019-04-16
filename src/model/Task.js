import moment from 'moment-timezone';
import Exportable from './Exportable';
import User from './User';

export const blankTask = {};

export default class Task extends Exportable {
  constructor(taskJson = blankTask) {
    super();
    this.exportJS = taskJson;
  }

  get id() {
    return this.exportJS.id;
  }

  set id(newId) {
    this.exportJS.id = newId;
  }

  get user() {
    return this.exportJS.user ? new User(this.exportJS.user) : null;
  }

  set user(newUser) {
    this.exportJS.user = newUser.exp();
  }

  get complete() {
    return this.exportJS.complete;
  }

  set complete(isComplete) {
    this.exportJS.complete = isComplete;
  }

  get pendingCompletion() {
    return this.exportJS.pendingCompletion;
  }

  set pendingCompletion(isPendingCompletion) {
    this.exportJS.pendingCompletion = isPendingCompletion;
  }

  set verifier(newVerifier) {
    this.exportJS.verifier = newVerifier.exp();
  }

  get verifier() {
    return this.exportJS.verifier ? new User(this.exportJS.verifier) : null;
  }

  get bet() {
    return this.exportJS.bet;
  }

  set bet(newBet) {
    this.exportJS.bet = newBet;
  }

  get name() {
    return this.exportJS.name;
  }

  set name(newName) {
    this.exportJS.name = newName;
  }

  get notes() {
    return this.exportJS.notes;
  }

  set notes(newNotes) {
    this.exportJS.notes = newNotes;
  }

  get dueDate() {
    return this.exportJS.dueDate;
  }

  set dueDate(newDueDate) {
    this.exportJS.dueDate = newDueDate;
  }

  get momentDueDate() {
    return moment(this.dueDate / 1000, 'X');
  }

  get readableDate() {
    return Task.parseXToReadable(this.dueDate);
  }

  static parseXToReadable(UTC) {
    let momentDueDate = moment(UTC / 1000, 'X');
    momentDueDate = momentDueDate.tz(moment.tz.guess());

    return momentDueDate.format('LL');
  }

  static get className() {
    return 'Task';
  }

  className() {
    return Task.className;
  }
}

import Task from './Task';
import * as Errors from '../errors';

export default class FeedTask extends Task {
  constructor(normalTask) {
    if (normalTask.className && normalTask.className() === Task.className) {
      super(normalTask.exp());
    } else {
      super(normalTask);
    }
  }

  get pendingCompletion() {
    return false;
  }

  get complete() {
    return true;
  }

  get completionDate() {
    return this.exportJS.completionDate;
  }

  set completionDate(newDate) {
    this.exportJS.completionDate = newDate;
  }

  get readableCompletionDate() {
    return Task.parseXToReadable(this.completionDate);
  }

  get feedId() {
    return `${this.id}_${this.user.phoneNumber}`;
  }

  exp() {
    // only exp certain properties
    if (
      !this.exportJS.id ||
      !this.exportJS.user ||
      !this.exportJS.name ||
      !this.exportJS.name ||
      !this.exportJS.dueDate ||
      !this.exportJS.completionDate
    ) {
      throw new Errors.CorruptFeedTaskInvariant();
    }

    return {
      id: this.exportJS.id,
      user: this.exportJS.user,
      name: this.exportJS.name,
      dueDate: this.exportJS.dueDate,
      completionDate: this.exportJS.completionDate
    };
  }

  static get className() {
    return 'FeedTask';
  }

  className() {
    return FeedTask.className;
  }
}

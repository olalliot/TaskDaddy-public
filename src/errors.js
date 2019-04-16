export class PhoneAlreadyVerifiedError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, PhoneAlreadyVerifiedError);
  }
}

export class PhoneAlreadyPendingVerificationError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, PhoneAlreadyPendingVerificationError);
  }
}

export class PhoneNotVerifiedError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, PhoneNotVerifiedError);
  }
}

export class InvalidPasswordError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, InvalidPasswordError);
  }
}

export class NotLoggedInError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, NotLoggedInError);
  }
}

export class TaskDoesntExist extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, TaskDoesntExist);
  }
}

export class UserNotInDatabaseInvariant extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, UserNotInDatabaseInvariant);
  }
}

export class TaskIsAlreadyPending extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, TaskIsAlreadyPending);
  }
}

export class TaskIsNotPending extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, TaskIsNotPending);
  }
}

export class TaskIsAlreadyComplete extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, TaskIsAlreadyComplete);
  }
}

export class TaskNotInDatabaseError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, TaskNotInDatabaseError);
  }
}

export class TaskHasNoVerifierError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, TaskHasNoVerifierError);
  }
}

export class CantVerifyNoncompleteTask extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, CantVerifyNoncompleteTask);
  }
}

export class NotAFeedTaskInvariant extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, NotAFeedTaskInvariant);
  }
}

export class CorruptFeedTaskInvariant extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, CorruptFeedTaskInvariant);
  }
}

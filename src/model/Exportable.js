export default class Exportable {
  constructor() {
    this.exportJS = {};
  }

  exp() {
    return this.exportJS;
  }

  static get className() {
    return 'Exportable';
  }

  className() {
    return Exportable.className;
  }
}

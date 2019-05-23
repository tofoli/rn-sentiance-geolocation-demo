import SentianceTask from './SentianceTask';

export default class Task {
  static listeners() {
    SentianceTask.listeners();
  }

  static schedule() {
    SentianceTask.schedule();
  }

  static async cancel() {
    await SentianceTask.cancel();
  }
}

import SentianceTask from './SentianceTask';
import GeolocationTask from './GeolocationTask';

export default class Task {
  static listeners() {
    SentianceTask.listeners();
    GeolocationTask.listeners();
  }

  static schedule() {
    SentianceTask.schedule();
    GeolocationTask.schedule();
  }

  static timer() {
    SentianceTask.timer();
    GeolocationTask.timer();
  }

  static async cancel() {
    await SentianceTask.cancel();
    await GeolocationTask.cancel();
  }
}

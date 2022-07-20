import config from '../config';

export default {
  log(...args) {
    !config.JEST && console.log(...args);
  },
  error(...args) {
    !config.JEST && console.error(...args);
  }
}
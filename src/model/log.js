import createLogger from '../../util/react-native-log-level';

let instance = null;
export default function() {
  if (!instance) {
    instance = createLogger({
      level: 'debug'
    });
  }

  return instance;
}


import winston from 'winston';
import moment from 'moment';

const tsFormat = () => moment().format('YY/MM/DD HH:MM:SS');

export default new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: false,
      timestamp: tsFormat
    })
  ],
  exitOnError: false
});

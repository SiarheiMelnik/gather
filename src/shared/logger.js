
import winston from 'winston';

const tsFormat = () => (new Date()).toLocaleTimeString();

export default new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: false,
      json: true,
      timestamp: tsFormat,
      colorize: true
    })
  ],
  exitOnError: false
});

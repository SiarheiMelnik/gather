module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("babel-polyfill");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _slack = __webpack_require__(3);

	var _slack2 = _interopRequireDefault(_slack);

	var _bluebird = __webpack_require__(4);

	var _bluebird2 = _interopRequireDefault(_bluebird);

	var _ramda = __webpack_require__(5);

	var _ramda2 = _interopRequireDefault(_ramda);

	var _zlib = __webpack_require__(6);

	var _zlib2 = _interopRequireDefault(_zlib);

	var _request = __webpack_require__(7);

	var _request2 = _interopRequireDefault(_request);

	var _fs = __webpack_require__(8);

	var _fs2 = _interopRequireDefault(_fs);

	var _awsSdk = __webpack_require__(9);

	var _awsSdk2 = _interopRequireDefault(_awsSdk);

	var _logger = __webpack_require__(10);

	var _logger2 = _interopRequireDefault(_logger);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	_awsSdk2.default.config.setPromisesDependency(_bluebird2.default);
	_awsSdk2.default.config.region = ("us-east-1");

	const token = ("xoxb-95629550994-iTAWep0cPefHB5Rbj1Ysjqnt");
	const bot = _slack2.default.rtm.client();

	const slackFetcher = _request2.default.defaults({
	  headers: { Authorization: `Bearer ${ token }` }
	});

	const s3 = new _awsSdk2.default.S3();

	const slackDeleteFile = _bluebird2.default.promisify(_slack2.default.files.delete);
	const slackFileStream = (_ref) => {
	  let id = _ref.id;
	  let name = _ref.name;
	  let url_private_download = _ref.url_private_download;

	  const params = {
	    Bucket: 'gather-bot-bucket',
	    Key: `${ id }_${ Date.now() }_${ name }`,
	    Body: slackFetcher(url_private_download)
	  };

	  const upload = s3.upload(params);
	  return Promise.resolve();
	};

	const getFileInfo = _ramda2.default.pipeP(_bluebird2.default.promisify(_slack2.default.files.info));

	const fileHandler = msg => {
	  const file = _ramda2.default.path(['file', 'id'], msg);
	  return getFileInfo({ token: token, file: file }).then(d => {
	    var _R$prop = _ramda2.default.prop('file', d);

	    const id = _R$prop.id;
	    const name = _R$prop.name;
	    const mimetype = _R$prop.mimetype;
	    const url_private_download = _R$prop.url_private_download;

	    _logger2.default.info({ id: id, name: name, mimetype: mimetype, url_private_download: url_private_download });
	    return slackFileStream({ id: id, name: name, mimetype: mimetype, url_private_download: url_private_download });
	  }).then(() => _logger2.default.info('File on s3')).catch(_logger2.default.error.bind(_logger2.default));
	  //.finally(slackDeleteFile({ file, token: process.env.SLACK_TOKEN_TEST }));
	};

	bot.file_shared(fileHandler);
	bot.listen({ token: token });

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("slack");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("bluebird");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("ramda");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("zlib");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("aws-sdk");

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _winston = __webpack_require__(11);

	var _winston2 = _interopRequireDefault(_winston);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = new _winston2.default.Logger({
	  transports: [new _winston2.default.transports.Console({
	    handleExceptions: true,
	    json: true
	  })],
	  exitOnError: false
	});

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("winston");

/***/ }
/******/ ]);
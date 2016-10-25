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
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(11);


/***/ },

/***/ 1:
/***/ function(module, exports) {

	module.exports = require("babel-polyfill");

/***/ },

/***/ 11:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	const appToken = ("Xx9e6lQupJSJU5QLYGZByb82");

	const events = exports.events = (event, context, cb) => {
	  const body = JSON.parse(event.body);
	  console.log(body);
	  const token = body.token;
	  const challenge = body.challenge;
	  const type = body.type;


	  if (appToken !== token) return cb(null, { statusCode: 401 });

	  switch (type) {
	    case 'url_verification':
	      return cb(null, {
	        statusCode: 200,
	        body: JSON.stringify({ challenge: challenge })
	      });
	    case 'file_created':
	    case 'file_shared':
	      console.log(body);
	      return cb(null, {
	        statusCode: 200
	      });
	      break;
	    default:
	      return cb(null, {
	        statusCode: 200
	      });
	  }
	};

	const commands = exports.commands = (event, ctx, cb) => {
	  console.log(event);
	  return cb(null, { statusCode: 200, body: JSON.stringify('pong') });
	};

/***/ }

/******/ });
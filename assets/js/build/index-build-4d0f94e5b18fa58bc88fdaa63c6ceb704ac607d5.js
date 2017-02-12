/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "{{ site.github.url }}/assets/js/build/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* global releases */

var latestRelease = releases.sort(function (r1, r2) {
    return new Date(r2.published_at) - new Date(r1.published_at);
})[0];
var downloadsContainer = document.querySelectorAll('#downloads a');

latestRelease.assets.forEach(function (download) {
    if (download.name.toLowerCase().indexOf('windows') > -1) {
        downloadsContainer[0].href = download.browser_download_url;
    }
    if (download.name.toLowerCase().indexOf('macos') > -1) {
        downloadsContainer[1].href = download.browser_download_url;
    }
    if (download.name.toLowerCase().indexOf('linux') > -1) {
        downloadsContainer[2].href = download.browser_download_url;
    }
});

var locationHash = window.location.hash;

if (window.location.hash[0] === '#') {
    locationHash = window.location.hash.slice(1);
}

var urlParams = new URLSearchParams(locationHash);
var isUpdating = urlParams.has('installedVersion');

if (isUpdating) {
    var currentlyInstalledVersion = urlParams.get('installedVersion');
    console.log(currentlyInstalledVersion);
}

/***/ })
/******/ ]);
//# sourceMappingURL=index-build-4d0f94e5b18fa58bc88fdaa63c6ceb704ac607d5.js.map
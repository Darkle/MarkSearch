'use strict';

/*
 https://github.com/tonekk/hash.js

 The MIT License (MIT)
 Copyright © 2016 <copyright holders>

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


var arrayKeyRegex =  /(.*)\[\]=(.*)/,
  specialCharRegex = /[=\[\]\&]/,
  normalKeyRegex =  /(.*)=(.*)/,
  helpers = {},
  locationHash;


helpers.parseHash = function() {

  var newLocationHash = {},
    keyValuePairs = window.location.hash.slice(2).split('&');

  for (var i = 0; i < keyValuePairs.length; i++) {

    var matches = null,
      keyValuePair = keyValuePairs[i];

    if (keyValuePair === "") {
      continue;
    }

    if (matches = keyValuePair.match(arrayKeyRegex)) {
      if (newLocationHash[matches[1]]) {
        newLocationHash[matches[1]].push(matches[2]);
      } else {
        newLocationHash[matches[1]] = [matches[2]];
      }
    } else if (matches = keyValuePair.match(normalKeyRegex)) {
      newLocationHash[matches[1]] = matches[2];
    }
  }

  locationHash = newLocationHash;
};

/* Write locationHash object to url, when it changes */
helpers.updateUrl = function() {

  var newLocationHash = "#!";

  for (var key in locationHash) {
    if (locationHash[key] instanceof Array) {
      for (var i = 0; i < locationHash[key].length; i++) {
        newLocationHash += '&' + key + '[]=' + locationHash[key][i];
      }
    } else {
      newLocationHash += '&' + key + '=' + locationHash[key];
    }
  }

  /* Temporarily deactivate event */
  window.onhashchange = null;
  window.location.hash = newLocationHash;
  window.onhashchange = helpers.parseHash;
};

/* Compute initial locationHash object from url */
helpers.parseHash();

/* Set onhashchange event to update locationHash */
window.onhashchange = helpers.parseHash;

/* Main function to get / set location#hash */
var hash = function(key, val) {

  /* Should return locationHash with arguments */
  if (!arguments.length) {
    return locationHash;
  }

  /* '=', '[', ']' and '&' are special chars */
  if (key.match(specialCharRegex)) {
    throw('Cannot use key \'' + key + '\', because it contains special characters.')
  }

  if (arguments.length == 2) {

    /* Passing undefined deletes key */
    if (val === undefined) {
      delete locationHash[key];
    } else {
      locationHash[key] = val;
    }

    helpers.updateUrl();

  } else {
    return locationHash[key];
  }
};

export { hash }
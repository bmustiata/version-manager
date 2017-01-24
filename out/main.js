#!/usr/bin/env node
require("source-map-support/register");

module.exports =
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
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
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

	"use strict";
	
	var fs = __webpack_require__(3);
	var glob = __webpack_require__(4);
	var colors = __webpack_require__(5);
	var path = __webpack_require__(6);
	var SettingsReader_1 = __webpack_require__(7);
	var defaultSettingsFile = path.resolve(path.join(process.cwd(), "versions.json"));
	var versionsToProcess = SettingsReader_1.readSettingsFile(defaultSettingsFile);
	var filesToProcess = {};
	versionsToProcess.forEach(function (trackedVersion) {
	    Object.keys(trackedVersion.files).forEach(function (fileName) {
	        var versionPattern = trackedVersion.files[fileName];
	        var resolvedNames = glob.sync(fileName);
	        if (!resolvedNames || !resolvedNames.length) {
	            console.error(colors.red("Unable to find any files for glob " + fileName + "."));
	            process.exit(2);
	        }
	        // first we collect all the files that we need to process
	        // into one nice map, with all the patterns that are going
	        // to run over those files.
	        resolvedNames.forEach(function (resolvedName) {
	            var filePatterns = filesToProcess[resolvedName] || [];
	            filePatterns.push(versionPattern);
	            filesToProcess[resolvedName] = filePatterns;
	        });
	    });
	});
	Object.keys(filesToProcess).forEach(function (resolvedName) {
	    var content = fs.readFileSync(resolvedName, "utf-8");
	    var newContent = content;
	    console.log("Patching " + colors.cyan(resolvedName) + ":");
	    filesToProcess[resolvedName].forEach(function (versionPattern) {
	        var trackedVersion = versionPattern.trackedVersion;
	        console.log(" * " + colors.green(trackedVersion.name + '@' + trackedVersion.version));
	        newContent = versionPattern.applyPattern(newContent);
	        if (versionPattern.getMatchCount() != versionPattern.getExpectedCount()) {
	            console.error(colors.red("Got " + versionPattern.getMatchCount() + " matches " + ("instead of " + versionPattern.getExpectedCount() + ".")));
	            process.exit(3);
	        }
	    });
	    if (content == newContent) {
	        console.log(colors.cyan("Content for " + resolvedName + " is not changed. Won't patch it."));
	        return;
	    }
	    fs.writeFileSync(resolvedName, newContent, "utf-8");
	    console.log(colors.yellow("Updated " + resolvedName));
	});
	process.exit(0);

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("glob");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("colors");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var colors = __webpack_require__(5);
	var path = __webpack_require__(6);
	var fs = __webpack_require__(3);
	var yaml = __webpack_require__(8);
	var MatcherBuilder_1 = __webpack_require__(9);
	var ParseVersion_1 = __webpack_require__(15);
	/**
	 * readSettingsFile - Read the settings file.
	 * @return {ITrackedVersionSet}
	 */
	function readSettingsFile(settingsFile) {
	    if (!settingsFileExists(settingsFile)) {
	        settingsFile = path.join(path.dirname(settingsFile), "versions.yml");
	        if (!settingsFileExists(settingsFile)) {
	            reportMissingSettingsFile(settingsFile);
	            process.exit(1);
	        }
	    }
	    var settings = yaml.load(fs.readFileSync(settingsFile, "utf-8"));
	    return Object.keys(settings).map(function (key) {
	        var trackedEntry = settings[key];
	        trackedEntry.name = key;
	        trackedEntry.version = ParseVersion_1.parseVersion(trackedEntry.version);
	        Object.keys(trackedEntry.files).forEach(function (file) {
	            trackedEntry.files[file] = MatcherBuilder_1.matcherBuilder(trackedEntry, trackedEntry.files[file]);
	        });
	        return trackedEntry;
	    });
	}
	exports.readSettingsFile = readSettingsFile;
	function settingsFileExists(settingsFile) {
	    return fs.existsSync(settingsFile);
	}
	function reportMissingSettingsFile(settingsFile) {
	    console.log(colors.red(settingsFile + " configuration file is missing."));
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("js-yaml");

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var RegExPattern_1 = __webpack_require__(10);
	var StringPattern_1 = __webpack_require__(11);
	var MatchCounter_1 = __webpack_require__(13);
	var ArrayPattern_1 = __webpack_require__(14);
	function matcherBuilder(trackedVersion, fileItem) {
	    if (fileItem instanceof Array) {
	        return new ArrayPattern_1.ArrayPattern(trackedVersion, fileItem.map(function (it) {
	            return matcherBuilder(trackedVersion, it);
	        }));
	    }
	    if (typeof fileItem['count'] != "undefined") {
	        return new MatchCounter_1.MatchCounter(trackedVersion, matcherBuilder(trackedVersion, fileItem.match || fileItem.expression), fileItem.count);
	    }
	    if (StringPattern_1.StringPattern.RE.test(fileItem)) {
	        return new StringPattern_1.StringPattern(trackedVersion, fileItem);
	    }
	    return new RegExPattern_1.RegExPattern(trackedVersion, fileItem);
	}
	exports.matcherBuilder = matcherBuilder;

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var RegExPattern = function () {
	    function RegExPattern(trackedVersion, expression) {
	        _classCallCheck(this, RegExPattern);
	
	        this.trackedVersion = trackedVersion;
	        this.expression = expression;
	        this.matchCount = 0;
	        this.RE = new RegExp(expression, "gm");
	    }
	
	    _createClass(RegExPattern, [{
	        key: "applyPattern",
	        value: function applyPattern(input) {
	            var _this = this;
	
	            var match = void 0;
	            var foundMatches = [];
	            while (match = this.RE.exec(input)) {
	                this.matchCount++;
	                this.RE.lastIndex = match.index + match[0].length;
	                foundMatches.push(match);
	            }
	            // this tracks the original input, since the matches are done
	            // aginst the unmodified string.
	            var originalIndex = 0;
	            var originalInput = input;
	            var result = "";
	            foundMatches.forEach(function (match) {
	                result += originalInput.substring(originalIndex, match.index) + match[1] + _this.trackedVersion.version + (match[3] ? match[3] : "");
	                originalIndex = match.index + match[0].length;
	            });
	            result += originalInput.substring(originalIndex, originalInput.length);
	            return result;
	        }
	    }, {
	        key: "getMatchCount",
	        value: function getMatchCount() {
	            return this.matchCount;
	        }
	    }, {
	        key: "getExpectedCount",
	        value: function getExpectedCount() {
	            return 1;
	        }
	    }]);
	
	    return RegExPattern;
	}();
	
	exports.RegExPattern = RegExPattern;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var RegExPattern_1 = __webpack_require__(10);
	var escapeStringRegexp = __webpack_require__(12);
	
	var StringPattern = function () {
	    function StringPattern(trackedVersion, expression) {
	        _classCallCheck(this, StringPattern);
	
	        this.trackedVersion = trackedVersion;
	        this.expression = expression;
	        var escapedExpression = escapeStringRegexp(expression);
	        var m = StringPattern.RE.exec(expression);
	        var regexpValue = "" + (m[2] == '^^' ? '^()' : "(" + m[1] + ")") + "(.*?)" + ("" + (m[3] == '$$' ? '$' : "(" + m[4] + ")"));
	        this._regexPattern = new RegExPattern_1.RegExPattern(trackedVersion, regexpValue);
	    }
	
	    _createClass(StringPattern, [{
	        key: "applyPattern",
	        value: function applyPattern(input) {
	            return this._regexPattern.applyPattern(input);
	        }
	    }, {
	        key: "getMatchCount",
	        value: function getMatchCount() {
	            return this._regexPattern.getMatchCount();
	        }
	    }, {
	        key: "getExpectedCount",
	        value: function getExpectedCount() {
	            return 1;
	        }
	    }]);
	
	    return StringPattern;
	}();
	
	StringPattern.RE = /^(.*?)(\^\^|##)VERSION(##|\$\$)(.*?)$/;
	exports.StringPattern = StringPattern;

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("escape-string-regexp");

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var MatchCounter = function () {
	    function MatchCounter(trackedVersion, delegatePattern, expectedCount) {
	        _classCallCheck(this, MatchCounter);
	
	        this.trackedVersion = trackedVersion;
	        this.delegatePattern = delegatePattern;
	        this.expectedCount = expectedCount;
	    }
	
	    _createClass(MatchCounter, [{
	        key: "applyPattern",
	        value: function applyPattern(input) {
	            return this.delegatePattern.applyPattern(input);
	        }
	    }, {
	        key: "getMatchCount",
	        value: function getMatchCount() {
	            if (this.expectedCount < 0) {
	                return this.expectedCount;
	            }
	            return this.delegatePattern.getMatchCount();
	        }
	    }, {
	        key: "getExpectedCount",
	        value: function getExpectedCount() {
	            return this.expectedCount;
	        }
	    }]);
	
	    return MatchCounter;
	}();
	
	exports.MatchCounter = MatchCounter;

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var ArrayPattern = function () {
	    function ArrayPattern(trackedVersion, delegatePatterns) {
	        _classCallCheck(this, ArrayPattern);
	
	        this.trackedVersion = trackedVersion;
	        this.delegatePatterns = delegatePatterns;
	    }
	
	    _createClass(ArrayPattern, [{
	        key: "applyPattern",
	        value: function applyPattern(input) {
	            return this.delegatePatterns.reduce(function (input, pattern) {
	                return pattern.applyPattern(input);
	            }, input);
	        }
	    }, {
	        key: "getMatchCount",
	        value: function getMatchCount() {
	            return this.delegatePatterns.map(function (it) {
	                return it.getMatchCount();
	            }).reduce(function (x, y) {
	                return x + y;
	            }, 0);
	        }
	    }, {
	        key: "getExpectedCount",
	        value: function getExpectedCount() {
	            return this.delegatePatterns.map(function (it) {
	                return it.getExpectedCount();
	            }).reduce(function (x, y) {
	                return x + y;
	            }, 0);
	        }
	    }]);
	
	    return ArrayPattern;
	}();
	
	exports.ArrayPattern = ArrayPattern;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var child_process = __webpack_require__(16);
	var path = __webpack_require__(6);
	var fs = __webpack_require__(3);
	var SettingsReader_1 = __webpack_require__(7);
	// cache the settings files.
	var settingFiles = {};
	function parseParentPath(version, cwd) {
	    var items = /^parent:(.+)@(.+?)$/.exec(version);
	    if (!items) {
	        throw new Error("The version must be in the 'parent:path@propertyname' " + ("format, got instead: '" + version + "'."));
	    }
	    var parentVersionsFilePath = items[1];
	    var propertyName = items[2];
	    var fullPath = path.resolve(path.join(cwd, items[1]));
	    if (!fs.existsSync(fullPath)) {
	        throw new Error("Unable to find referenced file: " + fullPath);
	    }
	    if (fs.statSync(fullPath).isDirectory()) {
	        fullPath = path.join(fullPath, "versions.json");
	    }
	    if (!settingFiles[fullPath]) {
	        settingFiles[fullPath] = SettingsReader_1.readSettingsFile(fullPath);
	    }
	    var propertyValue = settingFiles[fullPath].find(function (it) {
	        return it.name == propertyName;
	    });
	    if (!propertyValue) {
	        var availableProperties = settingFiles[fullPath].map(function (it) {
	            return it.name + "@" + it.version;
	        }).join(", ");
	        throw new Error("Property '" + propertyName + "' is not defined in " + fullPath + (" settings file. Available properties are: " + availableProperties + "."));
	    }
	    return propertyValue.version;
	}
	function parseVersionWithPath(version, cwd) {
	    // from here, the path becomes important, since the process execution
	    // and the parent: referening depends on where the currently parsed
	    // versions.json file is being parsed from.
	    var oldPath = process.cwd();
	    try {
	        process.chdir(cwd);
	        // check if this is not an external json file, in the
	        // format: parent:../path/to/versions.json:property_name
	        // or    : parent:../path/to:property_name
	        if (version.startsWith('parent:')) {
	            return parseParentPath(version, cwd);
	        }
	        // if we don't need to execute anything, just go
	        // and return the current version.
	        if (version.indexOf('`') == -1 && version.indexOf("$") == -1) {
	            return version;
	        }
	        return child_process.execSync("echo -n \"" + version + "\"", { encoding: "utf8" });
	    } finally {
	        process.chdir(oldPath);
	    }
	}
	/**
	 * Parse the given version string.
	 */
	function parseVersion(version) {
	    return parseVersionWithPath(version, process.cwd());
	}
	exports.parseVersion = parseVersion;

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = require("child_process");

/***/ }
/******/ ]);
//# sourceMappingURL=main.js.map
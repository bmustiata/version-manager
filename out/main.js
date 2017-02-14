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
	var nomnom = __webpack_require__(18);
	var SettingsReader_1 = __webpack_require__(7);
	var argv = nomnom.option('version', {
	    abbr: 'v',
	    help: 'Display the version of a single tracked version.'
	}).parse();
	var defaultSettingsFile = path.resolve(path.join(process.cwd(), "versions.json"));
	var versionsToProcess = SettingsReader_1.readSettingsFile(defaultSettingsFile);
	if (argv.version) {
	    var trackedVersion = versionsToProcess.find(function (it) {
	        return it.name == argv.version;
	    });
	    if (!trackedVersion) {
	        console.error("Tracked version '" + argv.version + "' does not exist. Available are: " + versionsToProcess.map(function (it) {
	            return "'" + it.name + "'";
	        }).join(", ") + ".");
	        process.exit(1);
	    }
	    console.log(trackedVersion.version);
	    process.exit(0);
	}
	var filesToProcess = {};
	var changedFiles = false;
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
	    changedFiles = true;
	    fs.writeFileSync(resolvedName, newContent, "utf-8");
	    console.log(colors.yellow("Updated " + resolvedName));
	});
	process.exit(changedFiles ? 200 : 0);

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
	var ParseVersion_1 = __webpack_require__(16);
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
	        // made the files optional, so we can have "bom" version files
	        if (!trackedEntry.files) {
	            trackedEntry.files = {};
	        }
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
	var MavenPattern_1 = __webpack_require__(13);
	var MatchCounter_1 = __webpack_require__(14);
	var ArrayPattern_1 = __webpack_require__(15);
	function matcherBuilder(trackedVersion, fileItem) {
	    if (fileItem instanceof Array) {
	        return new ArrayPattern_1.ArrayPattern(trackedVersion, fileItem.map(function (it) {
	            return matcherBuilder(trackedVersion, it);
	        }));
	    }
	    if (typeof fileItem['count'] != "undefined") {
	        return new MatchCounter_1.MatchCounter(trackedVersion, matcherBuilder(trackedVersion, fileItem.match || fileItem.expression), fileItem.count);
	    }
	    if (MavenPattern_1.MavenPattern.RE.test(fileItem)) {
	        return new MavenPattern_1.MavenPattern(trackedVersion, fileItem);
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
	        var m = StringPattern.RE.exec(expression);
	        if (m[2] == '##' || m[3] == '##') {
	            console.warn("Version matched using expression '" + expression + "' " + "still uses the old '##' notation for delimiting the " + "version. This is not supported anymore since # denotes " + "a comment in YAML. Use '**' instead.");
	        }
	        var regexpValue = "" + (m[2] == '^^' ? '^()' : "(" + escapeStringRegexp(m[1]) + ")") + "(.*?)" + ("" + (m[3] == '$$' ? '$' : "(" + escapeStringRegexp(m[4]) + ")"));
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
	
	StringPattern.RE = /^(.*?)(\^\^|##|\*\*)VERSION(##|\*\*|\$\$)(.*?)$/;
	exports.StringPattern = StringPattern;

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("escape-string-regexp");

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var RegExPattern_1 = __webpack_require__(10);
	var escapeStringRegexp = __webpack_require__(12);
	
	var MavenPattern = function () {
	    function MavenPattern(trackedVersion, expression) {
	        _classCallCheck(this, MavenPattern);
	
	        this.trackedVersion = trackedVersion;
	        this.expression = expression;
	        var m = MavenPattern.RE.exec(expression);
	        var regexpValue = "(<groupId>" + escapeStringRegexp(m[1]) + "</groupId>\\s*" + ("<artifactId>" + escapeStringRegexp(m[2]) + "</artifactId>\\s*") + "<version>)(.*?)(</version>)";
	        this._regexPattern = new RegExPattern_1.RegExPattern(trackedVersion, regexpValue);
	    }
	
	    _createClass(MavenPattern, [{
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
	
	    return MavenPattern;
	}();
	
	MavenPattern.RE = /^maven\:(.*?)\:(.*?)$/;
	exports.MavenPattern = MavenPattern;

/***/ },
/* 14 */
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
/* 15 */
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var child_process = __webpack_require__(17);
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
	    if (typeof version !== "string") {
	        throw new Error("Got version a " + version + " of type " + (typeof version === "undefined" ? "undefined" : _typeof(version)) + ", in " + cwd + ".");
	    }
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
/* 17 */
/***/ function(module, exports) {

	module.exports = require("child_process");

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(19), chalk = __webpack_require__(20);
	
	
	function ArgParser() {
	   this.commands = {};  // expected commands
	   this.specs = {};     // option specifications
	}
	
	ArgParser.prototype = {
	  /* Add a command to the expected commands */
	  command : function(name) {
	    var command;
	    if (name) {
	      command = this.commands[name] = {
	        name: name,
	        specs: {}
	      };
	    }
	    else {
	      command = this.fallback = {
	        specs: {}
	      };
	    }
	
	    // facilitates command('name').options().cb().help()
	    var chain = {
	      options : function(specs) {
	        command.specs = specs;
	        return chain;
	      },
	      opts : function(specs) {
	        // old API
	        return this.options(specs);
	      },
	      option : function(name, spec) {
	        command.specs[name] = spec;
	        return chain;
	      },
	      callback : function(cb) {
	        command.cb = cb;
	        return chain;
	      },
	      help : function(help) {
	        command.help = help;
	        return chain;
	      },
	      usage : function(usage) {
	        command._usage = usage;
	        return chain;
	      }
	    };
	    return chain;
	  },
	
	  nocommand : function() {
	    return this.command();
	  },
	
	  options : function(specs) {
	    this.specs = specs;
	    return this;
	  },
	
	  opts : function(specs) {
	    // old API
	    return this.options(specs);
	  },
	
	  globalOpts : function(specs) {
	    // old API
	    return this.options(specs);
	  },
	
	  option : function(name, spec) {
	    this.specs[name] = spec;
	    return this;
	  },
	
	  usage : function(usage) {
	    this._usage = usage;
	    return this;
	  },
	
	  printer : function(print) {
	    this.print = print;
	    return this;
	  },
	
	  script : function(script) {
	    this._script = script;
	    return this;
	  },
	
	  scriptName : function(script) {
	    // old API
	    return this.script(script);
	  },
	
	  help : function(help) {
	    this._help = help;
	    return this;
	  },
	
	  colors: function() {
	    // deprecated - colors are on by default now
	    return this;
	  },
	
	  nocolors : function() {
	    this._nocolors = true;
	    return this;
	  },
	
	  parseArgs : function(argv) {
	    // old API
	    return this.parse(argv);
	  },
	
	  nom : function(argv) {
	    return this.parse(argv);
	  },
	
	  parse : function(argv) {
	    this.print = this.print || function(str, code) {
	      console.log(str);
	      process.exit(code || 0);
	    };
	    this._help = this._help || "";
	    this._script = this._script || process.argv[0] + " "
	          + __webpack_require__(6).basename(process.argv[1]);
	    this.specs = this.specs || {};
	
	    var argv = argv || process.argv.slice(2);
	
	    var arg = Arg(argv[0]).isValue && argv[0],
	        command = arg && this.commands[arg],
	        commandExpected = !_(this.commands).isEmpty();
	
	    if (commandExpected) {
	       if (command) {
	          _(this.specs).extend(command.specs);
	          this._script += " " + command.name;
	          if (command.help) {
	            this._help = command.help;
	          }
	          this.command = command;
	       }
	       else if (arg) {
	          return this.print(this._script + ": no such command '" + arg + "'", 1);
	       }
	       else {
	          // no command but command expected e.g. 'git -v'
	          var helpStringBuilder = {
	            list : function() {
	               return 'one of: ' + _(this.commands).keys().join(", ");
	            },
	            twoColumn : function() {
	              // find the longest command name to ensure horizontal alignment
	              var maxLength = _(this.commands).max(function (cmd) {
	                return cmd.name.length;
	              }).name.length;
	
	              // create the two column text strings
	              var cmdHelp = _.map(this.commands, function(cmd, name) {
	                var diff = maxLength - name.length;
	                var pad = new Array(diff + 4).join(" ");
	                return "  " + [ name, pad, cmd.help ].join(" ");
	              });
	              return "\n" + cmdHelp.join("\n");
	            }
	          };
	
	          // if there are a small number of commands and all have help strings,
	          // display them in a two column table; otherwise use the brief version.
	          // The arbitrary choice of "20" comes from the number commands git
	          // displays as "common commands"
	          var helpType = 'list';
	          if (_(this.commands).size() <= 20) {
	            if (_(this.commands).every(function (cmd) { return cmd.help; })) {
	                helpType = 'twoColumn';
	            }
	          }
	
	          this.specs.command = {
	            position: 0,
	            help: helpStringBuilder[helpType].call(this)
	          }
	
	          if (this.fallback) {
	            _(this.specs).extend(this.fallback.specs);
	            this._help = this.fallback.help;
	          } else {
	            this.specs.command.required = true;
	          }
	       }
	    }
	
	    if (this.specs.length === undefined) {
	      // specs is a hash not an array
	      this.specs = _(this.specs).map(function(opt, name) {
	        opt.name = name;
	        return opt;
	      });
	    }
	    this.specs = this.specs.map(function(opt) {
	      return Opt(opt);
	    });
	
	    if (argv.indexOf("--help") >= 0 || argv.indexOf("-h") >= 0) {
	      return this.print(this.getUsage());
	    }
	
	    var options = {};
	    var args = argv.map(function(arg) {
	      return Arg(arg);
	    })
	    .concat(Arg());
	
	    var positionals = [];
	
	    /* parse the args */
	    var that = this;
	    args.reduce(function(arg, val) {
	      /* positional */
	      if (arg.isValue) {
	        positionals.push(arg.value);
	      }
	      else if (arg.chars) {
	        var last = arg.chars.pop();
	
	        /* -cfv */
	        (arg.chars).forEach(function(ch) {
	          that.setOption(options, ch, true);
	        });
	
	        /* -v key */
	        if (!that.opt(last).flag) {
	           if (val.isValue)  {
	              that.setOption(options, last, val.value);
	              return Arg(); // skip next turn - swallow arg
	           }
	           else {
	              that.print("'-" + (that.opt(last).name || last) + "'"
	                + " expects a value\n\n" + that.getUsage(), 1);
	           }
	        }
	        else {
	          /* -v */
	          that.setOption(options, last, true);
	        }
	
	      }
	      else if (arg.full) {
	        var value = arg.value;
	
	        /* --key */
	        if (value === undefined) {
	          /* --key value */
	          if (!that.opt(arg.full).flag) {
	            if (val.isValue) {
	              that.setOption(options, arg.full, val.value);
	              return Arg();
	            }
	            else {
	              that.print("'--" + (that.opt(arg.full).name || arg.full) + "'"
	                + " expects a value\n\n" + that.getUsage(), 1);
	            }
	          }
	          else {
	            /* --flag */
	            value = true;
	          }
	        }
	        that.setOption(options, arg.full, value);
	      }
	      return val;
	    });
	
	    positionals.forEach(function(pos, index) {
	      this.setOption(options, index, pos);
	    }, this);
	
	    options._ = positionals;
	
	    this.specs.forEach(function(opt) {
	      if (opt.default !== undefined && options[opt.name] === undefined) {
	        options[opt.name] = opt.default;
	      }
	    }, this);
	
	    // exit if required arg isn't present
	    this.specs.forEach(function(opt) {
	      if (opt.required && options[opt.name] === undefined) {
	         var msg = opt.name + " argument is required";
	         msg = this._nocolors ? msg : chalk.red(msg);
	
	         this.print("\n" + msg + "\n" + this.getUsage(), 1);
	      }
	    }, this);
	
	    if (command && command.cb) {
	      command.cb(options);
	    }
	    else if (this.fallback && this.fallback.cb) {
	      this.fallback.cb(options);
	    }
	
	    return options;
	  },
	
	  getUsage : function() {
	    if (this.command && this.command._usage) {
	      return this.command._usage;
	    }
	    else if (this.fallback && this.fallback._usage) {
	      return this.fallback._usage;
	    }
	    if (this._usage) {
	      return this._usage;
	    }
	
	    // todo: use a template
	    var str = "\n"
	    if (!this._nocolors) {
	      str += chalk.bold("Usage:");
	    }
	    else {
	      str += "Usage:";
	    }
	    str += " " + this._script;
	
	    var positionals = _(this.specs).select(function(opt) {
	      return opt.position != undefined;
	    })
	    positionals = _(positionals).sortBy(function(opt) {
	      return opt.position;
	    });
	    var options = _(this.specs).select(function(opt) {
	      return opt.position === undefined;
	    });
	
	    // assume there are no gaps in the specified pos. args
	    positionals.forEach(function(pos) {
	      str += " ";
	      var posStr = pos.string;
	      if (!posStr) {
	        posStr = pos.name || "arg" + pos.position;
	        if (pos.required) {
	            posStr = "<" + posStr + ">";
	        } else {
	            posStr = "[" + posStr + "]";
	        }
	        if (pos.list) {
	          posStr += "...";
	        }
	      }
	      str += posStr;
	    });
	
	    if (options.length) {
	      if (!this._nocolors) {
	        // must be a better way to do this
	        str += chalk.blue(" [options]");
	      }
	      else {
	        str += " [options]";
	      }
	    }
	
	    if (options.length || positionals.length) {
	      str += "\n\n";
	    }
	
	    function spaces(length) {
	      var spaces = "";
	      for (var i = 0; i < length; i++) {
	        spaces += " ";
	      }
	      return spaces;
	    }
	    var longest = positionals.reduce(function(max, pos) {
	      return pos.name.length > max ? pos.name.length : max;
	    }, 0);
	
	    positionals.forEach(function(pos) {
	      var posStr = pos.string || pos.name;
	      str += posStr + spaces(longest - posStr.length) + "     ";
	      if (!this._nocolors) {
	        str += chalk.grey(pos.help || "")
	      }
	      else {
	        str += (pos.help || "")
	      }
	      str += "\n";
	    }, this);
	    if (positionals.length && options.length) {
	      str += "\n";
	    }
	
	    if (options.length) {
	      if (!this._nocolors) {
	        str += chalk.blue("Options:");
	      }
	      else {
	        str += "Options:";
	      }
	      str += "\n"
	
	      var longest = options.reduce(function(max, opt) {
	        return opt.string.length > max && !opt.hidden ? opt.string.length : max;
	      }, 0);
	
	      options.forEach(function(opt) {
	        if (!opt.hidden) {
	          str += "   " + opt.string + spaces(longest - opt.string.length) + "   ";
	
	          var defaults = (opt.default != null ? "  [" + opt.default + "]" : "");
	          var help = opt.help ? opt.help + defaults : "";
	          str += this._nocolors ? help: chalk.grey(help);
	
	          str += "\n";
	        }
	      }, this);
	    }
	
	    if (this._help) {
	      str += "\n" + this._help;
	    }
	    return str;
	  }
	};
	
	ArgParser.prototype.opt = function(arg) {
	  // get the specified opt for this parsed arg
	  var match = Opt({});
	  this.specs.forEach(function(opt) {
	    if (opt.matches(arg)) {
	       match = opt;
	    }
	  });
	  return match;
	};
	
	ArgParser.prototype.setOption = function(options, arg, value) {
	  var option = this.opt(arg);
	  if (option.callback) {
	    var message = option.callback(value);
	
	    if (typeof message == "string") {
	      this.print(message, 1);
	    }
	  }
	
	  if (option.type != "string") {
	     try {
	       // infer type by JSON parsing the string
	       value = JSON.parse(value)
	     }
	     catch(e) {}
	  }
	
	  if (option.transform) {
	     value = option.transform(value);
	  }
	
	  var name = option.name || arg;
	  if (option.choices && option.choices.indexOf(value) == -1) {
	     this.print(name + " must be one of: " + option.choices.join(", "), 1);
	  }
	
	  if (option.list) {
	    if (!options[name]) {
	      options[name] = [value];
	    }
	    else {
	      options[name].push(value);
	    }
	  }
	  else {
	    options[name] = value;
	  }
	};
	
	
	/* an arg is an item that's actually parsed from the command line
	   e.g. "-l", "log.txt", or "--logfile=log.txt" */
	var Arg = function(str) {
	  var abbrRegex = /^\-(\w+?)$/,
	      fullRegex = /^\-\-(no\-)?(.+?)(?:=(.+))?$/,
	      valRegex = /^[^\-].*/;
	
	  var charMatch = abbrRegex.exec(str),
	      chars = charMatch && charMatch[1].split("");
	
	  var fullMatch = fullRegex.exec(str),
	      full = fullMatch && fullMatch[2];
	
	  var isValue = str !== undefined && (str === "" || valRegex.test(str));
	  var value;
	  if (isValue) {
	    value = str;
	  }
	  else if (full) {
	    value = fullMatch[1] ? false : fullMatch[3];
	  }
	
	  return {
	    str: str,
	    chars: chars,
	    full: full,
	    value: value,
	    isValue: isValue
	  }
	}
	
	
	/* an opt is what's specified by the user in opts hash */
	var Opt = function(opt) {
	  var strings = (opt.string || "").split(","),
	      abbr, full, metavar;
	  for (var i = 0; i < strings.length; i++) {
	    var string = strings[i].trim(),
	        matches;
	    if (matches = string.match(/^\-([^-])(?:\s+(.*))?$/)) {
	      abbr = matches[1];
	      metavar = matches[2];
	    }
	    else if (matches = string.match(/^\-\-(.+?)(?:[=\s]+(.+))?$/)) {
	      full = matches[1];
	      metavar = metavar || matches[2];
	    }
	  }
	
	  matches = matches || [];
	  var abbr = opt.abbr || abbr,   // e.g. v from -v
	      full = opt.full || full, // e.g. verbose from --verbose
	      metavar = opt.metavar || metavar;  // e.g. PATH from '--config=PATH'
	
	  var string;
	  if (opt.string) {
	    string = opt.string;
	  }
	  else if (opt.position === undefined) {
	    string = "";
	    if (abbr) {
	      string += "-" + abbr;
	      if (metavar)
	        string += " " + metavar
	      string += ", ";
	    }
	    string += "--" + (full || opt.name);
	    if (metavar) {
	      string += " " + metavar;
	    }
	  }
	
	  opt = _(opt).extend({
	    name: opt.name || full || abbr,
	    string: string,
	    abbr: abbr,
	    full: full,
	    metavar: metavar,
	    matches: function(arg) {
	      return opt.full == arg || opt.abbr == arg || opt.position == arg
	        || opt.name == arg || (opt.list && arg >= opt.position);
	    }
	  });
	  return opt;
	}
	
	
	var createParser = function() {
	  return new ArgParser();
	}
	
	var nomnom = createParser();
	
	for (var i in nomnom) {
	  if (typeof nomnom[i] == "function") {
	     createParser[i] = _(nomnom[i]).bind(nomnom);
	  }
	}
	
	module.exports = createParser;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.6.0
	//     http://underscorejs.org
	//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.
	
	(function() {
	
	  // Baseline setup
	  // --------------
	
	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;
	
	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;
	
	  // Establish the object that gets returned to break out of a loop iteration.
	  var breaker = {};
	
	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
	
	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    concat           = ArrayProto.concat,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;
	
	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeForEach      = ArrayProto.forEach,
	    nativeMap          = ArrayProto.map,
	    nativeReduce       = ArrayProto.reduce,
	    nativeReduceRight  = ArrayProto.reduceRight,
	    nativeFilter       = ArrayProto.filter,
	    nativeEvery        = ArrayProto.every,
	    nativeSome         = ArrayProto.some,
	    nativeIndexOf      = ArrayProto.indexOf,
	    nativeLastIndexOf  = ArrayProto.lastIndexOf,
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind;
	
	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };
	
	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object via a string identifier,
	  // for Closure Compiler "advanced" mode.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }
	
	  // Current version.
	  _.VERSION = '1.6.0';
	
	  // Collection Functions
	  // --------------------
	
	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles objects with the built-in `forEach`, arrays, and raw objects.
	  // Delegates to **ECMAScript 5**'s native `forEach` if available.
	  var each = _.each = _.forEach = function(obj, iterator, context) {
	    if (obj == null) return obj;
	    if (nativeForEach && obj.forEach === nativeForEach) {
	      obj.forEach(iterator, context);
	    } else if (obj.length === +obj.length) {
	      for (var i = 0, length = obj.length; i < length; i++) {
	        if (iterator.call(context, obj[i], i, obj) === breaker) return;
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (var i = 0, length = keys.length; i < length; i++) {
	        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
	      }
	    }
	    return obj;
	  };
	
	  // Return the results of applying the iterator to each element.
	  // Delegates to **ECMAScript 5**'s native `map` if available.
	  _.map = _.collect = function(obj, iterator, context) {
	    var results = [];
	    if (obj == null) return results;
	    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
	    each(obj, function(value, index, list) {
	      results.push(iterator.call(context, value, index, list));
	    });
	    return results;
	  };
	
	  var reduceError = 'Reduce of empty array with no initial value';
	
	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
	  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
	    var initial = arguments.length > 2;
	    if (obj == null) obj = [];
	    if (nativeReduce && obj.reduce === nativeReduce) {
	      if (context) iterator = _.bind(iterator, context);
	      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
	    }
	    each(obj, function(value, index, list) {
	      if (!initial) {
	        memo = value;
	        initial = true;
	      } else {
	        memo = iterator.call(context, memo, value, index, list);
	      }
	    });
	    if (!initial) throw new TypeError(reduceError);
	    return memo;
	  };
	
	  // The right-associative version of reduce, also known as `foldr`.
	  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
	  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
	    var initial = arguments.length > 2;
	    if (obj == null) obj = [];
	    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
	      if (context) iterator = _.bind(iterator, context);
	      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
	    }
	    var length = obj.length;
	    if (length !== +length) {
	      var keys = _.keys(obj);
	      length = keys.length;
	    }
	    each(obj, function(value, index, list) {
	      index = keys ? keys[--length] : --length;
	      if (!initial) {
	        memo = obj[index];
	        initial = true;
	      } else {
	        memo = iterator.call(context, memo, obj[index], index, list);
	      }
	    });
	    if (!initial) throw new TypeError(reduceError);
	    return memo;
	  };
	
	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var result;
	    any(obj, function(value, index, list) {
	      if (predicate.call(context, value, index, list)) {
	        result = value;
	        return true;
	      }
	    });
	    return result;
	  };
	
	  // Return all the elements that pass a truth test.
	  // Delegates to **ECMAScript 5**'s native `filter` if available.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    if (obj == null) return results;
	    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
	    each(obj, function(value, index, list) {
	      if (predicate.call(context, value, index, list)) results.push(value);
	    });
	    return results;
	  };
	
	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, function(value, index, list) {
	      return !predicate.call(context, value, index, list);
	    }, context);
	  };
	
	  // Determine whether all of the elements match a truth test.
	  // Delegates to **ECMAScript 5**'s native `every` if available.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate || (predicate = _.identity);
	    var result = true;
	    if (obj == null) return result;
	    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
	    each(obj, function(value, index, list) {
	      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
	    });
	    return !!result;
	  };
	
	  // Determine if at least one element in the object matches a truth test.
	  // Delegates to **ECMAScript 5**'s native `some` if available.
	  // Aliased as `any`.
	  var any = _.some = _.any = function(obj, predicate, context) {
	    predicate || (predicate = _.identity);
	    var result = false;
	    if (obj == null) return result;
	    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
	    each(obj, function(value, index, list) {
	      if (result || (result = predicate.call(context, value, index, list))) return breaker;
	    });
	    return !!result;
	  };
	
	  // Determine if the array or object contains a given value (using `===`).
	  // Aliased as `include`.
	  _.contains = _.include = function(obj, target) {
	    if (obj == null) return false;
	    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
	    return any(obj, function(value) {
	      return value === target;
	    });
	  };
	
	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      return (isFunc ? method : value[method]).apply(value, args);
	    });
	  };
	
	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };
	
	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matches(attrs));
	  };
	
	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matches(attrs));
	  };
	
	  // Return the maximum element or (element-based computation).
	  // Can't optimize arrays of integers longer than 65,535 elements.
	  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
	  _.max = function(obj, iterator, context) {
	    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
	      return Math.max.apply(Math, obj);
	    }
	    var result = -Infinity, lastComputed = -Infinity;
	    each(obj, function(value, index, list) {
	      var computed = iterator ? iterator.call(context, value, index, list) : value;
	      if (computed > lastComputed) {
	        result = value;
	        lastComputed = computed;
	      }
	    });
	    return result;
	  };
	
	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iterator, context) {
	    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
	      return Math.min.apply(Math, obj);
	    }
	    var result = Infinity, lastComputed = Infinity;
	    each(obj, function(value, index, list) {
	      var computed = iterator ? iterator.call(context, value, index, list) : value;
	      if (computed < lastComputed) {
	        result = value;
	        lastComputed = computed;
	      }
	    });
	    return result;
	  };
	
	  // Shuffle an array, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var rand;
	    var index = 0;
	    var shuffled = [];
	    each(obj, function(value) {
	      rand = _.random(index++);
	      shuffled[index - 1] = shuffled[rand];
	      shuffled[rand] = value;
	    });
	    return shuffled;
	  };
	
	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (obj.length !== +obj.length) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };
	
	  // An internal function to generate lookup iterators.
	  var lookupIterator = function(value) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return value;
	    return _.property(value);
	  };
	
	  // Sort the object's values by a criterion produced by an iterator.
	  _.sortBy = function(obj, iterator, context) {
	    iterator = lookupIterator(iterator);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iterator.call(context, value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };
	
	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iterator, context) {
	      var result = {};
	      iterator = lookupIterator(iterator);
	      each(obj, function(value, index) {
	        var key = iterator.call(context, value, index, obj);
	        behavior(result, key, value);
	      });
	      return result;
	    };
	  };
	
	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, key, value) {
	    _.has(result, key) ? result[key].push(value) : result[key] = [value];
	  });
	
	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, key, value) {
	    result[key] = value;
	  });
	
	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, key) {
	    _.has(result, key) ? result[key]++ : result[key] = 1;
	  });
	
	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iterator, context) {
	    iterator = lookupIterator(iterator);
	    var value = iterator.call(context, obj);
	    var low = 0, high = array.length;
	    while (low < high) {
	      var mid = (low + high) >>> 1;
	      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
	    }
	    return low;
	  };
	
	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (obj.length === +obj.length) return _.map(obj, _.identity);
	    return _.values(obj);
	  };
	
	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
	  };
	
	  // Array Functions
	  // ---------------
	
	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if ((n == null) || guard) return array[0];
	    if (n < 0) return [];
	    return slice.call(array, 0, n);
	  };
	
	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N. The **guard** check allows it to work with
	  // `_.map`.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
	  };
	
	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array. The **guard** check allows it to work with `_.map`.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if ((n == null) || guard) return array[array.length - 1];
	    return slice.call(array, Math.max(array.length - n, 0));
	  };
	
	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array. The **guard**
	  // check allows it to work with `_.map`.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, (n == null) || guard ? 1 : n);
	  };
	
	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };
	
	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, output) {
	    if (shallow && _.every(input, _.isArray)) {
	      return concat.apply(output, input);
	    }
	    each(input, function(value) {
	      if (_.isArray(value) || _.isArguments(value)) {
	        shallow ? push.apply(output, value) : flatten(value, shallow, output);
	      } else {
	        output.push(value);
	      }
	    });
	    return output;
	  };
	
	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, []);
	  };
	
	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };
	
	  // Split an array into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(array, predicate) {
	    var pass = [], fail = [];
	    each(array, function(elem) {
	      (predicate(elem) ? pass : fail).push(elem);
	    });
	    return [pass, fail];
	  };
	
	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iterator, context) {
	    if (_.isFunction(isSorted)) {
	      context = iterator;
	      iterator = isSorted;
	      isSorted = false;
	    }
	    var initial = iterator ? _.map(array, iterator, context) : array;
	    var results = [];
	    var seen = [];
	    each(initial, function(value, index) {
	      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
	        seen.push(value);
	        results.push(array[index]);
	      }
	    });
	    return results;
	  };
	
	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(_.flatten(arguments, true));
	  };
	
	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var rest = slice.call(arguments, 1);
	    return _.filter(_.uniq(array), function(item) {
	      return _.every(rest, function(other) {
	        return _.contains(other, item);
	      });
	    });
	  };
	
	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
	    return _.filter(array, function(value){ return !_.contains(rest, value); });
	  };
	
	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    var length = _.max(_.pluck(arguments, 'length').concat(0));
	    var results = new Array(length);
	    for (var i = 0; i < length; i++) {
	      results[i] = _.pluck(arguments, '' + i);
	    }
	    return results;
	  };
	
	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    if (list == null) return {};
	    var result = {};
	    for (var i = 0, length = list.length; i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };
	
	  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
	  // we need this function. Return the position of the first occurrence of an
	  // item in an array, or -1 if the item is not included in the array.
	  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = function(array, item, isSorted) {
	    if (array == null) return -1;
	    var i = 0, length = array.length;
	    if (isSorted) {
	      if (typeof isSorted == 'number') {
	        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
	      } else {
	        i = _.sortedIndex(array, item);
	        return array[i] === item ? i : -1;
	      }
	    }
	    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
	    for (; i < length; i++) if (array[i] === item) return i;
	    return -1;
	  };
	
	  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
	  _.lastIndexOf = function(array, item, from) {
	    if (array == null) return -1;
	    var hasIndex = from != null;
	    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
	      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
	    }
	    var i = (hasIndex ? from : array.length);
	    while (i--) if (array[i] === item) return i;
	    return -1;
	  };
	
	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (arguments.length <= 1) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = arguments[2] || 1;
	
	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var idx = 0;
	    var range = new Array(length);
	
	    while(idx < length) {
	      range[idx++] = start;
	      start += step;
	    }
	
	    return range;
	  };
	
	  // Function (ahem) Functions
	  // ------------------
	
	  // Reusable constructor function for prototype setting.
	  var ctor = function(){};
	
	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    var args, bound;
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError;
	    args = slice.call(arguments, 2);
	    return bound = function() {
	      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
	      ctor.prototype = func.prototype;
	      var self = new ctor;
	      ctor.prototype = null;
	      var result = func.apply(self, args.concat(slice.call(arguments)));
	      if (Object(result) === result) return result;
	      return self;
	    };
	  };
	
	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    return function() {
	      var position = 0;
	      var args = boundArgs.slice();
	      for (var i = 0, length = args.length; i < length; i++) {
	        if (args[i] === _) args[i] = arguments[position++];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return func.apply(this, args);
	    };
	  };
	
	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var funcs = slice.call(arguments, 1);
	    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
	    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
	    return obj;
	  };
	
	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memo = {};
	    hasher || (hasher = _.identity);
	    return function() {
	      var key = hasher.apply(this, arguments);
	      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
	    };
	  };
	
	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){ return func.apply(null, args); }, wait);
	  };
	
	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = function(func) {
	    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
	  };
	
	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    options || (options = {});
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0) {
	        clearTimeout(timeout);
	        timeout = null;
	        previous = now;
	        result = func.apply(context, args);
	        context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };
	
	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;
	
	    var later = function() {
	      var last = _.now() - timestamp;
	      if (last < wait) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          context = args = null;
	        }
	      }
	    };
	
	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) {
	        timeout = setTimeout(later, wait);
	      }
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }
	
	      return result;
	    };
	  };
	
	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = function(func) {
	    var ran = false, memo;
	    return function() {
	      if (ran) return memo;
	      ran = true;
	      memo = func.apply(this, arguments);
	      func = null;
	      return memo;
	    };
	  };
	
	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };
	
	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var funcs = arguments;
	    return function() {
	      var args = arguments;
	      for (var i = funcs.length - 1; i >= 0; i--) {
	        args = [funcs[i].apply(this, args)];
	      }
	      return args[0];
	    };
	  };
	
	  // Returns a function that will only be executed after being called N times.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };
	
	  // Object Functions
	  // ----------------
	
	  // Retrieve the names of an object's properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    return keys;
	  };
	
	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = new Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };
	
	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = new Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };
	
	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };
	
	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };
	
	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = function(obj) {
	    each(slice.call(arguments, 1), function(source) {
	      if (source) {
	        for (var prop in source) {
	          obj[prop] = source[prop];
	        }
	      }
	    });
	    return obj;
	  };
	
	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(obj) {
	    var copy = {};
	    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
	    each(keys, function(key) {
	      if (key in obj) copy[key] = obj[key];
	    });
	    return copy;
	  };
	
	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj) {
	    var copy = {};
	    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
	    for (var key in obj) {
	      if (!_.contains(keys, key)) copy[key] = obj[key];
	    }
	    return copy;
	  };
	
	  // Fill in a given object with default properties.
	  _.defaults = function(obj) {
	    each(slice.call(arguments, 1), function(source) {
	      if (source) {
	        for (var prop in source) {
	          if (obj[prop] === void 0) obj[prop] = source[prop];
	        }
	      }
	    });
	    return obj;
	  };
	
	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };
	
	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };
	
	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a == 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className != toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, dates, and booleans are compared by value.
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return a == String(b);
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
	        // other numeric values.
	        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a == +b;
	      // RegExps are compared by their source patterns and flags.
	      case '[object RegExp]':
	        return a.source == b.source &&
	               a.global == b.global &&
	               a.multiline == b.multiline &&
	               a.ignoreCase == b.ignoreCase;
	    }
	    if (typeof a != 'object' || typeof b != 'object') return false;
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] == a) return bStack[length] == b;
	    }
	    // Objects with different constructors are not equivalent, but `Object`s
	    // from different frames are.
	    var aCtor = a.constructor, bCtor = b.constructor;
	    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
	                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
	                        && ('constructor' in a && 'constructor' in b)) {
	      return false;
	    }
	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);
	    var size = 0, result = true;
	    // Recursively compare objects and arrays.
	    if (className == '[object Array]') {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      size = a.length;
	      result = size == b.length;
	      if (result) {
	        // Deep compare the contents, ignoring non-numeric properties.
	        while (size--) {
	          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
	        }
	      }
	    } else {
	      // Deep compare objects.
	      for (var key in a) {
	        if (_.has(a, key)) {
	          // Count the expected number of properties.
	          size++;
	          // Deep compare each member.
	          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
	        }
	      }
	      // Ensure that both objects contain the same number of properties.
	      if (result) {
	        for (key in b) {
	          if (_.has(b, key) && !(size--)) break;
	        }
	        result = !size;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return result;
	  };
	
	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b, [], []);
	  };
	
	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
	    for (var key in obj) if (_.has(obj, key)) return false;
	    return true;
	  };
	
	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };
	
	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) == '[object Array]';
	  };
	
	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    return obj === Object(obj);
	  };
	
	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
	  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) == '[object ' + name + ']';
	    };
	  });
	
	  // Define a fallback version of the method in browsers (ahem, IE), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return !!(obj && _.has(obj, 'callee'));
	    };
	  }
	
	  // Optimize `isFunction` if appropriate.
	  if (true) {
	    _.isFunction = function(obj) {
	      return typeof obj === 'function';
	    };
	  }
	
	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };
	
	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj != +obj;
	  };
	
	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
	  };
	
	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };
	
	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };
	
	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return hasOwnProperty.call(obj, key);
	  };
	
	  // Utility Functions
	  // -----------------
	
	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };
	
	  // Keep the identity function around for default iterators.
	  _.identity = function(value) {
	    return value;
	  };
	
	  _.constant = function(value) {
	    return function () {
	      return value;
	    };
	  };
	
	  _.property = function(key) {
	    return function(obj) {
	      return obj[key];
	    };
	  };
	
	  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
	  _.matches = function(attrs) {
	    return function(obj) {
	      if (obj === attrs) return true; //avoid comparing an object to itself.
	      for (var key in attrs) {
	        if (attrs[key] !== obj[key])
	          return false;
	      }
	      return true;
	    }
	  };
	
	  // Run a function **n** times.
	  _.times = function(n, iterator, context) {
	    var accum = Array(Math.max(0, n));
	    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
	    return accum;
	  };
	
	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };
	
	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() { return new Date().getTime(); };
	
	  // List of HTML entities for escaping.
	  var entityMap = {
	    escape: {
	      '&': '&amp;',
	      '<': '&lt;',
	      '>': '&gt;',
	      '"': '&quot;',
	      "'": '&#x27;'
	    }
	  };
	  entityMap.unescape = _.invert(entityMap.escape);
	
	  // Regexes containing the keys and values listed immediately above.
	  var entityRegexes = {
	    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
	    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
	  };
	
	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  _.each(['escape', 'unescape'], function(method) {
	    _[method] = function(string) {
	      if (string == null) return '';
	      return ('' + string).replace(entityRegexes[method], function(match) {
	        return entityMap[method][match];
	      });
	    };
	  });
	
	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property) {
	    if (object == null) return void 0;
	    var value = object[property];
	    return _.isFunction(value) ? value.call(object) : value;
	  };
	
	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result.call(this, func.apply(_, args));
	      };
	    });
	  };
	
	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };
	
	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };
	
	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;
	
	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\t':     't',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };
	
	  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
	
	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  _.template = function(text, data, settings) {
	    var render;
	    settings = _.defaults({}, settings, _.templateSettings);
	
	    // Combine delimiters into one regular expression via alternation.
	    var matcher = new RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');
	
	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset)
	        .replace(escaper, function(match) { return '\\' + escapes[match]; });
	
	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      }
	      if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      }
	      if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }
	      index = offset + match.length;
	      return match;
	    });
	    source += "';\n";
	
	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
	
	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + "return __p;\n";
	
	    try {
	      render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }
	
	    if (data) return render(data, _);
	    var template = function(data) {
	      return render.call(this, data, _);
	    };
	
	    // Provide the compiled function source as a convenience for precompilation.
	    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
	
	    return template;
	  };
	
	  // Add a "chain" function, which will delegate to the wrapper.
	  _.chain = function(obj) {
	    return _(obj).chain();
	  };
	
	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.
	
	  // Helper function to continue chaining intermediate results.
	  var result = function(obj) {
	    return this._chain ? _(obj).chain() : obj;
	  };
	
	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);
	
	  // Add all mutator Array functions to the wrapper.
	  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
	      return result.call(this, obj);
	    };
	  });
	
	  // Add all accessor Array functions to the wrapper.
	  each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result.call(this, method.apply(this._wrapped, arguments));
	    };
	  });
	
	  _.extend(_.prototype, {
	
	    // Start chaining a wrapped Underscore object.
	    chain: function() {
	      this._chain = true;
	      return this;
	    },
	
	    // Extracts the result from a wrapped and chained object.
	    value: function() {
	      return this._wrapped;
	    }
	
	  });
	
	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}).call(this);


/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = require("chalk");

/***/ }
/******/ ]);
//# sourceMappingURL=main.js.map
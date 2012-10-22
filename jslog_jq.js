/** @license
jslog  - v1.0 - 2/Feb/2012
Copyright (C) 2012 by Abhishek Dev
MIT License @ http://bit.ly/abhishekdevMIT-License
*/

/*!
jslog  - v1.0 - 2/Feb/2012
Copyright (C) 2012 by Abhishek Dev
MIT License @ http://bit.ly/abhishekdevMIT-License
*/

/**
* @fileoverview jslog is a logging utility for JavaScript. It is built using the jQuery library and hence depends on its inclusion
* @author      Abhishek Dev
* @date        2012-Feb-02
* @description
  <em>
  --credits     Extended, but re-written, from scratch from the original jslog by Andre Lewis, andre@earthcode.com
  --version     1.0
  </em>
* @requires    jQuery 1.4.2+
*/

var jslog = function($){

    /**
	* @class
	* @constructor
	* @param {string=} level The log can be initialized with a optional specific label.
	* @param {Object=} options The log can be initialized with a optional configuration object, else the default will be used.
	*/
    var JSLOG = function (level,options){

        var opt = $.extend(JSLOG.defaults,options);

        (function (self){
            self.counter = 0;
            self.config = opt;
        })(this);


        (function _init(self){
            self.setLogLevel(self.getOfflineState('_log_level') || level);
            self.ui = new JSLOG.UI(self);
        })(this);

    };

    JSLOG.defaults = {
        name : "JSLOG",
        persistState : true,
        normalizeDomain : true,
        onLog: null,
        noCSSFile: false,
        isFormattedLogText: true,
        pipeConsole: true
    };

    /**
     * @enum
     */
    JSLOG.levels = {
        "NONE": -1,
        "ERROR": 1,
        "WARN": 2,
        "INFO": 3,
        "DEBUG": 4
    };

    /**
     * @param {string} level Any level name in the enumerator {@link JSLOG.levels}
     */
    JSLOG.prototype.setLogLevel = function(level){
        level = ""+level.toUpperCase();

        if(JSLOG.levels[level]){
            this.level = level;
            this.setOfflineState('_log_level', level);
        }else{
            alert("JSLOG set with invalid level: "+ level + ", setting level to NONE");
        }
    };

    /**
     * @function
     * @returns {string}
     */
    JSLOG.prototype.getLogLevel = function(){
        return this.level;
    };

    /**
     * @function
     * @returns boolean
     */
    JSLOG.prototype.isDebugEnabled = function(){
        return JSLOG.levels[this.getLogLevel()] >= JSLOG.levels.DEBUG;
    };

    /**
     * @function
     * @returns boolean
     */
    JSLOG.prototype.isInfoEnabled = function(){
        return JSLOG.levels[this.getLogLevel()] >= JSLOG.levels.INFO;
    };

    /**
     * @function
     * @returns boolean
     */
    JSLOG.prototype.isWarnEnabled = function(){
        return JSLOG.levels[this.getLogLevel()] >= JSLOG.levels.WARN;
    };

    /**
     * @function
     * @param {string} msgLevel The log level indicator
     * @param {string} msg The log message
     * @param {string=} tag Log message Tag (unimplemented)
     */
    JSLOG.prototype.log = function(msgLevel, msg, tag){
        var self = this,
        logLevelVal = JSLOG.levels[self.level] || -1,
        msgLevelVal;

        msgLevel = msgLevel.toUpperCase();
        msgLevelVal = (JSLOG.levels[msgLevel] || 0); // Coerce Invalid msglevel to DEBUG type

        if(msgLevelVal === 0){
            msgLevel = "DEBUG";
            msgLevelVal = JSLOG.levels.DEBUG;
        }

        if(logLevelVal >=  msgLevelVal){
            ++self.counter;
            self.config.pipeConsole && JSLOG.util.toConsole && JSLOG.util.toConsole(msgLevel, msg);
            self.ui.addLog(self, msgLevel, msg);
            if(self.config.onLog){
                self.config.onLog.call(self, msgLevel, msg);
            }
        }
    };

    /**
     * @function
     * @param {string} msg The log message
     * @param {string=} tag Log message Tag (unimplemented)
     */
    JSLOG.prototype.debug = function(msg, tag){
        this.log('DEBUG',msg, tag);
    };

    /**
     * @function
     * @param {string} msg The log message
     * @param {string=} tag Log message Tag (unimplemented)
     */
    JSLOG.prototype.info = function(msg, tag){
        this.log('INFO',msg, tag);
    };

    /**
     * @function
     * @param {string} msg The log message
     * @param {string=} tag Log message Tag (unimplemented)
     */
    JSLOG.prototype.warn = function(msg, tag){
        this.log('WARN',msg, tag);
    };

    /**
     * @function
     * @param {string} msg The log message
     * @param {Error} err The log message
     * @param {string=} tag Log message Tag (unimplemented)
     */
    JSLOG.prototype.error = function(msg, err, tag){
        this.log('ERROR',msg + JSLOG.util.getErrorDetails(err), tag);
    };

    /** Clears the log stack and the UI
     * @function
     */
    JSLOG.prototype.clearLog = function(){
        this.counter = 0;
        this.ui.clearLog();
    };

    // This is a Windows OS only feature
    if(window.clipboardData){
        JSLOG.prototype.toClipboard = function(){
            var code = this.toString();

            window.clipboardData.setData('text', code);
            alert("Logs copied to clipboard");
        };
    }

    JSLOG.prototype.exportView = function(){
        var jslogwindow = window.open('', 'jsLogger', 'width=750, height=400, location=0, resizable=1, menubar=1, scrollbars=1'),
        logText;

        if(jslogwindow){
            logText = this.toString();
            jslogwindow.document.write('<pre>'+logText+'</pre>');
            jslogwindow.focus();
        }
    };

    JSLOG.prototype.setOfflineState = function (key, value){
        return this.config.persistState ? JSLOG.util.setOfflineState(this.config.name+key,value) : null;
    };

    JSLOG.prototype.getOfflineState = function (key){
        return this.config.persistState ? JSLOG.util.getOfflineState(this.config.name+key) : null;
    };

    JSLOG.prototype.toString = function (){
        return this.ui.$log.text();
    };

    JSLOG.prototype.toArray = function (order){
        var logString = this.toString(),
        logArray = logString.split("\r\n");

        logArray.pop(); // last entry is an empty string

        if(order === -1){
            logArray = logArray.reverse();
        }

        return logArray;
    };

    JSLOG.util = {

        setOfflineState : (function (){

            var _setLocalStore = function _setLocalStore(key, value){
                localStorage.removeItem(key);
                localStorage[key] = value;
                return true;
            },
            _setCookie = function _setCookie(key, value) {
                var cookietext = key + "=" + escape(value);

                if(window.location.protocol.toUpperCase()=="HTTPS:"){
                    cookietext = cookietext + "; secure";
                }

                document.cookie = cookietext;

                return null;
            };

            return window.localStorage ? _setLocalStore : _setCookie;
        })(),

        getOfflineState : (function () {

            var _getLocalStore = function _getLocalStore(key){
                return localStorage[key];
            },
            _getCookie = function _getCookie(key){
                var search = key + "=",
                CookieString = document.cookie,
                result = null,
                offset, end;

                if (CookieString.length > 0) {
                    offset = CookieString.indexOf(search);
                    if (offset != -1) {
                        offset += search.length;
                        end = CookieString.indexOf(";", offset);
                        if (end == -1){
                            end = CookieString.length;
                        }
                        result = unescape(CookieString.substring(offset, end));
                    }
                }

                return result;
            };

            return window.localStorage ? _getLocalStore : _getCookie;
        })(),

        getFormattedTime : function () {
            var now = new Date(),
            hours = now.getHours(),
            minutes = now.getMinutes(),
            seconds = now.getSeconds(),
            milliSecs = now.getMilliseconds(),
            timeValue = "" + hours;

            timeValue += ((minutes < 10) ? ":0" : ":") + minutes;
            timeValue += ((seconds < 10) ? ":0" : ":") + seconds;
            timeValue += ((milliSecs < 10) ? ",0" : ",") + milliSecs;

            return timeValue;
        },

        getErrorDetails :
        /**
		 * @param {Error} err JS error Object type
		 */
        function (err) {
            var details = "";

            if(err != null && err != "") {
                details = "\n -- Error Info --"  ;
                details += "\n name: " + err.name  ;
                details += "\n number: " + err.number;
                details += "\n message: " + err.message;
                details += "\n description: " + err.description;
            }

            return details;
        },

        toConsole : function(){
            function jslog_toConsole(msgLevel, msg){
                var msgLevelName = msgLevel.toLowerCase(),
                jsConsole = console[msgLevelName];

                if(typeof jsConsole == "function"){
                    jsConsole.call(console,msg);
                }else{
                    console.log(msg);
                }
            }

            return window.console ? jslog_toConsole : null;
        }()
    };


    /**
	 * @class
	 * @constructor
	 */
    JSLOG.UI = function(jslogObject ){
        (function _init(self){

            jslogObject.config.noCSSFile && $("#jslog_style").length && $('<style id="jslog_style">'+
                '.jslog{font-family:Tahoma,Helvetica,Arial;color:#002b36;font-size:9px;line-height:normal;letter-spacing:normal;position:fixed;_position:absolute;z-index:10000;top:20px;left:2px}.jslog select,.jslog input{font:99% Tahoma,Helvetica,Arial}.jslog .dontDisplay{display:none}.jslog .counter{cursor:pointer;position:absolute;background-color:#fdf6e3;border:1px solid #b58900;padding:2px;user-select:none;box-shadow:0 0 3px #aaa}.jslog .content{text-align:left;border:1px solid #b58900;width:400px;position:absolute;top:20px;left:0;background-color:white;box-shadow:0 0 3px #aaa}.jslog .header{padding:2px;border-bottom:1px solid #eee8d5;background-color:#fdf6e3;box-shadow:0 1px 2px #eee8d5;position:relative}.jslog .header label{color:#586e75;padding-right:3px;border-right:1px solid #bbb}.jslog .header input{cursor:pointer;color:#002b36;margin:0 1px}.jslog .header .clear{color:#268bd2;margin-left:3px}.jslog .header .close{color:#dc322f;font:monospace;cursor:pointer;display:block;height:16px;line-height:16px;overflow:hidden;position:absolute;right:1px;text-align:center;top:1px;vertical-align:middle;width:16px}.jslog .log{height:240px;overflow:auto;font-family:Consolas,"Andale Mono WT","Andale Mono","Lucida Console","Lucida Sans Typewriter","DejaVu Sans Mono","Bitstream Vera Sans Mono","Liberation Mono","Nimbus Mono L",Monaco,"Courier New",Courier,monospace;font-size:11px;margin:0;padding:0;list-style:none inside}.jslog .log li{word-wrap:break-word;border-bottom:1px solid #ccc}.jslog .log li.odd{background-color:#fff}.jslog .log li.even{background-color:#f6f6f6}.jslog .log li ins{padding:0 3px;float:left;font-weight:bold;text-decoration:none}.jslog .log li ins .noTextFormat{width:40px}.jslog .log li pre{display:none}.jslog .log li em{font-style:normal;padding:0 5px 0 3px;color:#6c71c4}.jslog .log li .DEBUG{background-color:blue;color:white}.jslog .log li .INFO{background-color:#10ff10;color:#073642}.jslog .log li .WARN{background-color:yellow;color:#586e75}.jslog .log li .ERROR{background-color:#dc322f;color:white}.jslog .footer{display:none;padding-left:2px;border-top:1px solid black;background-color:#fdf6e3}'
                +'</style>').appendTo('head');

            self.name = jslogObject.config.name;
            self.persistState = jslogObject.config.persistState;
            self.build(jslogObject);

        })(this);
    };

    JSLOG.UI.prototype.build = function(jslogObject){
        var self = this,
        name = self.name,
        uiHTML = '<div id="'+name+'_container" class="jslog">'+
        '<div id="'+name+'_handle" class="counter" title="JavaScript Log Count : Double-Click to toggle details.">0</div>'+
        '<div id="'+name+'_body" class="content dontDisplay">'+
        '<div id="'+name+'_header" class="header">'+
        '<label id="'+name+'_LogLevel" >Log Level : ' +
        '<select id="'+name+'_selectLogLevel" class="levelList">'+
        '<option id="'+name+'_noneLevel" value="NONE" >None</option>'+
        '<option id="'+name+'_errorLevel" value="ERROR" >ERROR</option>'+
        '<option id="'+name+'_warnLevel" value="WARN" >WARN</option>'+
        '<option id="'+name+'_infoLevel" value="INFO" >INFO</option>'+
        '<option id="'+name+'_debugLevel" value="DEBUG" >DEBUG</option>'+
        '</select></label>'+
        '<input type="button" id="'+name+'_clear" class="clear" value="Clear"/>' +
        '<input type="button" id="'+name+'_viewPlain" class="export" value="Export"/>'+
        (jslogObject.toClipboard ? '<input type="button" id="'+name+'_copyToClipBoard" class="copyToClpBrd" value="Copy To Clipboard"/>': '') +
        '<span id="'+name+'_closeBtn" class="close" title="Close">X</span></div>'+
        '<ol id="'+name+'_logDisplay" class="log"></ol>'+
        '<div id="'+name+'_footer" class="footer"></div>'+
        '</div></div>',
        $uiHTML = $(uiHTML),
        isOpen = self.getOfflineState("_logui_visibility");

        //initialize private properties
        self.$me = $uiHTML;
        self.$counter = $uiHTML.children('.counter');
        self.$content = $uiHTML.children('.content');
        self.$log = self.$content.children('.log');


        self.$me
        .toggleClass("noTextFormat",!jslogObject.config.isFormattedLogText);
        self.$content
        .toggleClass("dontDisplay",isOpen == "false")
        .find(".levelList").val(jslogObject.level);

        if($.fn.draggable){
            self.$me.draggable({
                containment: 'document',
                handle: self.$counter
            })
            // The CSS Class computation for a Element in JS-DOM is not computed hence position:relative is set by jquery,
            // this needs to be unset
            // strangely it was working in Firefox 14, but this is needed for other browsers
            .css("position","");

        }

        self.$counter.bind("dblclick", function(e){
            self.toggle();
        });

        self.$content
        .delegate(".clear","click" ,function(e){
            jslogObject.clearLog();
        })
        .delegate(".levelList", "change",function(e){
            var selectList = this;
            jslogObject.setLogLevel(selectList.options[selectList.selectedIndex].value);
        })
        .delegate(".close","click" ,function(e){
            self.close();
        })
        .delegate(".export","click",function(e){
            jslogObject.exportView();
        })
        .delegate(".copyToClpBrd","click", function(e){
            jslogObject.toClipboard && jslogObject.toClipboard();
        });

        // Add UI on DOM ready
        $(function(){
            self.$me.prependTo('body');
        });
    };

    JSLOG.UI.prototype.destroy = function(){

    };

    JSLOG.UI.prototype.toggle = function(){
        var isClosed = this.$content.hasClass("dontDisplay");

        isClosed ? this.open() : this.close();
    };


    JSLOG.UI.prototype.open = function(){
        this.$content.removeClass("dontDisplay");
        this.setOfflineState("_logui_visibility",true);
    };

    JSLOG.UI.prototype.close = function(){
        this.$content.addClass("dontDisplay");
        this.setOfflineState("_logui_visibility",false);
    };

    JSLOG.UI.prototype.clearLog = function(){
        this.$counter.text(0);
        this.$log.empty();
    };


    JSLOG.UI.prototype.addLog = function(jslogObject, level, msg){
        var logtime = JSLOG.util.getFormattedTime(),
        logType = level,
        linefeed = "</div></li>", li, $logEntry;

        if(jslogObject.config.isFormattedLogText){
            logtime = logtime + (Array(13 + 1 - logtime.length).join('&nbsp;'));
            level =  level +(Array(6 + 1 - level.length).join('&nbsp;'));
            linefeed = '&#13;&#10;'+linefeed;
        }

        li = '<li><ins>'+ level + '</ins><em>'+logtime+'</em><span>'+msg+'</span><div style="clear: both;">'+linefeed;
        $logEntry = $(li);

        $logEntry.addClass( (jslogObject.counter%2 == 0 ? "odd" : "even") + " " + logType);

        this.$counter.text(jslogObject.counter);
        this.$log.prepend($logEntry);
    };

    JSLOG.UI.prototype.setOfflineState = function (key, value){
        return this.persistState ? JSLOG.util.setOfflineState(this.name+key,value) : null;
    };

    JSLOG.UI.prototype.getOfflineState = function (key){
        return this.persistState ? JSLOG.util.getOfflineState(this.name+key) : null;
    };

    // Instantiate the logger on the page only if the HTML tag has a data attribute data-jslog="true" OR
    // if a global variable named "javaScriptLoggerEnabled" is found with a true value.
    // This makes it fairly difficult for the end-user to trigger the logger at runtime without permission
    // and also enabled the log statements to stay in page as we use dummy empty functions when the JSLOG is disabled.
    return function _secureDuggerInstall(){
        var jslogPageFlag = $('html').data('jslog'),
        emptyFn = function(){},
        /**
         * @class
         * @constructor
         */
        DUMMY_JSLOG = emptyFn;

        DUMMY_JSLOG.prototype = {
            clearLog : emptyFn,
            debug : emptyFn,
            error : emptyFn,
            exportView : emptyFn,
            getLogLevel : emptyFn,
            getOfflineState : emptyFn,
            info : emptyFn,
            isDebugEnabled : emptyFn,
            isInfoEnabled : emptyFn,
            isWarnEnabled : emptyFn,
            log : emptyFn,
            setLogLevel : emptyFn,
            setOfflineState : emptyFn,
            toArray : emptyFn,
            toString : emptyFn,
            warn : emptyFn
        };

        return (jslogPageFlag === true) ? new JSLOG("DEBUG") : new DUMMY_JSLOG();
    }();

}(jQuery);

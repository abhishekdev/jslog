# jslog #

Version: v1.2, Last updated: 19/Mar/2013

jslog is a JavaScript Logging utility. The intension is provide an abstraction for the logging capabilities in the a source code.
It helps especially when the browsers console utility is not available (e.g. IE6/7) or when there is too many inline scripts getting executed to track in the browser.

## Documentation ##


## Examples ##

## Support and Testing ##

### Requirements / Dependencies ###
jQuery core 1.6.2+
jQuery UI Draggable Plugin 1.8 + (optional)
Tested with jQuery 1.9.1

### Browsers Tested ###
Opera 10+, Firefox 3+, IE 6+, Safari 5+, Chrome 6+

### Unit Tests ###

### Build ###
Put closure compiler.jar in the root folder of the project and run this command
java -jar compiler.jar --externs _externs.js --externs _jquery-extern.js --warning_level VERBOSE --js jslog_jq.js --js_output_file jslog_jq.min.js

## Release History ##

1.2 - (19/Mar/2013) Handling deprecations in jQuery 1.9, updating copyright year, and fixing a compiler warning
1.1 - (17/Nov/2012) Few encoding and IE fixes  for exporting and copy to clipboard
1.0 - (2/Feb/2012) Initial release  


## License ##
Copyright (c) 2013 Abhishek Dev
Licensed under the MIT license. http://bit.ly/abhishekdevMIT-License
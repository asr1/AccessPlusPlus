# AccessPlusPlus
<a href="https://chrome.google.com/webstore/detail/access%20%20/cdchknkpbdccmalfabhdjjkckajhbdif">AccessPlusPlus</a> is a Chrome extension to improve <a href="https://accessplus.iastate.edu/frontdoor/login.jsp">AccessPlus for Iowa State University</a>. It adds four features to AccessPlus:

* Meal counter on the dining page
* Links to <a href="http://www.ratemyprofessors.com/">Rate My Professor</a> reviews on schedule page
* Students can export their class schedule to .ics
* Current class schedule is visible on registration page

This project was started in <a href="http://hackisu.com/">HackISU</a> Spring 2015.

## How to Load

1. Clone this repository locally
2. Go to chrome://extensions in Chrome
3. Check "Developer mode" in the upper right corner
4. Click "Load unpacked extension..." and set the path to where you cloned the repository

The current released version is available <a href="https://chrome.google.com/webstore/detail/access%2B%2B/cdchknkpbdccmalfabhdjjkckajhbdif">here</a>.


## Changelog
**Version 1.2.2.0:**
* Classes no longer occur during finals' week.
* Schedule no longer fills with whitespace, rather remains neat and orderly.
* Classes no longer occur during Thanksgiving, Labor Day, Reverend Doctor Martin Luther King, Jr. Day, Memorial day, etc.
* Minor UI upgrades

**Version 1.2.1.2:**
* Removed unneeded references.

**Version 1.2.1.1:**
* Cleaned up comments.
* Removed unused functions.

**Version 1.2.1.0:**
* Decreased permissions needed.
* Moved dependencies out of class_sched_func.js.
* Consolidated jQuery references.
* Removed old files.
* Cleaned up heirarchy.


**Version 1.2.0.1:**
* Removed unnecessary dependencies, drastically shrinking the size of the extension.

**Version 1.2.0.0:**
* Cleaned up event creation. Now each class is one event. Before, each day of a class (M, W, F) would be created as a separate event. No more!
(I told you wasn't binary).

**Version 1.1.0.1:**
* Fixed a bug where arranged classes would erroneously appear on the calendar. 
(Also, the version numbers are not intended to be binary).

**Version 1.1.0.0:**
* Fixed a bug where some schedules had classes duplicated 114 times in their schedule, progressing over each week.
* Fixed a bug where if the first class on a schedule was only half a semester, any recitations would only appear for half a semester.

**Version 1.0.1.0**
* Added support for experimental classes.
* Changed name of Calendar from "[Object Object]" to "ISU Class Schedule".

**Version 1.0.0.1**
* Fixed initial release.

**Version 1.0**
* Initial release.

## Dependencies
This project uses a modified version of <a href="https://github.com/connorbode/ics.js">Connorbode's fork</a> of <a href="https://github.com/nwcell/ics.js/">ics.js</a>, which in turn uses <a href="https://github.com/eligrey/Blob.js">Blob.js.</a>

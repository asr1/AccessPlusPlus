# AccessPlusPlus
<a href="https://chrome.google.com/webstore/detail/access%20%20/cdchknkpbdccmalfabhdjjkckajhbdif">AccessPlusPlus</a> is a Chrome extension that improves <a href="https://accessplus.iastate.edu/frontdoor/login.jsp">AccessPlus for Iowa State University</a>. It adds four features to AccessPlus:

* Meal counter on the dining page
* Links to <a href="http://www.ratemyprofessors.com/">Rate My Professor</a> reviews on schedule page
* Students can export their class schedule to .ics
* Current class schedule is visible on registration page

This project was started in <a href="http://hackisu.com/">HackISU</a> Spring 2015. The current released version is available <a href="https://chrome.google.com/webstore/detail/access%2B%2B/cdchknkpbdccmalfabhdjjkckajhbdif">here</a>.

## How to Contribute

There are a couple ways to contribute to this project:

* Install it and use it. If you find bugs or have ideas for changes, add an issue on GitHub or email acsplusplus@gmail.com.
* Look at the current list of issues. Pick an issue, fork the repository, fix the issue, then make a pull request. 
* Fork the repository and improve the code in any way you think is appropriate. 

### How to Load (for Development)

1. Disable any official version you have installed
2. Clone this repository locally
3. Go to chrome://extensions in Chrome
4. Check "Developer mode" in the upper right corner
5. Click "Load unpacked extension..." and set the path to where you cloned the repository

## Dependencies
This project uses a modified version of <a href="https://github.com/connorbode/ics.js">Connorbode's fork</a> of <a href="https://github.com/nwcell/ics.js/">ics.js</a>, which in turn uses <a href="https://github.com/eligrey/Blob.js">Blob.js.</a> This has been included in the AccessPlusPlus repository already. 

## Changelog
**Version 1.3.1.0:**
*Fixed issue some users were having with Calendar parsing. Specifically, Access Plus was presenting certain Aerospace Engineering classes in an inconsistent way.

**Version 1.3.0.1:**
* Fix math issue in Meal Tracker.

**Version 1.3.0.0:**
* Add Calendar support for Physics 221 Lab meeting fortnightly.
* Fix math issue in Meal Tracker.

**Version 1.2.5.4:**
* Change total meals to remaining meals.
* Accidentally skipped 1.2.5.3, and cannot undo.

**Version 1.2.5.2:**
* Fix Spring Break logic.

**Version 1.2.5.1:**
* UI Improvements.
* Spring Break support.

**Version 1.2.5.0:**
* Fix the calendar Holiday issue. It was a bug in our ics.js fork, where they were adding minutes instead of seconds, giving a start time of 12:10:10 for afternoon classes, rather than 12:10:00. Holidays now work.
* UI Improvements.

**Version 1.2.4.1:**
* Minor fixes to calendar and meal tracker.

**Version 1.2.4.0:**
* Holidays now work in Google Calendar. Most programs ignore dates passed in with the exdate parameter. Google requires that they have the exact start time as the event. That is, there is no way to prevent any event from being created on a given day; only events that you know the start time of.

**Version 1.2.3.0:**
* Made file names consistent. 
* Fixed a parsing issue that affected a small number of users.
* Updated comments.

**Version 1.2.2.0:**
* Classes no longer occur during finals' week.
* Schedule no longer fills with whitespace, rather remains neat and orderly.
* Despite what the commit log may suggest, our fork of ics.js now supports EXDATE functionality.
* Classes no longer occur during Thanksgiving break, Labor Day, Reverend Doctor Martin Luther King, Jr. Day, Memorial Day, or Independence Day.
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

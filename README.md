# AccessPlusPlus
This project was started in <a href="http://hackisu.com/">HackISU</a> 2015. It adds four features to <a href="https://accessplus.iastate.edu/frontdoor/login.jsp">AccessPlus for Iowa State University</a>:

* Meal counter on the dining page
* Links to <a href="http://www.ratemyprofessors.com/">Rate My Professor</a> reviews on schedule page
* Schedule can be exported to .ics
* Existing schedule is displayed on registration page

The extension is available <a href="https://chrome.google.com/webstore/detail/access%2B%2B/cdchknkpbdccmalfabhdjjkckajhbdif">here</a>.

# Changelog:

**Version 1.2.0.1:**
* Removed unnecessary dependencies, drastically shrinking the size of the extension.

**Version 1.2.0.0:**
* Cleaned up event creation. Now each class is one event. Before, each day of a class (M, W, F) would be created as a separate event. No more!
(I told you wasn't binary.)

**Version 1.1.0.1:**
* Fixed a bug where arranged classes would appear on the calendar. 
(Also, the version numbers are not intended to be binary.)

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

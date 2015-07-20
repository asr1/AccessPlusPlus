//Hopefully you're ready for a completely "hacky" plugin - seriously don't judge ヽ（´ー｀）┌

//The main functionality of this part of the Access++ extension is to add the Rate My Professor functionality, but it will also get the needed information
//for the google calendar exportation, such as: class name, beginning and end date, dates, ect... The information will be saved in classInfo objects, which will
//be stored in an array. When a class contains multiple meeting times at different times, such as: Math M,W @ 10:00 and T,R @8:00; independed classInfo objects will 
//be created. ClassInfo1: name: Math, meetingDays: M, W; Meeting Times: 10:00 A, Meeting End Time: 11:00A, startendDate: : 01/15/2014-05/25/2014
//be created. ClassInfo2: name: Math, meetingDays: T, R; Meeting Times: 8:00 A, Meeting End Time: 9:00A, startendDate: : 01/15/2014-05/25/2014

var OVERRIDE_RULE = true;
var url =  window.location.href;  
var accessPlus = "https://accessplus.iastate.edu/servlet/adp.A_Plus"; //possible url for access plus after first access
var accessPlus1 = "https://accessplus.iastate.edu/servlet/adp.A_Plus?A_Plus_action=/R480/R480.jsp&SYSTEM=R480&SUBSYS=006&SYSCODE=CS&MenuOption=7"; //possible url for access plus 
var bootstrap =  ' <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>';

var img = document.createElement("img"); 
img.src = "http://i.imgur.com/dSvcdl.gif"; //I regret nothing

var clicked = false;

var element = $('#Grid').next(); //where we're going to append our RMP div to 
var Name; //keeps track of the name of the current prof being read
var idStart = 2; //2 should be a pretty good place to start searching
var tdId; //keeps track of the current tdId being read

var profs = []; //will store the prof's names here

 //Classes can have multiple meeting times at different places, if this happens then the 
								 //arrays containing the class information will have varying length. As such we should keep track 
								 //of the amount of times we get multiple consecutive meeting dates. When several meeting dates are found,
								 //we should duplicate the class name and start end date, allowing for the creation of a new Calendar object.
var lastClassName = "";
var lastStartEnd = "";
								 
//All of these arrays are temporary, they will be used to generate classInfo objects later on
var classNames = []; //will store all of the student's class' names
var meetingD = []; //will store all of the student's class' meeting days
var meetingsT = []; //will store all of the student's class' meeting times (start)
var meetingeT = []; //will store all of the student's class' meeting times (end)
var startEndDate = []; //will store all of the student's class' start/end dates
var locations = []; //will store the class' locations

var classInfoArr = []; //will store objects which contain (hopefully) all of the necessary information for google Calendar

//whether a calendar was created successfully or not
var convSuccess = false;

//This comment is mostly wrong.
//ClassInfo object, each object will contain all needed information for the calendar exportation
//nome - class name
//mDays - meeting days, all days of the week where the class meets
//mTimesS - meeting times (start)
//mTimesE - meeting times (end)
//loc - class location
//After each object is created, they will be saved in an array
//access their parameters by, for example calling, classInfo.nome to retrieve the name
function classInfo(nome, mDays, mTimesS, mTimesE, mDates, loc){
		this.nome = nome;
		this.mDays = mDays;
		this.mTimesS = mTimesS;
		this.mTimesE = mTimesE;
		this.mDates = mDates;
		this.loc = loc;
}

//AccessPlus is a website which was most definetly not created with plans for future development. 
//No. Whoever developed this ancient tome decided to write this masterpeace as if we were still stuck in the 80s, 
//where friggin ids were mythical beings who should never be disturbed for fear of divine retribution. 
//So how on earth are we supposed to find the ridiculous amount of data that we need in order to get this plugin to work??
//Well, after cussing at A++ with every insult known/unkown to men, and developing a dislike which burned like acidic poison 
//for this rare gem of a website, i decided to wholeheartedly embrace hacky code. 
//AKA: lets inject an id for each table and use them to search for the required info. IN YOUR FACE ACCESS PLUS
//-----------------------------------------------------------------------------

//Keeps track of the current row id
function tdID(){
	tdId = 'tr' + idStart;
	idStart++;
}

//Gives ids to every table data and table row that includes class information
function updateIDs() {
	$("#long").children().children().children().each(function (i) { // (╯°□°）╯︵ ┻━┻
		$(this).attr('id', 'tr' +i);
	});
	
	tdID();

	while ($('#' + tdId).length){
		$('#' + tdId).children().each(function (i) {
			$(this).attr('id', tdId + 'td' +i);
			checkName($(this).attr('id'));
			checkDates($(this).attr('id'));
			checkClassName($(this).attr('id'));
			checkMeetingDays($(this).attr('id'));
		});
		tdID();	
	} 
}

//----------------------------</idUpdate>----------------------------------------


//--------------------- Related to Rate my Prof ---------------------------------

//As the same teacher can be found multiple times, we have to make sure not to 
//repeat the name while linking to the teacher's RMP page
//@param - arr- given array with teacher names
function remRepeats(arr){ 
	var el;
	var result = [];
	
	$.each(arr, function(i, e) {
    if ($.inArray(e, result) == -1) result.push(e);
  });
  
	result.splice(1, 1);  //remove the weird empty element
  
  return result;
}

//Parses the given name to separate the first name from the last name
//includes a ',' to the last name 
//@param nome - teachers name
function parseName(nome){
	var splited = nome.split(',');
	splited[0] + ',';
	return splited;
}

//Checks whether the row associated with the given id includes a 'mailto:' string,
//if so we assume that the teacher's name will soon follow
//@param id - id of the given row
function checkName(id){
	var tr = '#' + id;
	
	if ($(tr).html().indexOf('mailto:') !== -1){
		var prof = $('#' + id).html().split('>');
		Name = prof[1].split('<');
		profs.push(Name[0]);
		//i++;
	}
}

//----------------------------- </Related to Rate my Prof>------------------------


//------------------------ Calendar ----------------------------------------------

//Checks to see whether the given row contains any "Days of the Week", such as M for Monday, T for Tuesday, ect...
function containsDW(id){
	var tr = '#' + id;
	if ($(tr).html().indexOf(";M ") !== -1  || $(tr).html().indexOf(";T ") !== -1 || $(tr).html().indexOf(";W ") !== -1 || $(tr).html().indexOf(";R ") !== -1 || $(tr).html().indexOf(";F ") !== -1 ||
	$(tr).html().indexOf(" M ") !== -1 || $(tr).html().indexOf(" T ") !== -1 || $(tr).html().indexOf(" W ") !== -1 || $(tr).html().indexOf(" R ") !== -1 || $(tr).html().indexOf(" F ") !== -1){
		return true;	
	}
}

//Will increment the given id by the given amount
function incrementID (id, n){
	var num = id.substr(id.length - 2); //limited to double digit numbers
	var sliced = id.slice(0, id.length - 1); 
	var ID = '#' + sliced;
	var intRegex = /^\d+$/;
	
	if (intRegex.test(num.charAt(0))){
		ID += (parseInt(num) + n).toString(); //both elements are numbers
	}
	else {
		ID += (parseInt(num.charAt(1)) + n).toString(); //only the last element is a number
	}
	
	return ID; 
}

//Will update the meeting times arrays
//This function has to be called in the 'main' method since not all table ids have been 
//fully created by the time checkDates is called -> startTime and endTime have a higher id number than the one 
//associated with class dates
//start - array containing all start time table ids
//end - array containing all end time table ids
function getStartEndTime(start, end){
	var startTime = "";
	var endTime = "";
	
	if (start.length != end.length) return null;
	
	for (i = 0; i < start.length; i++){ //start and end have to have the same length
		startTime = $(start[i]).html();
		endTime = $(end[i]).html();
		meetingsT[i] = startTime;
		meetingeT[i] = endTime;
	}
}

//Will update the locations array
//This function has to be called in the 'main' method since not all table ids have been 
//fully created by the time checkDates is called -> startTime and endTime have a higher id number than the one 
//associated with class dates
//loc - array containing all of the location ids
function getLocations(loc){
	var place = "";
	
	for (i = 0; i < loc.length; i++){
		place = $(loc[i]).html();
		locations[i] = place;	
	}
}

//Will update the meeting dates array
//This function has to be called in the 'main' method since not all table ids have been 
//fully created by the time checkMeetingDates is called -> meetingDate has a higher id number than the one 
//associated with class dates
//dates - array containing all meeting dates table ids
function getMeetingDates(dates){
	var meetingDate = "";
	
	for (i = 0; i < dates.length; i++){
		meetingDate = $(dates[i]).html();
		if (typeof(meetingDate) != "undefined"){
				startEndDate[i] = meetingDate;
				lastStartEnd = meetingDate;
		}

	}
}

//Checks whether the row associated with the given id has any association with the class dates, 
//if so, it'll save the class days and its start/end time
//@param id - id of the given row
function checkDates(id){
	var tr = '#' + id;
	if ($(tr).html().indexOf('&nbsp;') != -1 && containsDW(id) || $(tr).html().indexOf('ARR.') != -1){
		var date = $(tr).html().split(';');	
			
		meetingD.push(date[3]);
		if(classNames[meetingD.length - 1] == null) classNames.push(lastClassName);
		if(startEndDate[meetingD.length - 1] == null) startEndDate.push(lastStartEnd);
		var startTime = incrementID(id, 1);
		var endTime = incrementID(id, 2);
		meetingsT.push(startTime);
		meetingeT.push(endTime);
		var location = incrementID(id, 3);
		locations.push(location);
	}
}

//Checks whether the row associated with the given id has contains the class' name,
//if so, it'll save the class name
//@param id - id of the given row
function checkClassName(id){
	var tr = '#' + id;
	if($(tr).html().indexOf('<!-- %=') != -1){
		var names = $(tr).html().split('nd()">');
        if (names[1] == undefined){ //friggin experimental classes
            names = $(tr).html().split('/exp/">');
        }
		var Names = names[1].split('</a>'); //names[1] contains the class name, but it also includes a ton of stuff after it that we do not care about
		classNames.push(Names[0]);
		lastClassName = Names[0];
	}
}

//Checks whether the row associated with the given id contains the class' meeting dates,
//if so, it'll save the class name
//@param id - id of the given row
function checkMeetingDays(id){
	var tr = '#' + id;
	
	if ($(tr).html().indexOf('Meeting Dates:') != -1){
		var meetId = incrementID(id, 1); //the meeting days are in the following table
		startEndDate.push(meetId);
	}
}

//Returns an array of classInfo objects 
//Also deals with retrieving the class meeting times
//arrCN - an array containing the class names
//arrMD - an array containing meeting days
//arrMTS - an array containing meeting times (start)
//arrMTE - an array containing meeting times (end)
//arrST - an array containing the class' start date
//arrFT - an array containing the class' end date 
function createClassInfo(arrCN, arrMD, arrMTS, arrMTE, arrDates, arrLoc){
	var obj;

	for (i = 0; i < arrCN.length; i++){
		obj = new classInfo(arrCN[i], arrMD[i], arrMTS[i], arrMTE[i], arrDates[i], arrLoc[i]);	
		if(arrMD[i].indexOf('ARR.') != -1 )
		{
			continue;
		}
		classInfoArr.push(obj);
	}		
		
}

function checkValues (arr, isClassInfo){ //just for testing purposes
	if (isClassInfo){
		for (i = 0; i < arr.length; i++){
			alert(arr[i].nome);	
			alert(arr[i].mDays);
			alert(arr[i].mTimesS);
			alert(arr[i].mTimesE);
			alert(arr[i].mDates);
			alert(arr[i].loc);
		}
	}
	else{
		for (i = 0; i < arr.length; i++){
			alert(arr[i]);	
		}
	}

}

//meetingDate object, will contain the different parts of the meeting date string, such as month, date year
//month - given month, has to be reduced by 1
//day - given day
//year - given year
function meetingDateObj(month, day, year){
		this.month = month;
		this.day = day;
		this.year = year;
}

//decrements the string month by one and updates the year to be in the 21st century
function updMonthYr(obj, month, year){
	var m = parseInt(month);
	var mnt;
	m--;//Necessary to convert from 1-indexed to 0-indexed.
	if (m <= 10) mnt = "0";
	else mnt = "";
	mnt += m.toString();
	
	var yr = "20";
	yr+=year;
	
	obj.month = mnt;
	obj.year = yr;
	
}

//Returns a meeting date string as a readable format for the Calendar
//As the months begin at index 0, the month part has to be reduced by 1 
//date - a meeting date string
function splitDates(date){
	var dates = date.split('-');
	var date1 = dates[0];
	var date2 = dates[1];
	var obj;
	
	var parts1 = date1.split('/');
	var parts2 = date2.split('/');
	
	var objArr = [];
	
	obj = new meetingDateObj("", parts1[1], "");
	updMonthYr(obj, parts1[0], parts1[2]);
	objArr.push(obj);
	
	obj = new meetingDateObj("", parts2[1], "");
	updMonthYr(obj, parts2[0], parts2[2]);
	objArr.push(obj);
	
	return objArr;
}




//Dependencies. I'm so sorry for what I've done to what used to resemble organization in this place.
//ICS.JS
!function(a){"use strict";if(a.URL=a.URL||a.webkitURL,a.Blob&&a.URL)try{return void new Blob}catch(b){}var c=a.BlobBuilder||a.WebKitBlobBuilder||a.MozBlobBuilder||function(a){var b=function(a){return Object.prototype.toString.call(a).match(/^\[object\s(.*)\]$/)[1]},c=function(){this.data=[]},d=function(a,b,c){this.data=a,this.size=a.length,this.type=b,this.encoding=c},e=c.prototype,f=d.prototype,g=a.FileReaderSync,h=function(a){this.code=this[this.name=a]},i="NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR".split(" "),j=i.length,k=a.URL||a.webkitURL||a,l=k.createObjectURL,m=k.revokeObjectURL,n=k,o=a.btoa,p=a.atob,q=a.ArrayBuffer,r=a.Uint8Array,s=/^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/;for(d.fake=f.fake=!0;j--;)h.prototype[i[j]]=j+1;return k.createObjectURL||(n=a.URL=function(a){var b,c=document.createElementNS("http://www.w3.org/1999/xhtml","a");return c.href=a,"origin"in c||("data:"===c.protocol.toLowerCase()?c.origin=null:(b=a.match(s),c.origin=b&&b[1])),c}),n.createObjectURL=function(a){var b,c=a.type;return null===c&&(c="application/octet-stream"),a instanceof d?(b="data:"+c,"base64"===a.encoding?b+";base64,"+a.data:"URI"===a.encoding?b+","+decodeURIComponent(a.data):o?b+";base64,"+o(a.data):b+","+encodeURIComponent(a.data)):l?l.call(k,a):void 0},n.revokeObjectURL=function(a){"data:"!==a.substring(0,5)&&m&&m.call(k,a)},e.append=function(a){var c=this.data;if(r&&(a instanceof q||a instanceof r)){for(var e="",f=new r(a),i=0,j=f.length;j>i;i++)e+=String.fromCharCode(f[i]);c.push(e)}else if("Blob"===b(a)||"File"===b(a)){if(!g)throw new h("NOT_READABLE_ERR");var k=new g;c.push(k.readAsBinaryString(a))}else a instanceof d?"base64"===a.encoding&&p?c.push(p(a.data)):"URI"===a.encoding?c.push(decodeURIComponent(a.data)):"raw"===a.encoding&&c.push(a.data):("string"!=typeof a&&(a+=""),c.push(unescape(encodeURIComponent(a))))},e.getBlob=function(a){return arguments.length||(a=null),new d(this.data.join(""),a,"raw")},e.toString=function(){return"[object BlobBuilder]"},f.slice=function(a,b,c){var e=arguments.length;return 3>e&&(c=null),new d(this.data.slice(a,e>1?b:this.data.length),c,this.encoding)},f.toString=function(){return"[object Blob]"},f.close=function(){this.size=0,delete this.data},c}(a);a.Blob=function(a,b){var d=b?b.type||"":"",e=new c;if(a)for(var f=0,g=a.length;g>f;f++)e.append(a[f]);return e.getBlob(d)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content||this);var saveAs=saveAs||"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(a){"use strict";if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var b=a.document,c=function(){return a.URL||a.webkitURL||a},d=b.createElementNS("http://www.w3.org/1999/xhtml","a"),e=!a.externalHost&&"download"in d,f=function(c){var d=b.createEvent("MouseEvents");d.initMouseEvent("click",!0,!1,a,0,0,0,0,0,!1,!1,!1,!1,0,null),c.dispatchEvent(d)},g=a.webkitRequestFileSystem,h=a.requestFileSystem||g||a.mozRequestFileSystem,i=function(b){(a.setImmediate||a.setTimeout)(function(){throw b},0)},j="application/octet-stream",k=0,l=10,m=function(b){var d=function(){"string"==typeof b?c().revokeObjectURL(b):b.remove()};a.chrome?d():setTimeout(d,l)},n=function(a,b,c){b=[].concat(b);for(var d=b.length;d--;){var e=a["on"+b[d]];if("function"==typeof e)try{e.call(a,c||a)}catch(f){i(f)}}},o=function(b,i){var l,o,p,q=this,r=b.type,s=!1,t=function(){n(q,"writestart progress write writeend".split(" "))},u=function(){if((s||!l)&&(l=c().createObjectURL(b)),o)o.location.href=l;else{var d=a.open(l,"_blank");void 0==d&&"undefined"!=typeof safari&&(a.location.href=l)}q.readyState=q.DONE,t(),m(l)},v=function(a){return function(){return q.readyState!==q.DONE?a.apply(this,arguments):void 0}},w={create:!0,exclusive:!1};return q.readyState=q.INIT,i||(i="download"),e?(l=c().createObjectURL(b),d.href=l,d.download=i,f(d),q.readyState=q.DONE,t(),void m(l)):(a.chrome&&r&&r!==j&&(p=b.slice||b.webkitSlice,b=p.call(b,0,b.size,j),s=!0),g&&"download"!==i&&(i+=".download"),(r===j||g)&&(o=a),h?(k+=b.size,void h(a.TEMPORARY,k,v(function(a){a.root.getDirectory("saved",w,v(function(a){var c=function(){a.getFile(i,w,v(function(a){a.createWriter(v(function(c){c.onwriteend=function(b){o.location.href=a.toURL(),q.readyState=q.DONE,n(q,"writeend",b),m(a)},c.onerror=function(){var a=c.error;a.code!==a.ABORT_ERR&&u()},"writestart progress write abort".split(" ").forEach(function(a){c["on"+a]=q["on"+a]}),c.write(b),q.abort=function(){c.abort(),q.readyState=q.DONE},q.readyState=q.WRITING}),u)}),u)};a.getFile(i,{create:!1},v(function(a){a.remove(),c()}),v(function(a){a.code===a.NOT_FOUND_ERR?c():u()}))}),u)}),u)):void u())},p=o.prototype,q=function(a,b){return new o(a,b)};return p.abort=function(){var a=this;a.readyState=a.DONE,n(a,"abort")},p.readyState=p.INIT=0,p.WRITING=1,p.DONE=2,p.error=p.onwritestart=p.onprogress=p.onwrite=p.onabort=p.onerror=p.onwriteend=null,q}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);"undefined"!=typeof module&&null!==module?module.exports=saveAs:"undefined"!=typeof define&&null!==define&&null!=define.amd&&define([],function(){return saveAs});var ics=function(){"use strict";if(navigator.userAgent.indexOf("MSIE")>-1&&-1==navigator.userAgent.indexOf("MSIE 10"))return void console.log("Unsupported Browser");var a=-1!==navigator.appVersion.indexOf("Win")?"\r\n":"\n",b=[],c=["BEGIN:VCALENDAR","VERSION:2.0"].join(a),d=a+"END:VCALENDAR";return{events:function(){return b},calendar:function(){return c+a+b.join(a)+d},addEvent:function(c,d,e,f,g,h){if("undefined"==typeof c||"undefined"==typeof d||"undefined"==typeof e||"undefined"==typeof f||"undefined"==typeof g)return!1;if(h&&!h.rule){if("YEARLY"!==h.freq&&"MONTHLY"!==h.freq&&"WEEKLY"!==h.freq&&"DAILY"!==h.freq)throw"Recurrence rule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'";if(h.until&&isNaN(Date.parse(h.until)))throw"Recurrence rule 'until' must be a valid date string";if(h.interval&&isNaN(parseInt(h.interval)))throw"Recurrence rule 'interval' must be an integer";if(h.count&&isNaN(parseInt(h.count)))throw"Recurrence rule 'count' must be an integer"}var i=new Date(f),j=new Date(g),k=("0000"+i.getFullYear().toString()).slice(-4),l=("00"+(i.getMonth()+1).toString()).slice(-2),m=("00"+i.getDate().toString()).slice(-2),n=("00"+i.getHours().toString()).slice(-2),o=("00"+i.getMinutes().toString()).slice(-2),p=("00"+i.getMinutes().toString()).slice(-2),q=("0000"+j.getFullYear().toString()).slice(-4),r=("00"+(j.getMonth()+1).toString()).slice(-2),s=("00"+j.getDate().toString()).slice(-2),t=("00"+j.getHours().toString()).slice(-2),u=("00"+j.getMinutes().toString()).slice(-2),v=("00"+j.getMinutes().toString()).slice(-2),w="",x="";o+p+u+v!==0&&(w="T"+n+o+p,x="T"+t+u+v);var y,z=k+l+m+w,A=q+r+s+x;if(h)if(h.rule)y=h.rule;else{if(y="RRULE:FREQ="+h.freq,h.until){var B=new Date(Date.parse(h.until)).toISOString();y+=";UNTIL="+B.substring(0,B.length-13).replace(/[-]/g,"")+"000000Z"}h.interval&&(y+=";INTERVAL="+h.interval),h.count&&(y+=";COUNT="+h.count)}var C=["BEGIN:VEVENT","CLASS:PUBLIC","DESCRIPTION:"+d,"DTSTART;VALUE=DATE:"+z,"DTEND;VALUE=DATE:"+A,"LOCATION:"+e,"SUMMARY;LANGUAGE=en-us:"+c,"TRANSP:TRANSPARENT","END:VEVENT"];return y&&C.splice(4,0,y),C=C.join(a),b.push(C),C},download:function(e,f){if(b.length<1)return!1;f="undefined"!=typeof f?f:".ics",e="undefined"!=typeof e?e:"calendar";var g,h=c+a+b.join(a)+d;if(-1===navigator.userAgent.indexOf("MSIE 10"))g=new Blob([h]);else{var i=new BlobBuilder;i.append(h),g=i.getBlob("text/x-vCalendar;charset="+document.characterSet)}return saveAs(g,e+f),h}}};
var ics = function() {
    'use strict';

    if (navigator.userAgent.indexOf('MSIE') > -1 && navigator.userAgent.indexOf('MSIE 10') == -1) {
        console.log('Unsupported Browser');
        return;
    }

    var SEPARATOR = (navigator.appVersion.indexOf('Win') !== -1) ? '\r\n' : '\n';
    var calendarEvents = [];
    var calendarStart = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0'
    ].join(SEPARATOR);
    var calendarEnd = SEPARATOR + 'END:VCALENDAR';

    return {
        /**
         * Returns events array
         * @return {array} Events
         */
        'events': function() {
            return calendarEvents;
        },

        /**
         * Returns calendar
         * @return {string} Calendar in iCalendar format
         */
        'calendar': function() {
            return calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;
        },

        /**
         * Add event to the calendar
         * @param  {string} subject     Subject/Title of event
         * @param  {string} description Description of event
         * @param  {string} location    Location of event
         * @param  {string} begin       Beginning date of event
         * @param  {string} stop        Ending date of event
         */
        'addEvent': function(subject, description, location, begin, stop, rrule, days) {
            // I'm not in the mood to make these optional... So they are all required
            if (typeof subject === 'undefined' ||
                typeof description === 'undefined' ||
                typeof location === 'undefined' ||
                typeof begin === 'undefined' ||
                typeof stop === 'undefined'
            ) {
                return false;
            }

            // validate rrule
            if (rrule) {
              if (!rrule.rule) {
                if (rrule.freq !== 'YEARLY' && rrule.freq !== 'MONTHLY' && rrule.freq !== 'WEEKLY' && rrule.freq !== 'DAILY') {
                  throw "Recurrence rule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'";
                }

                if (rrule.until) {
                  if (isNaN(Date.parse(rrule.until))) {
                    throw "Recurrence rule 'until' must be a valid date string";
                  }
                }

                if (rrule.interval) {
                  if (isNaN(parseInt(rrule.interval))) {
                    throw "Recurrence rule 'interval' must be an integer";
                  }
                }

                if (rrule.count) {
                  if (isNaN(parseInt(rrule.count))) {
                    throw "Recurrence rule 'count' must be an integer";
                  }
                }
              }
            }

            //TODO add time and time zone? use moment to format?
            var start_date = new Date(begin);
            var end_date = new Date(stop);

            var start_year = ("0000" + (start_date.getFullYear().toString())).slice(-4);
            var start_month = ("00" + ((start_date.getMonth() + 1).toString())).slice(-2);
            var start_day = ("00" + ((start_date.getDate()).toString())).slice(-2);
            var start_hours = ("00" + (start_date.getHours().toString())).slice(-2);
            var start_minutes = ("00" + (start_date.getMinutes().toString())).slice(-2);
            var start_seconds = ("00" + (start_date.getMinutes().toString())).slice(-2);

            var end_year = ("0000" + (end_date.getFullYear().toString())).slice(-4);
            var end_month = ("00" + ((end_date.getMonth() + 1).toString())).slice(-2);
            var end_day = ("00" + ((end_date.getDate()).toString())).slice(-2);
            var end_hours = ("00" + (end_date.getHours().toString())).slice(-2);
            var end_minutes = ("00" + (end_date.getMinutes().toString())).slice(-2);
            var end_seconds = ("00" + (end_date.getMinutes().toString())).slice(-2);

            // Since some calendars don't add 0 second events, we need to remove time if there is none...
            var start_time = '';
            var end_time = '';
            if (start_minutes + start_seconds + end_minutes + end_seconds !== 0) {
                start_time = 'T' + start_hours + start_minutes + start_seconds;
                end_time = 'T' + end_hours + end_minutes + end_seconds;
            }

            var start = start_year + start_month + start_day + start_time;
            var end = end_year + end_month + end_day + end_time;

            // recurrence rule vars
            var rruleString;
            if (rrule) {
              if (rrule.rule) {
                rruleString = rrule.rule;
              } else {
                rruleString = 'RRULE:FREQ=' + rrule.freq;

                if (rrule.until) {
                  var uDate = new Date(Date.parse(rrule.until)).toISOString();
                  rruleString += ';UNTIL=' + uDate.substring(0, uDate.length - 13).replace(/[-]/g, '') + '000000Z';
                }

                if (rrule.interval) {
                  rruleString += ';INTERVAL=' + rrule.interval;
                }

                if (rrule.count) {
                  rruleString += ';COUNT=' + rrule.count;
                }
				
				if(days)
				{
					rruleString+=';BYDAY=' + days;
				}
              }
            }
			alert(rruleString);

            var calendarEvent = [
                'BEGIN:VEVENT',
                'CLASS:PUBLIC',
                'DESCRIPTION:' + description,
                'DTSTART;VALUE=DATE-TIME:' + start,
                'DTEND;VALUE=DATE-TIME:' + end,
                'LOCATION:' + location,
                'SUMMARY;LANGUAGE=en-us:' + subject,
                'TRANSP:TRANSPARENT',
                'END:VEVENT'
            ];

            if (rruleString) {
              calendarEvent.splice(4, 0, rruleString);
            }

            calendarEvent = calendarEvent.join(SEPARATOR);

            calendarEvents.push(calendarEvent);
            return calendarEvent;
        },

        /**
         * Download calendar using the saveAs function from filesave.js
         * @param  {string} filename Filename
         * @param  {string} ext      Extention
         */
        'download': function(filename, ext) {
            if (calendarEvents.length < 1) {
                return false;
            }

            ext = (typeof ext !== 'undefined') ? ext : '.ics';
            filename = (typeof filename !== 'undefined') ? filename : 'calendar';
            var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;

            var blob;
            if (navigator.userAgent.indexOf('MSIE 10') === -1) { // chrome or firefox
                blob = new Blob([calendar]);
            } else { // ie
                var bb = new BlobBuilder();
                bb.append(calendar);
                blob = bb.getBlob('text/x-vCalendar;charset=' + document.characterSet);
            }
            saveAs(blob, "ISU Class Schedule" + ext);
            return calendar;
        }
    };
};


//RRule.js
/*!
 * rrule.js - Library for working with recurrence rules for calendar dates.
 * https://github.com/jkbrzt/rrule
 *
 * Copyright 2010, Jakub Roztocil and Lars Schoning
 * Licenced under the BSD licence.
 * https://github.com/jkbrzt/rrule/blob/master/LICENCE
 *
 * Based on:
 * python-dateutil - Extensions to the standard Python datetime module.
 * Copyright (c) 2003-2011 - Gustavo Niemeyer <gustavo@niemeyer.net>
 * Copyright (c) 2012 - Tomi Pieviläinen <tomi.pievilainen@iki.fi>
 * https://github.com/jkbrzt/rrule/blob/master/LICENCE
 *
 */
(function(root){

var serverSide = typeof module !== 'undefined' && module.exports;


var getnlp = function() {
    if (!getnlp._nlp) {
        if (serverSide) {
            // Lazy, runtime import to avoid circular refs.
            getnlp._nlp = require('./nlp')
        } else if (!(getnlp._nlp = root._RRuleNLP)) {
            throw new Error(
                'You need to include rrule/nlp.js for fromText/toText to work.'
            )
        }
    }
    return getnlp._nlp;
};


//=============================================================================
// Date utilities
//=============================================================================

/**
 * General date-related utilities.
 * Also handles several incompatibilities between JavaScript and Python
 *
 */
var dateutil = {

    MONTH_DAYS: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

    /**
     * Number of milliseconds of one day
     */
    ONE_DAY: 1000 * 60 * 60 * 24,

    /**
     * @see: <http://docs.python.org/library/datetime.html#datetime.MAXYEAR>
     */
    MAXYEAR: 9999,

    /**
     * Python uses 1-Jan-1 as the base for calculating ordinals but we don't
     * want to confuse the JS engine with milliseconds > Number.MAX_NUMBER,
     * therefore we use 1-Jan-1970 instead
     */
    ORDINAL_BASE: new Date(1970, 0, 1),

    /**
     * Python: MO-SU: 0 - 6
     * JS: SU-SAT 0 - 6
     */
    PY_WEEKDAYS: [6, 0, 1, 2, 3, 4, 5],

    /**
     * py_date.timetuple()[7]
     */
    getYearDay: function(date) {
        var dateNoTime = new Date(
            date.getFullYear(), date.getMonth(), date.getDate());
        return Math.ceil(
            (dateNoTime - new Date(date.getFullYear(), 0, 1))
            / dateutil.ONE_DAY) + 1;
    },

    isLeapYear: function(year) {
        if (year instanceof Date) {
            year = year.getFullYear();
        }
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    },

    /**
     * @return {Number} the date's timezone offset in ms
     */
    tzOffset: function(date) {
         return date.getTimezoneOffset() * 60 * 1000
    },

    /**
     * @see: <http://www.mcfedries.com/JavaScript/DaysBetween.asp>
     */
    daysBetween: function(date1, date2) {
        // The number of milliseconds in one day
        // Convert both dates to milliseconds
        var date1_ms = date1.getTime() - dateutil.tzOffset(date1);
        var date2_ms = date2.getTime() - dateutil.tzOffset(date2);
        // Calculate the difference in milliseconds
        var difference_ms = Math.abs(date1_ms - date2_ms);
        // Convert back to days and return
        return Math.round(difference_ms / dateutil.ONE_DAY);
    },

    /**
     * @see: <http://docs.python.org/library/datetime.html#datetime.date.toordinal>
     */
    toOrdinal: function(date) {
        return dateutil.daysBetween(date, dateutil.ORDINAL_BASE);
    },

    /**
     * @see - <http://docs.python.org/library/datetime.html#datetime.date.fromordinal>
     */
    fromOrdinal: function(ordinal) {
        var millisecsFromBase = ordinal * dateutil.ONE_DAY;
        return new Date(dateutil.ORDINAL_BASE.getTime()
                        - dateutil.tzOffset(dateutil.ORDINAL_BASE)
                        +  millisecsFromBase
                        + dateutil.tzOffset(new Date(millisecsFromBase)));
    },

    /**
     * @see: <http://docs.python.org/library/calendar.html#calendar.monthrange>
     */
    monthRange: function(year, month) {
        var date = new Date(year, month, 1);
        return [dateutil.getWeekday(date), dateutil.getMonthDays(date)];
    },

    getMonthDays: function(date) {
        var month = date.getMonth();
        return month == 1 && dateutil.isLeapYear(date)
            ? 29
            : dateutil.MONTH_DAYS[month];
    },

    /**
     * @return {Number} python-like weekday
     */
    getWeekday: function(date) {
        return dateutil.PY_WEEKDAYS[date.getDay()];
    },

    /**
     * @see: <http://docs.python.org/library/datetime.html#datetime.datetime.combine>
     */
    combine: function(date, time) {
        time = time || date;
        return new Date(
            date.getFullYear(), date.getMonth(), date.getDate(),
            time.getHours(), time.getMinutes(), time.getSeconds()
        );
    },

    clone: function(date) {
        var dolly = new Date(date.getTime());
        dolly.setMilliseconds(0);
        return dolly;
    },

    cloneDates: function(dates) {
        var clones = [];
        for (var i = 0; i < dates.length; i++) {
            clones.push(dateutil.clone(dates[i]));
        }
        return clones;
    },

    /**
     * Sorts an array of Date or dateutil.Time objects
     */
    sort: function(dates) {
        dates.sort(function(a, b){
            return a.getTime() - b.getTime();
        });
    },

    timeToUntilString: function(time) {
        var date = new Date(time);
        var comp, comps = [
            date.getUTCFullYear(),
            date.getUTCMonth() + 1,
            date.getUTCDate(),
            'T',
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            'Z'
        ];
        for (var i = 0; i < comps.length; i++) {
            comp = comps[i];
            if (!/[TZ]/.test(comp) && comp < 10) {
                comps[i] = '0' + String(comp);
            }
        }
        return comps.join('');
    },

    untilStringToDate: function(until) {
        var re = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z)?$/;
        var bits = re.exec(until);
        if (!bits) {
            throw new Error('Invalid UNTIL value: ' + until)
        }
        return new Date(
            Date.UTC(bits[1],
            bits[2] - 1,
            bits[3],
            bits[5] || 0,
            bits[6] || 0,
            bits[7] || 0
        ));
    }

};

dateutil.Time = function(hour, minute, second) {
    this.hour = hour;
    this.minute = minute;
    this.second = second;
};

dateutil.Time.prototype = {
    getHours: function() {
        return this.hour;
    },
    getMinutes: function() {
        return this.minute;
    },
    getSeconds: function() {
        return this.second;
    },
    getTime: function() {
        return ((this.hour * 60 * 60)
                 + (this.minute * 60)
                 + this.second)
               * 1000;
    }
};


//=============================================================================
// Helper functions
//=============================================================================


/**
 * Simplified version of python's range()
 */
var range = function(start, end) {
    if (arguments.length === 1) {
        end = start;
        start = 0;
    }
    var rang = [];
    for (var i = start; i < end; i++) {
        rang.push(i);
    }
    return rang;
};
var repeat = function(value, times) {
    var i = 0, array = [];
    if (value instanceof Array) {
        for (; i < times; i++) {
            array[i] = [].concat(value);
        }
    } else {
        for (; i < times; i++) {
            array[i] = value;
        }
    }
    return array;
};


/**
 * closure/goog/math/math.js:modulo
 * Copyright 2006 The Closure Library Authors.
 * The % operator in JavaScript returns the remainder of a / b, but differs from
 * some other languages in that the result will have the same sign as the
 * dividend. For example, -1 % 8 == -1, whereas in some other languages
 * (such as Python) the result would be 7. This function emulates the more
 * correct modulo behavior, which is useful for certain applications such as
 * calculating an offset index in a circular list.
 *
 * @param {number} a The dividend.
 * @param {number} b The divisor.
 * @return {number} a % b where the result is between 0 and b (either 0 <= x < b
 *     or b < x <= 0, depending on the sign of b).
 */
var pymod = function(a, b) {
  var r = a % b;
  // If r and b differ in sign, add b to wrap the result to the correct sign.
  return (r * b < 0) ? r + b : r;
};


/**
 * @see: <http://docs.python.org/library/functions.html#divmod>
 */
var divmod = function(a, b) {
    return {div: Math.floor(a / b), mod: pymod(a, b)};
};


/**
 * Python-like boolean
 * @return {Boolean} value of an object/primitive, taking into account
 * the fact that in Python an empty list's/tuple's
 * boolean value is False, whereas in JS it's true
 */
var plb = function(obj) {
    return (obj instanceof Array && obj.length == 0)
        ? false
        : Boolean(obj);
};


/**
 * Return true if a value is in an array
 */
var contains = function(arr, val) {
    return arr.indexOf(val) != -1;
};


//=============================================================================
// Date masks
//=============================================================================

// Every mask is 7 days longer to handle cross-year weekly periods.

var M365MASK = [].concat(
    repeat(1, 31),  repeat(2, 28),  repeat(3, 31),
    repeat(4, 30),  repeat(5, 31),  repeat(6, 30),
    repeat(7, 31),  repeat(8, 31),  repeat(9, 30),
    repeat(10, 31), repeat(11, 30), repeat(12, 31),
    repeat(1, 7)
);
var M366MASK = [].concat(
    repeat(1, 31),  repeat(2, 29),  repeat(3, 31),
    repeat(4, 30),  repeat(5, 31),  repeat(6, 30),
    repeat(7, 31),  repeat(8, 31),  repeat(9, 30),
    repeat(10, 31), repeat(11, 30), repeat(12, 31),
    repeat(1, 7)
);

var
    M28 = range(1, 29),
    M29 = range(1, 30),
    M30 = range(1, 31),
    M31 = range(1, 32);
var MDAY366MASK = [].concat(
    M31, M29, M31,
    M30, M31, M30,
    M31, M31, M30,
    M31, M30, M31,
    M31.slice(0, 7)
);
var MDAY365MASK = [].concat(
    M31, M28, M31,
    M30, M31, M30,
    M31, M31, M30,
    M31, M30, M31,
    M31.slice(0, 7)
);

M28 = range(-28, 0);
M29 = range(-29, 0);
M30 = range(-30, 0);
M31 = range(-31, 0);
var NMDAY366MASK = [].concat(
    M31, M29, M31,
    M30, M31, M30,
    M31, M31, M30,
    M31, M30, M31,
    M31.slice(0, 7)
);
var NMDAY365MASK = [].concat(
    M31, M28, M31,
    M30, M31, M30,
    M31, M31, M30,
    M31, M30, M31,
    M31.slice(0, 7)
);

var M366RANGE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];
var M365RANGE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

var WDAYMASK = (function() {
    for (var wdaymask = [], i = 0; i < 55; i++) {
        wdaymask = wdaymask.concat(range(7));
    }
    return wdaymask;
}());


//=============================================================================
// Weekday
//=============================================================================

var Weekday = function(weekday, n) {
    if (n === 0) {
        throw new Error('Can\'t create weekday with n == 0');
    }
    this.weekday = weekday;
    this.n = n;
};

Weekday.prototype = {

    // __call__ - Cannot call the object directly, do it through
    // e.g. RRule.TH.nth(-1) instead,
    nth: function(n) {
        return this.n == n ? this : new Weekday(this.weekday, n);
    },

    // __eq__
    equals: function(other) {
        return this.weekday == other.weekday && this.n == other.n;
    },

    // __repr__
    toString: function() {
        var s = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'][this.weekday];
        if (this.n) {
            s = (this.n > 0 ? '+' : '') + String(this.n) + s;
        }
        return s;
    },

    getJsWeekday: function() {
        return this.weekday == 6 ? 0 : this.weekday + 1;
    }

};


//=============================================================================
// RRule
//=============================================================================

/**
 *
 * @param {Object?} options - see <http://labix.org/python-dateutil/#head-cf004ee9a75592797e076752b2a889c10f445418>
 *        The only required option is `freq`, one of RRule.YEARLY, RRule.MONTHLY, ...
 * @constructor
 */
var RRule = function(options, noCache) {

    // RFC string
    this._string = null;

    options = options || {};

    this._cache = noCache ? null : {
        all: false,
        before: [],
        after: [],
        between: []
    };

    // used by toString()
    this.origOptions = {};

    var invalid = [],
        keys = Object.keys(options),
        defaultKeys = Object.keys(RRule.DEFAULT_OPTIONS);

    // Shallow copy for origOptions and check for invalid
    keys.forEach(function(key) {
        this.origOptions[key] = options[key];
        if (!contains(defaultKeys, key)) invalid.push(key);
    }, this);

    if (invalid.length) {
        throw new Error('Invalid options: ' + invalid.join(', '))
    }

    if (!RRule.FREQUENCIES[options.freq] && options.byeaster === null) {
        throw new Error('Invalid frequency: ' + String(options.freq))
    }

    // Merge in default options
    defaultKeys.forEach(function(key) {
        if (!contains(keys, key)) options[key] = RRule.DEFAULT_OPTIONS[key];
    });

    var opts = this.options = options;

    if (opts.byeaster !== null) {
        opts.freq = RRule.YEARLY;
    }

    if (!opts.dtstart) {
        opts.dtstart = new Date();
        opts.dtstart.setMilliseconds(0);
    }

    if (opts.wkst === null) {
        opts.wkst = RRule.MO.weekday;
    } else if (typeof opts.wkst == 'number') {
        // cool, just keep it like that
    } else {
        opts.wkst = opts.wkst.weekday;
    }

    if (opts.bysetpos !== null) {
        if (typeof opts.bysetpos == 'number') {
            opts.bysetpos = [opts.bysetpos];
        }
        for (var i = 0; i < opts.bysetpos.length; i++) {
            var v = opts.bysetpos[i];
            if (v == 0 || !(-366 <= v && v <= 366)) {
                throw new Error(
                    'bysetpos must be between 1 and 366,' +
                        ' or between -366 and -1'
                );
            }
        }
    }

    if (!(plb(opts.byweekno) || plb(opts.byyearday)
        || plb(opts.bymonthday) || opts.byweekday !== null
        || opts.byeaster !== null))
    {
        switch (opts.freq) {
            case RRule.YEARLY:
                if (!opts.bymonth) {
                    opts.bymonth = opts.dtstart.getMonth() + 1;
                }
                opts.bymonthday = opts.dtstart.getDate();
                break;
            case RRule.MONTHLY:
                opts.bymonthday = opts.dtstart.getDate();
                break;
            case RRule.WEEKLY:
                opts.byweekday = dateutil.getWeekday(
                                            opts.dtstart);
                break;
        }
    }

    // bymonth
    if (opts.bymonth !== null
        && !(opts.bymonth instanceof Array)) {
        opts.bymonth = [opts.bymonth];
    }

    // byyearday
    if (opts.byyearday !== null
        && !(opts.byyearday instanceof Array)) {
        opts.byyearday = [opts.byyearday];
    }

    // bymonthday
    if (opts.bymonthday === null) {
        opts.bymonthday = [];
        opts.bynmonthday = [];
    } else if (opts.bymonthday instanceof Array) {
        var bymonthday = [], bynmonthday = [];

        for (i = 0; i < opts.bymonthday.length; i++) {
            var v = opts.bymonthday[i];
            if (v > 0) {
                bymonthday.push(v);
            } else if (v < 0) {
                bynmonthday.push(v);
            }
        }
        opts.bymonthday = bymonthday;
        opts.bynmonthday = bynmonthday;
    } else {
        if (opts.bymonthday < 0) {
            opts.bynmonthday = [opts.bymonthday];
            opts.bymonthday = [];
        } else {
            opts.bynmonthday = [];
            opts.bymonthday = [opts.bymonthday];
        }
    }

    // byweekno
    if (opts.byweekno !== null
        && !(opts.byweekno instanceof Array)) {
        opts.byweekno = [opts.byweekno];
    }

    // byweekday / bynweekday
    if (opts.byweekday === null) {
        opts.bynweekday = null;
    } else if (typeof opts.byweekday == 'number') {
        opts.byweekday = [opts.byweekday];
        opts.bynweekday = null;

    } else if (opts.byweekday instanceof Weekday) {

        if (!opts.byweekday.n || opts.freq > RRule.MONTHLY) {
            opts.byweekday = [opts.byweekday.weekday];
            opts.bynweekday = null;
        } else {
            opts.bynweekday = [
                [opts.byweekday.weekday,
                 opts.byweekday.n]
            ];
            opts.byweekday = null;
        }

    } else {
        var byweekday = [], bynweekday = [];

        for (i = 0; i < opts.byweekday.length; i++) {
            var wday = opts.byweekday[i];

            if (typeof wday == 'number') {
                byweekday.push(wday);
            } else if (!wday.n || opts.freq > RRule.MONTHLY) {
                byweekday.push(wday.weekday);
            } else {
                bynweekday.push([wday.weekday, wday.n]);
            }
        }
        opts.byweekday = plb(byweekday) ? byweekday : null;
        opts.bynweekday = plb(bynweekday) ? bynweekday : null;
    }

    // byhour
    if (opts.byhour === null) {
        opts.byhour = (opts.freq < RRule.HOURLY)
            ? [opts.dtstart.getHours()]
            : null;
    } else if (typeof opts.byhour == 'number') {
        opts.byhour = [opts.byhour];
    }

    // byminute
    if (opts.byminute === null) {
        opts.byminute = (opts.freq < RRule.MINUTELY)
            ? [opts.dtstart.getMinutes()]
            : null;
    } else if (typeof opts.byminute == 'number') {
        opts.byminute = [opts.byminute];
    }

    // bysecond
    if (opts.bysecond === null) {
        opts.bysecond = (opts.freq < RRule.SECONDLY)
            ? [opts.dtstart.getSeconds()]
            : null;
    } else if (typeof opts.bysecond == 'number') {
        opts.bysecond = [opts.bysecond];
    }

    if (opts.freq >= RRule.HOURLY) {
        this.timeset = null;
    } else {
        this.timeset = [];
        for (i = 0; i < opts.byhour.length; i++) {
            var hour = opts.byhour[i];
            for (var j = 0; j < opts.byminute.length; j++) {
                var minute = opts.byminute[j];
                for (var k = 0; k < opts.bysecond.length; k++) {
                    var second = opts.bysecond[k];
                    // python:
                    // datetime.time(hour, minute, second,
                    // tzinfo=self._tzinfo))
                    this.timeset.push(new dateutil.Time(hour, minute, second));
                }
            }
        }
        dateutil.sort(this.timeset);
    }

};
//}}}

// RRule class 'constants'

RRule.FREQUENCIES = [
    'YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY',
    'HOURLY', 'MINUTELY', 'SECONDLY'
];

RRule.YEARLY   = 0;
RRule.MONTHLY  = 1;
RRule.WEEKLY   = 2;
RRule.DAILY    = 3;
RRule.HOURLY   = 4;
RRule.MINUTELY = 5;
RRule.SECONDLY = 6;

RRule.MO = new Weekday(0);
RRule.TU = new Weekday(1);
RRule.WE = new Weekday(2);
RRule.TH = new Weekday(3);
RRule.FR = new Weekday(4);
RRule.SA = new Weekday(5);
RRule.SU = new Weekday(6);

RRule.DEFAULT_OPTIONS = {
    freq:        null,
    dtstart:     null,
    interval:    1,
    wkst:        RRule.MO,
    count:       null,
    until:       null,
    bysetpos:    null,
    bymonth:     null,
    bymonthday:  null,
    byyearday:   null,
    byweekno:    null,
    byweekday:   null,
    byhour:      null,
    byminute:    null,
    bysecond:    null,
	rule:		 true,
    byeaster:    null
};



RRule.parseText = function(text, language) {
    return getnlp().parseText(text, language)
};

RRule.fromText = function(text, language) {
    return getnlp().fromText(text, language)
};

RRule.optionsToString = function(options) {
    var key, keys, defaultKeys, value, strValues, pairs = [];

    keys = Object.keys(options);
    defaultKeys = Object.keys(RRule.DEFAULT_OPTIONS);

    for (var i = 0; i < keys.length; i++) {

        if (!contains(defaultKeys, keys[i])) continue;

        key = keys[i].toUpperCase();
        value = options[keys[i]];
        strValues = [];

        if (value === null || value instanceof Array && !value.length) {
            continue;
        }

        switch (key) {
            case 'FREQ':
                value = RRule.FREQUENCIES[options.freq];
                break;
            case 'WKST':
                value = value.toString();
                break;
            case 'BYWEEKDAY':
                /*
                NOTE: BYWEEKDAY is a special case.
                RRule() deconstructs the rule.options.byweekday array
                into an array of Weekday arguments.
                On the other hand, rule.origOptions is an array of Weekdays.
                We need to handle both cases here.
                It might be worth change RRule to keep the Weekdays.

                Also, BYWEEKDAY (used by RRule) vs. BYDAY (RFC)

                */
                key = 'BYDAY';
                if (!(value instanceof Array)) {
                    value = [value];
                }
                for (var wday, j = 0; j < value.length; j++) {
                    wday = value[j];
                    if (wday instanceof Weekday) {
                        // good
                    } else if (wday instanceof Array) {
                        wday = new Weekday(wday[0], wday[1]);
                    } else {
                        wday = new Weekday(wday);
                    }
                    strValues[j] = wday.toString();
                }
                value = strValues;
                break;
            case'DTSTART':
            case'UNTIL':
                value = dateutil.timeToUntilString(value);
                break;
            default:
                if (value instanceof Array) {
                    for (var j = 0; j < value.length; j++) {
                        strValues[j] = String(value[j]);
                    }
                    value = strValues;
                } else {
                    value = String(value);
                }

        }
        pairs.push([key, value]);
    }

    var strings = [];
    for (var i = 0; i < pairs.length; i++) {
        var attr = pairs[i];
        strings.push(attr[0] + '=' + attr[1].toString());
    }
    return strings.join(';');

};

RRule.prototype = {

    /**
     * @param {Function} iterator - optional function that will be called
     *                   on each date that is added. It can return false
     *                   to stop the iteration.
     * @return Array containing all recurrences.
     */
    all: function(iterator) {
        if (iterator) {
            return this._iter(new CallbackIterResult('all', {}, iterator));
        } else {
            var result = this._cacheGet('all');
            if (result === false) {
                result = this._iter(new IterResult('all', {}));
                this._cacheAdd('all', result);
            }
            return result;
        }
    },

    /**
     * Returns all the occurrences of the rrule between after and before.
     * The inc keyword defines what happens if after and/or before are
     * themselves occurrences. With inc == True, they will be included in the
     * list, if they are found in the recurrence set.
     * @return Array
     */
    between: function(after, before, inc, iterator) {
        var args = {
                before: before,
                after: after,
                inc: inc
            }

        if (iterator) {
            return this._iter(
                new CallbackIterResult('between', args, iterator));
        } else {
            var result = this._cacheGet('between', args);
            if (result === false) {
                result = this._iter(new IterResult('between', args));
                this._cacheAdd('between', result, args);
            }
            return result;
        }
    },

    /**
     * Returns the last recurrence before the given datetime instance.
     * The inc keyword defines what happens if dt is an occurrence.
     * With inc == True, if dt itself is an occurrence, it will be returned.
     * @return Date or null
     */
    before: function(dt, inc) {
        var args = {
                dt: dt,
                inc: inc
            },
            result = this._cacheGet('before', args);
        if (result === false) {
            result = this._iter(new IterResult('before', args));
            this._cacheAdd('before', result, args);
        }
        return result;
    },

    /**
     * Returns the first recurrence after the given datetime instance.
     * The inc keyword defines what happens if dt is an occurrence.
     * With inc == True, if dt itself is an occurrence, it will be returned.
     * @return Date or null
     */
    after: function(dt, inc) {
        var args = {
                dt: dt,
                inc: inc
            },
            result = this._cacheGet('after', args);
        if (result === false) {
            result = this._iter(new IterResult('after', args));
            this._cacheAdd('after', result, args);
        }
        return result;
    },

    /**
     * Returns the number of recurrences in this set. It will have go trough
     * the whole recurrence, if this hasn't been done before.
     */
    count: function() {
        return this.all().length;
    },

    /**
     * Converts the rrule into its string representation
     * @see <http://www.ietf.org/rfc/rfc2445.txt>
     * @return String
     */
    toString: function() {
        return RRule.optionsToString(this.origOptions);
    },

	/**
	* Will convert all rules described in nlp:ToText
	* to text.
	*/
	toText: function(gettext, language) {
        return getnlp().toText(this, gettext, language);
	},

    isFullyConvertibleToText: function() {
        return getnlp().isFullyConvertible(this)
    },

    /**
     * @param {String} what - all/before/after/between
     * @param {Array,Date} value - an array of dates, one date, or null
     * @param {Object?} args - _iter arguments
     */
    _cacheAdd: function(what, value, args) {

        if (!this._cache) return;

        if (value) {
            value = (value instanceof Date)
                        ? dateutil.clone(value)
                        : dateutil.cloneDates(value);
        }

        if (what == 'all') {
                this._cache.all = value;
        } else {
            args._value = value;
            this._cache[what].push(args);
        }

    },

    /**
     * @return false - not in the cache
     *         null  - cached, but zero occurrences (before/after)
     *         Date  - cached (before/after)
     *         []    - cached, but zero occurrences (all/between)
     *         [Date1, DateN] - cached (all/between)
     */
    _cacheGet: function(what, args) {

        if (!this._cache) {
            return false;
        }

        var cached = false;

        if (what == 'all') {
            cached = this._cache.all;
        } else {
            // Let's see whether we've already called the
            // 'what' method with the same 'args'
            loopItems:
            for (var item, i = 0; i < this._cache[what].length; i++) {
                item = this._cache[what][i];
                for (var k in args) {
                    if (args.hasOwnProperty(k)
                        && String(args[k]) != String(item[k])) {
                        continue loopItems;
                    }
                }
                cached = item._value;
                break;
            }
        }

        if (!cached && this._cache.all) {
            // Not in the cache, but we already know all the occurrences,
            // so we can find the correct dates from the cached ones.
            var iterResult = new IterResult(what, args);
            for (var i = 0; i < this._cache.all.length; i++) {
                if (!iterResult.accept(this._cache.all[i])) {
                    break;
                }
            }
            cached = iterResult.getValue();
            this._cacheAdd(what, cached, args);
        }

        return cached instanceof Array
            ? dateutil.cloneDates(cached)
            : (cached instanceof Date
                ? dateutil.clone(cached)
                : cached);
    },

    /**
     * @return a RRule instance with the same freq and options
     *          as this one (cache is not cloned)
     */
    clone: function() {
        return new RRule(this.origOptions);
    },

    _iter: function(iterResult) {

        /* Since JavaScript doesn't have the python's yield operator (<1.7),
           we use the IterResult object that tells us when to stop iterating.

        */

        var dtstart = this.options.dtstart;

        var
            year = dtstart.getFullYear(),
            month = dtstart.getMonth() + 1,
            day = dtstart.getDate(),
            hour = dtstart.getHours(),
            minute = dtstart.getMinutes(),
            second = dtstart.getSeconds(),
            weekday = dateutil.getWeekday(dtstart),
            yearday = dateutil.getYearDay(dtstart);

        // Some local variables to speed things up a bit
        var
            freq = this.options.freq,
            interval = this.options.interval,
            wkst = this.options.wkst,
            until = this.options.until,
            bymonth = this.options.bymonth,
            byweekno = this.options.byweekno,
            byyearday = this.options.byyearday,
            byweekday = this.options.byweekday,
            byeaster = this.options.byeaster,
            bymonthday = this.options.bymonthday,
            bynmonthday = this.options.bynmonthday,
            bysetpos = this.options.bysetpos,
            byhour = this.options.byhour,
            byminute = this.options.byminute,
            bysecond = this.options.bysecond;

        var ii = new Iterinfo(this);
        ii.rebuild(year, month);

        var getdayset = {};
        getdayset[RRule.YEARLY]   = ii.ydayset;
        getdayset[RRule.MONTHLY]  = ii.mdayset;
        getdayset[RRule.WEEKLY]   = ii.wdayset;
        getdayset[RRule.DAILY]    = ii.ddayset;
        getdayset[RRule.HOURLY]   = ii.ddayset;
        getdayset[RRule.MINUTELY] = ii.ddayset;
        getdayset[RRule.SECONDLY] = ii.ddayset;

        getdayset = getdayset[freq];

        var timeset;
        if (freq < RRule.HOURLY) {
            timeset = this.timeset;
        } else {
            var gettimeset = {};
            gettimeset[RRule.HOURLY]   = ii.htimeset;
            gettimeset[RRule.MINUTELY] = ii.mtimeset;
            gettimeset[RRule.SECONDLY] = ii.stimeset;
            gettimeset = gettimeset[freq];
            if ((freq >= RRule.HOURLY   && plb(byhour)   && !contains(byhour, hour)) ||
                (freq >= RRule.MINUTELY && plb(byminute) && !contains(byminute, minute)) ||
                (freq >= RRule.SECONDLY && plb(bysecond) && !contains(bysecond, minute)))
            {
                timeset = [];
            } else {
                timeset = gettimeset.call(ii, hour, minute, second);
            }
        }

        var filtered, total = 0, count = this.options.count;

        var iterNo = 0;

        var i, j, k, dm, div, mod, tmp, pos, dayset, start, end, fixday;

        while (true) {

            // Get dayset with the right frequency
            tmp = getdayset.call(ii, year, month, day);
            dayset = tmp[0]; start = tmp[1]; end = tmp[2];

            // Do the "hard" work ;-)
            filtered = false;
            for (j = start; j < end; j++) {

                i = dayset[j];

                if ((plb(bymonth) && !contains(bymonth, ii.mmask[i])) ||
                    (plb(byweekno) && !ii.wnomask[i]) ||
                    (plb(byweekday) && !contains(byweekday, ii.wdaymask[i])) ||
                    (plb(ii.nwdaymask) && !ii.nwdaymask[i]) ||
                    (byeaster !== null && !contains(ii.eastermask, i)) ||
                    (
                        (plb(bymonthday) || plb(bynmonthday)) &&
                        !contains(bymonthday, ii.mdaymask[i]) &&
                        !contains(bynmonthday, ii.nmdaymask[i])
                    )
                    ||
                    (
                        plb(byyearday)
                        &&
                        (
                            (
                                i < ii.yearlen &&
                                !contains(byyearday, i + 1) &&
                                !contains(byyearday, -ii.yearlen + i)
                            )
                            ||
                            (
                                i >= ii.yearlen &&
                                !contains(byyearday, i + 1 - ii.yearlen) &&
                                !contains(byyearday, -ii.nextyearlen + i - ii.yearlen)
                            )
                        )
                    )
                )
                {
                    dayset[i] = null;
                    filtered = true;
                }
            }

            // Output results
            if (plb(bysetpos) && plb(timeset)) {

                var daypos, timepos, poslist = [];

                for (i, j = 0; j < bysetpos.length; j++) {
                    var pos = bysetpos[j];
                    if (pos < 0) {
                        daypos = Math.floor(pos / timeset.length);
                        timepos = pymod(pos, timeset.length);
                    } else {
                        daypos = Math.floor((pos - 1) / timeset.length);
                        timepos = pymod((pos - 1), timeset.length);
                    }

                    try {
                        tmp = [];
                        for (k = start; k < end; k++) {
                            var val = dayset[k];
                            if (val === null) {
                                continue;
                            }
                            tmp.push(val);
                        }
                        if (daypos < 0) {
                            // we're trying to emulate python's aList[-n]
                            i = tmp.slice(daypos)[0];
                        } else {
                            i = tmp[daypos];
                        }

                        var time = timeset[timepos];

                        var date = dateutil.fromOrdinal(ii.yearordinal + i);
                        var res = dateutil.combine(date, time);
                        // XXX: can this ever be in the array?
                        // - compare the actual date instead?
                        if (!contains(poslist, res)) {
                            poslist.push(res);
                        }
                    } catch (e) {}
                }

                dateutil.sort(poslist);

                for (j = 0; j < poslist.length; j++) {
                    var res = poslist[j];
                    if (until && res > until) {
                        this._len = total;
                        return iterResult.getValue();
                    } else if (res >= dtstart) {
                        ++total;
                        if (!iterResult.accept(res)) {
                            return iterResult.getValue();
                        }
                        if (count) {
                            --count;
                            if (!count) {
                                this._len = total;
                                return iterResult.getValue();
                            }
                        }
                    }
                }

            } else {
                for (j = start; j < end; j++) {
                    i = dayset[j];
                    if (i !== null) {
                        var date = dateutil.fromOrdinal(ii.yearordinal + i);
                        for (k = 0; k < timeset.length; k++) {
                            var time = timeset[k];
                            var res = dateutil.combine(date, time);
                            if (until && res > until) {
                                this._len = total;
                                return iterResult.getValue();
                            } else if (res >= dtstart) {
                                ++total;
                                if (!iterResult.accept(res)) {
                                    return iterResult.getValue();
                                }
                                if (count) {
                                    --count;
                                    if (!count) {
                                        this._len = total;
                                        return iterResult.getValue();
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Handle frequency and interval
            fixday = false;
            if (freq == RRule.YEARLY) {
                year += interval;
                if (year > dateutil.MAXYEAR) {
                    this._len = total;
                    return iterResult.getValue();
                }
                ii.rebuild(year, month);
            } else if (freq == RRule.MONTHLY) {
                month += interval;
                if (month > 12) {
                    div = Math.floor(month / 12);
                    mod = pymod(month, 12);
                    month = mod;
                    year += div;
                    if (month == 0) {
                        month = 12;
                        --year;
                    }
                    if (year > dateutil.MAXYEAR) {
                        this._len = total;
                        return iterResult.getValue();
                    }
                }
                ii.rebuild(year, month);
            } else if (freq == RRule.WEEKLY) {
                if (wkst > weekday) {
                    day += -(weekday + 1 + (6 - wkst)) + interval * 7;
                } else {
                    day += -(weekday - wkst) + interval * 7;
                }
                weekday = wkst;
                fixday = true;
            } else if (freq == RRule.DAILY) {
                day += interval;
                fixday = true;
            } else if (freq == RRule.HOURLY) {
                if (filtered) {
                    // Jump to one iteration before next day
                    hour += Math.floor((23 - hour) / interval) * interval;
                }
                while (true) {
                    hour += interval;
                    dm = divmod(hour, 24);
                    div = dm.div;
                    mod = dm.mod;
                    if (div) {
                        hour = mod;
                        day += div;
                        fixday = true;
                    }
                    if (!plb(byhour) || contains(byhour, hour)) {
                        break;
                    }
                }
                timeset = gettimeset.call(ii, hour, minute, second);
            } else if (freq == RRule.MINUTELY) {
                if (filtered) {
                    // Jump to one iteration before next day
                    minute += Math.floor(
                        (1439 - (hour * 60 + minute)) / interval) * interval;
                }
                while(true) {
                    minute += interval;
                    dm = divmod(minute, 60);
                    div = dm.div;
                    mod = dm.mod;
                    if (div) {
                        minute = mod;
                        hour += div;
                        dm = divmod(hour, 24);
                        div = dm.div;
                        mod = dm.mod;
                        if (div) {
                            hour = mod;
                            day += div;
                            fixday = true;
                            filtered = false;
                        }
                    }
                    if ((!plb(byhour) || contains(byhour, hour)) &&
                        (!plb(byminute) || contains(byminute, minute))) {
                        break;
                    }
                }
                timeset = gettimeset.call(ii, hour, minute, second);
            } else if (freq == RRule.SECONDLY) {
                if (filtered) {
                    // Jump to one iteration before next day
                    second += Math.floor(
                        (86399 - (hour * 3600 + minute * 60 + second))
                        / interval) * interval;
                }
                while (true) {
                    second += interval;
                    dm = divmod(second, 60);
                    div = dm.div;
                    mod = dm.mod;
                    if (div) {
                        second = mod;
                        minute += div;
                        dm = divmod(minute, 60);
                        div = dm.div;
                        mod = dm.mod;
                        if (div) {
                            minute = mod;
                            hour += div;
                            dm = divmod(hour, 24);
                            div = dm.div;
                            mod = dm.mod;
                            if (div) {
                                hour = mod;
                                day += div;
                                fixday = true;
                            }
                        }
                    }
                    if ((!plb(byhour) || contains(byhour, hour)) &&
                        (!plb(byminute) || contains(byminute, minute)) &&
                        (!plb(bysecond) || contains(bysecond, second)))
                    {
                        break;
                    }
                }
                timeset = gettimeset.call(ii, hour, minute, second);
            }

            if (fixday && day > 28) {
                var daysinmonth = dateutil.monthRange(year, month - 1)[1];
                if (day > daysinmonth) {
                    while (day > daysinmonth) {
                        day -= daysinmonth;
                        ++month;
                        if (month == 13) {
                            month = 1;
                            ++year;
                            if (year > dateutil.MAXYEAR) {
                                this._len = total;
                                return iterResult.getValue();
                            }
                        }
                        daysinmonth = dateutil.monthRange(year, month - 1)[1];
                    }
                    ii.rebuild(year, month);
                }
            }
        }
    }

};


RRule.parseString = function(rfcString) {
    rfcString = rfcString.replace(/^\s+|\s+$/, '');
    if (!rfcString.length) {
        return null;
    }

    var i, j, key, value, attr,
        attrs = rfcString.split(';'),
        options = {};

    for (i = 0; i < attrs.length; i++) {
        attr = attrs[i].split('=');
        key = attr[0];
        value = attr[1];
        switch (key) {
            case 'FREQ':
                options.freq = RRule[value];
                break;
            case 'WKST':
                options.wkst = RRule[value];
                break;
            case 'COUNT':
            case 'INTERVAL':
            case 'BYSETPOS':
            case 'BYMONTH':
            case 'BYMONTHDAY':
            case 'BYYEARDAY':
            case 'BYWEEKNO':
            case 'BYHOUR':
            case 'BYMINUTE':
            case 'BYSECOND':
                if (value.indexOf(',') != -1) {
                    value = value.split(',');
                    for (j = 0; j < value.length; j++) {
                        if (/^[+-]?\d+$/.test(value[j])) {
                            value[j] = Number(value[j]);
                        }
                    }
                } else if (/^[+-]?\d+$/.test(value)) {
                    value = Number(value);
                }
                key = key.toLowerCase();
                options[key] = value;
                break;
            case 'BYDAY': // => byweekday
                var n, wday, day, days = value.split(',');
                options.byweekday = [];
                for (j = 0; j < days.length; j++) {
                    day = days[j];
                    if (day.length == 2) { // MO, TU, ...
                        wday = RRule[day]; // wday instanceof Weekday
                        options.byweekday.push(wday);
                    } else { // -1MO, +3FR, 1SO, ...
                        day = day.match(/^([+-]?\d)([A-Z]{2})$/);
                        n = Number(day[1]);
                        wday = day[2];
                        wday = RRule[wday].weekday;
                        options.byweekday.push(new Weekday(wday, n));
                    }
                }
                break;
            case 'DTSTART':
                options.dtstart = dateutil.untilStringToDate(value);
                break;
            case 'UNTIL':
                options.until = dateutil.untilStringToDate(value);
                break;
            case 'BYEASTER':
                options.byeaster = Number(value);
                break;
            default:
                throw new Error("Unknown RRULE property '" + key + "'");
        }
    }
    return options;
};


RRule.fromString = function(string) {
    return new RRule(RRule.parseString(string));
};


//=============================================================================
// Iterinfo
//=============================================================================

var Iterinfo = function(rrule) {
    this.rrule = rrule;
    this.lastyear = null;
    this.lastmonth = null;
    this.yearlen = null;
    this.nextyearlen = null;
    this.yearordinal = null;
    this.yearweekday = null;
    this.mmask = null;
    this.mrange = null;
    this.mdaymask = null;
    this.nmdaymask = null;
    this.wdaymask = null;
    this.wnomask = null;
    this.nwdaymask = null;
    this.eastermask = null;
};

Iterinfo.prototype.easter = function(y, offset) {
    offset = offset || 0;

    var a = y % 19,
        b = Math.floor(y / 100),
        c = y % 100,
        d = Math.floor(b / 4),
        e = b % 4,
        f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3),
        h = Math.floor(19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4),
        k = c % 4,
        l = Math.floor(32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451),
        month = Math.floor((h + l - 7 * m + 114) / 31),
        day = (h + l - 7 * m + 114) % 31 + 1,
        date = Date.UTC(y, month - 1, day + offset),
        yearStart = Date.UTC(y, 0, 1);

    return [ Math.ceil((date - yearStart) / (1000 * 60 * 60 * 24)) ];
}

Iterinfo.prototype.rebuild = function(year, month) {

    var rr = this.rrule;

    if (year != this.lastyear) {

        this.yearlen = dateutil.isLeapYear(year) ? 366 : 365;
        this.nextyearlen = dateutil.isLeapYear(year + 1) ? 366 : 365;
        var firstyday = new Date(year, 0, 1);

        this.yearordinal = dateutil.toOrdinal(firstyday);
        this.yearweekday = dateutil.getWeekday(firstyday);

        var wday = dateutil.getWeekday(new Date(year, 0, 1));

        if (this.yearlen == 365) {
            this.mmask = [].concat(M365MASK);
            this.mdaymask = [].concat(MDAY365MASK);
            this.nmdaymask = [].concat(NMDAY365MASK);
            this.wdaymask = WDAYMASK.slice(wday);
            this.mrange = [].concat(M365RANGE);
        } else {
            this.mmask = [].concat(M366MASK);
            this.mdaymask = [].concat(MDAY366MASK);
            this.nmdaymask = [].concat(NMDAY366MASK);
            this.wdaymask = WDAYMASK.slice(wday);
            this.mrange = [].concat(M366RANGE);
        }

        if (!plb(rr.options.byweekno)) {
            this.wnomask = null;
        } else {
            this.wnomask = repeat(0, this.yearlen + 7);
            var no1wkst, firstwkst, wyearlen;
            no1wkst = firstwkst = pymod(
                7 - this.yearweekday + rr.options.wkst, 7);
            if (no1wkst >= 4) {
                no1wkst = 0;
                // Number of days in the year, plus the days we got
                // from last year.
                wyearlen = this.yearlen + pymod(
                    this.yearweekday - rr.options.wkst, 7);
            } else {
                // Number of days in the year, minus the days we
                // left in last year.
                wyearlen = this.yearlen - no1wkst;
            }
            var div = Math.floor(wyearlen / 7);
            var mod = pymod(wyearlen, 7);
            var numweeks = Math.floor(div + (mod / 4));
            for (var n, i, j = 0; j < rr.options.byweekno.length; j++) {
                n = rr.options.byweekno[j];
                if (n < 0) {
                    n += numweeks + 1;
                } if (!(0 < n && n <= numweeks)) {
                    continue;
                } if (n > 1) {
                    i = no1wkst + (n - 1) * 7;
                    if (no1wkst != firstwkst) {
                        i -= 7-firstwkst;
                    }
                } else {
                    i = no1wkst;
                }
                for (var k = 0; k < 7; k++) {
                    this.wnomask[i] = 1;
                    i++;
                    if (this.wdaymask[i] == rr.options.wkst) {
                        break;
                    }
                }
            }

            if (contains(rr.options.byweekno, 1)) {
                // Check week number 1 of next year as well
                // orig-TODO : Check -numweeks for next year.
                var i = no1wkst + numweeks * 7;
                if (no1wkst != firstwkst) {
                    i -= 7 - firstwkst;
                }
                if (i < this.yearlen) {
                    // If week starts in next year, we
                    // don't care about it.
                    for (var j = 0; j < 7; j++) {
                        this.wnomask[i] = 1;
                        i += 1;
                        if (this.wdaymask[i] == rr.options.wkst) {
                            break;
                        }
                    }
                }
            }

            if (no1wkst) {
                // Check last week number of last year as
                // well. If no1wkst is 0, either the year
                // started on week start, or week number 1
                // got days from last year, so there are no
                // days from last year's last week number in
                // this year.
                var lnumweeks;
                if (!contains(rr.options.byweekno, -1)) {
                    var lyearweekday = dateutil.getWeekday(
                        new Date(year - 1, 0, 1));
                    var lno1wkst = pymod(
                        7 - lyearweekday + rr.options.wkst, 7);
                    var lyearlen = dateutil.isLeapYear(year - 1) ? 366 : 365;
                    if (lno1wkst >= 4) {
                        lno1wkst = 0;
                        lnumweeks = Math.floor(
                            52
                            + pymod(
                                lyearlen + pymod(
                                    lyearweekday - rr.options.wkst, 7), 7)
                            / 4);
                    } else {
                        lnumweeks = Math.floor(
                            52 + pymod(this.yearlen - no1wkst, 7) / 4);
                    }
                } else {
                    lnumweeks = -1;
                }
                if (contains(rr.options.byweekno, lnumweeks)) {
                    for (var i = 0; i < no1wkst; i++) {
                        this.wnomask[i] = 1;
                    }
                }
            }
        }
    }

    if (plb(rr.options.bynweekday)
        && (month != this.lastmonth || year != this.lastyear)) {
        var ranges = [];
        if (rr.options.freq == RRule.YEARLY) {
            if (plb(rr.options.bymonth)) {
                for (j = 0; j < rr.options.bymonth.length; j++) {
                    month = rr.options.bymonth[j];
                    ranges.push(this.mrange.slice(month - 1, month + 1));
                }
            } else {
                ranges = [[0, this.yearlen]];
            }
        } else if (rr.options.freq == RRule.MONTHLY) {
            ranges = [this.mrange.slice(month - 1, month + 1)];
        }
        if (plb(ranges)) {
            // Weekly frequency won't get here, so we may not
            // care about cross-year weekly periods.
            this.nwdaymask = repeat(0, this.yearlen);

            for (var j = 0; j < ranges.length; j++) {
                var rang = ranges[j];
                var first = rang[0], last = rang[1];
                last -= 1;
                for (var k = 0; k < rr.options.bynweekday.length; k++) {
                    var wday = rr.options.bynweekday[k][0],
                        n = rr.options.bynweekday[k][1];
                    if (n < 0) {
                        i = last + (n + 1) * 7;
                        i -= pymod(this.wdaymask[i] - wday, 7);
                    } else {
                        i = first + (n - 1) * 7;
                        i += pymod(7 - this.wdaymask[i] + wday, 7);
                    }
                    if (first <= i && i <= last) {
                        this.nwdaymask[i] = 1;
                    }
                }
            }

        }

        this.lastyear = year;
        this.lastmonth = month;
    }

    if (rr.options.byeaster !== null) {
        this.eastermask = this.easter(year, rr.options.byeaster);
    }
};

Iterinfo.prototype.ydayset = function(year, month, day) {
    return [range(this.yearlen), 0, this.yearlen];
};

Iterinfo.prototype.mdayset = function(year, month, day) {
    var set = repeat(null, this.yearlen);
    var start = this.mrange[month-1];
    var end = this.mrange[month];
    for (var i = start; i < end; i++) {
        set[i] = i;
    }
    return [set, start, end];
};

Iterinfo.prototype.wdayset = function(year, month, day) {

    // We need to handle cross-year weeks here.
    var set = repeat(null, this.yearlen + 7);
    var i = dateutil.toOrdinal(
        new Date(year, month - 1, day)) - this.yearordinal;
    var start = i;
    for (var j = 0; j < 7; j++) {
        set[i] = i;
        ++i;
        if (this.wdaymask[i] == this.rrule.options.wkst) {
            break;
        }
    }
    return [set, start, i];
};

Iterinfo.prototype.ddayset = function(year, month, day) {
    var set = repeat(null, this.yearlen);
    var i = dateutil.toOrdinal(
        new Date(year, month - 1, day)) - this.yearordinal;
    set[i] = i;
    return [set, i, i + 1];
};

Iterinfo.prototype.htimeset = function(hour, minute, second) {
    var set = [], rr = this.rrule;
    for (var i = 0; i < rr.options.byminute.length; i++) {
        minute = rr.options.byminute[i];
        for (var j = 0; j < rr.options.bysecond.length; j++) {
            second = rr.options.bysecond[j];
            set.push(new dateutil.Time(hour, minute, second));
        }
    }
    dateutil.sort(set);
    return set;
};

Iterinfo.prototype.mtimeset = function(hour, minute, second) {
    var set = [], rr = this.rrule;
    for (var j = 0; j < rr.options.bysecond.length; j++) {
        second = rr.options.bysecond[j];
        set.push(new dateutil.Time(hour, minute, second));
    }
    dateutil.sort(set);
    return set;
};

Iterinfo.prototype.stimeset = function(hour, minute, second) {
    return [new dateutil.Time(hour, minute, second)];
};


//=============================================================================
// Results
//=============================================================================

/**
 * This class helps us to emulate python's generators, sorta.
 */
var IterResult = function(method, args) {
    this.init(method, args)
};

IterResult.prototype = {

    init: function(method, args) {
        this.method = method;
        this.args = args;

        this._result = [];

        this.minDate = null;
        this.maxDate = null;

        if (method == 'between') {
            this.maxDate = args.inc
                ? args.before
                : new Date(args.before.getTime() - 1);
            this.minDate = args.inc
                ? args.after
                : new Date(args.after.getTime() + 1);
        } else if (method == 'before') {
            this.maxDate = args.inc ? args.dt : new Date(args.dt.getTime() - 1);
        } else if (method == 'after') {
            this.minDate = args.inc ? args.dt : new Date(args.dt.getTime() + 1);
        }
    },

    /**
     * Possibly adds a date into the result.
     *
     * @param {Date} date - the date isn't necessarly added to the result
     *                      list (if it is too late/too early)
     * @return {Boolean} true if it makes sense to continue the iteration;
     *                   false if we're done.
     */
    accept: function(date) {
        var tooEarly = this.minDate && date < this.minDate,
            tooLate = this.maxDate && date > this.maxDate;

        if (this.method == 'between') {
            if (tooEarly)
                return true;
            if (tooLate)
                return false;
        } else if (this.method == 'before') {
            if (tooLate)
                return false;
        } else if (this.method == 'after') {
            if (tooEarly)
                return true;
            this.add(date);
            return false;
        }

        return this.add(date);

    },

    /**
     *
     * @param {Date} date that is part of the result.
     * @return {Boolean} whether we are interested in more values.
     */
    add: function(date) {
        this._result.push(date);
        return true;
    },

    /**
     * 'before' and 'after' return only one date, whereas 'all'
     * and 'between' an array.
     * @return {Date,Array?}
     */
    getValue: function() {
        switch (this.method) {
            case 'all':
            case 'between':
                return this._result;
            case 'before':
            case 'after':
                return this._result.length
                    ? this._result[this._result.length - 1]
                    : null;
        }
    }

};


/**
 * IterResult subclass that calls a callback function on each add,
 * and stops iterating when the callback returns false.
 */
var CallbackIterResult = function(method, args, iterator) {
    var allowedMethods = ['all', 'between'];
    if (!contains(allowedMethods, method)) {
        throw new Error('Invalid method "' + method
            + '". Only all and between works with iterator.');
    }
    this.add = function(date) {
        if (iterator(date, this._result.length)) {
            this._result.push(date);
            return true;
        }
        return false;

    };

    this.init(method, args);

};
CallbackIterResult.prototype = IterResult.prototype;


//=============================================================================
// Export
//=============================================================================

if (serverSide) {
    module.exports = {
        RRule: RRule
        // rruleset: rruleset
    }
}
if (typeof ender === 'undefined') {
    root['RRule'] = RRule;
    // root['rruleset'] = rruleset;
}

if (typeof define === "function" && define.amd) {
    /*global define:false */
    define("rrule", [], function () {
        return RRule;
    });
}

}(this));

//End Dependencies






var notifier, dialog;
var cal = ics();//Make our new Calendar (globally)
var firstTime = true; //We'll use this to solve an "empty date" problem.
var safetyNet; //Same thing, empty Date saver

function showNotify() {
    var notify;

    if (window.webkitNotifications.checkPermission() == 0) {
        notify = window.webkitNotifications.createNotification(
            "",
            'Notification Test',
            'This is a test of the Chrome Notification System. This is only a test.'
        );
        notify.show();
    } else {
        window.webkitNotifications.requestPermission();
    }
}    

//Takes in the start and end date and repeat frequency, does some ugly formatting
//And churns out a schedule
//Start is the day the class starts, end is the day it ends. EventStart is the time of day it starts
//EventEnd is the time of day the event ends, Weekdays is the days of week the event should occur on
//(An array of integers is expected)
function CreateSchedule(start, end,  eventTime,  eventTimeEnd,  WeekDays, name, location)
{
	//Forcible typecasty garbage to bypass
	//JS's loosely typed shenanigans -- don't judge, Alex -_-
	var start = new Date(start);
	var end = new Date(end);
	var eventTime = new Date(eventTime);
	var eventTimeEnd = new Date(eventTimeEnd);

	var eventStart = new Date(start.setHours(eventTime.getHours(), eventTime.getMinutes()));
	var eventEnd = new Date(start.setHours(eventTimeEnd.getHours(),eventTimeEnd.getMinutes()));
	var newDate = start.setDate(start.getDate() + 1);
	start = new Date(newDate);
		
	 //Hopefully the longest, grossest line of parsey Javascript I will ever produce. --Did you see all the crap I had to write?
	//It converts the event to a properly formatted string
	 var eventStartString = (eventStart.getMonth()+1).toString().concat("/").concat(eventStart.getDate().toString()).concat("/").concat(eventStart.getFullYear().toString()).concat(" ").concat(eventStart.getHours().toString()).concat(":").concat(eventStart.getMinutes().toString());//.concat(" PM"));
	 
	 //There is a discrepancy between indexing in months, hence the + 1
	 var eventEndString = (eventEnd.getMonth()+1).toString().concat("/").concat(eventEnd.getDate().toString()).concat("/").concat(eventEnd.getFullYear().toString()).concat(" ").concat(eventEnd.getHours().toString()).concat(":").concat(eventEnd.getMinutes().toString());

	var rule = {
		freq: "WEEKLY",
		until: new Date(end.setHours(1,0)),
	};
		cal.addEvent(name, "Class",location, new Date(eventStartString) ,new Date(eventEndString), rule, toRRule(WeekDays));
}
	
	//Converts weekdays to RRULE stating byrules
	function toRRule(WeekDays)
	{
		var ret = "";
		var retArr = [];
		//Someone has i as a loop in some global scope such that it
		//Can never be used again without breaking things. WHY?
		//(perhaps in create schedule, which would make it my fault?)
		for(x = 0; x < WeekDays.length; x++)
		 {
			switch(WeekDays[x])
			{   
				case 8:
					continue;
				case 1:
					ret += "MO,";
					retArr.push(RRule.MO);
					break;
				case 2:
					ret += "TU,"
					retArr.push(RRule.TU);
					break;
				case 3:
					ret += "WE,"
					retArr.push(RRule.WE);
					break;
				case 4:
					ret += "TH,"
					retArr.push(RRule.TH);
					break;
				case 5:
					ret += "FR,"
					retArr.push(RRule.FR);
					break;
				case 6://No need to support weekends, but what the hell.
					ret += "SA,"
					retArr.push(RRule.SA);
					break;
				case 7:
					ret += "SU,"
					retArr.push(RRule.SU);
					break;
			}
		  }
			//return retArr;
			return ret.substring(0,ret.length-1); //Remove the trailing comma.  		  
	}
	
	
	//Used for expSched string formatting garbage
	function timeParseHours(time)
	{
		if(time == '  ') //Handle ARRANGED classes.
		{
			return 0;
		}
	
		var hrs = time.split(':');
		var hrs1 = hrs[0];//Grab just the time
		var hrs2 = hrs[1];//Grab the minutes and an A or P
		var pm = hrs2.split(' ');
		var AorP = pm[1];//Grab the A or the P
		if(AorP == 'P')
		{
			if(parseInt(hrs1) < 12) // it's PM and not noon.
			{
				hrs1 = parseInt(hrs1) + 12; //We're doing military time, boy.
			}
		}
		else
		{
				hrs1 = parseInt(hrs1);
		}
		return hrs1;
	}
	
	//See comment above, re: garbage.
	function timeParseMinutes(time)
	{
		if(time == '  ') //Handle ARRANGED classes.
		{
			return 0;
		}
	
		var hrs = time.split(':');
		var hrs2 = hrs[1];//Grab the minutes and an A or P
		var front = hrs2.split(' ');
		var mins = front[0];
		return mins; 
	}
	
	function convertOneDay(day)
	{
		if(day == 'M')
		{
			return 1;
		}
		if(day == 'T')
		{
			return 2;
		}
		if(day == 'W')
		{
			return 3;
		}
		if(day == 'R')
		{
			return 4;
		}
		if(day == 'F')
		{
			return 5;
		}
		return 8; //Invalid, see API for more info.
		
	}
	

//Tests if string contains only spaces
function isEmptyString(obj)
{
	for(var i = 0; i < obj.length; i++)
	{
		if(obj.charAt(i) != ' ')
		{
			return false;
		}
	}
return true;

}

// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

//Some utility code that isn't included in the language.
function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;


    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}
	
	function convertDays(days)
	{
		var ret = new Array();
		ret.push(8);//Actually this should make things easier-- instead of checking "hey, is this a length of one? And if so, adding an 8, we can just start with an 8, and things *should* work. I think. It's been a few months since I wrote/looked at the API. Also, I'm sorry for all of this.
		var tempDays = days.split(' ');
		for(var i =0; i< tempDays.length; i++)
		{
			ret.push(convertOneDay(tempDays[i]));//This should work?
		}
		return ret;
	}
	
	//This is just for hacky demo purposes. This can be deleted. This should be deleted. //Nope now it's necessary again.
	function expSched() { 
	//Note that each class that meets only once a week has been padded with an 8. Why is this?
	//It's because if there is only one element in a list, it is not iterated through. Not sure why this is.
	//It seems to be a bounds issue, but <= does no fix it. So the kludge.
	//But why 8?
	//Days are indexed 0-6. 8 was chosen because it is a clearly invalid option, without being negative.
	//Negative values COULD be confused for an error message and return the wrong thing in a comparison.
	//There should be no instance where a day of 8 makes sense, nor could trigger a false positive.
	

	for(i=0; i<classInfoArr.length; i++)
	{	
		//Sometimes a class has two meetings and they only give a date for the first
		if(firstTime)
		{
			safetyNet = classInfoArr[i].mDates;
			firstTime = false;
		}
		//All classes have the same meeting time, in theory.
		if(isEmptyString(classInfoArr[i].mDates))
		{
			classInfoArr[i].mDates = safetyNet;
		}
		else//This fixed the issue of having the first class be a half semester classes causing a recitation to only appear for half the semester
		{
			safetyNet = classInfoArr[i].mDates;
		}

		//Convert Y/M/D to a date
		var DateArrs = splitDates(classInfoArr[i].mDates);
		var StartDate = new Date(DateArrs[0].year,DateArrs[0].month,DateArrs[0].day);
		var EndDate = new Date(DateArrs[1].year,DateArrs[1].month,DateArrs[1].day);
		
		//Change days from M T R to 1 2 4
		var meetDays = convertDays(classInfoArr[i].mDays);
		
		if(isEmptyString(classInfoArr[i].loc))
		{
			classInfoArr[i].loc = 'TBA';
		}
		
		//Create everything
		CreateSchedule(StartDate, EndDate,new Date(StartDate.setHours(timeParseHours(classInfoArr[i].mTimesS), timeParseMinutes(classInfoArr[i].mTimesS))),new Date(EndDate.setHours(timeParseHours(classInfoArr[i].mTimesE), timeParseMinutes(classInfoArr[i].mTimesE))),meetDays,classInfoArr[i].nome,classInfoArr[i].loc);	
		
	}
	/*
		//Old version for reference
		//Start wtih  Com Sci 311 Lecture
		var StartDate = new Date(2015,07,24);//Same for every class this semester
		var EndDate = new Date(2015,11,18);
		var StartTime =  new Date(StartDate).setHours(12,39);
		var EndTime = new Date(StartDate).setHours(14,0);
		var WeekDays= new Array(2,4);//Tuesday and Thursday
		CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'Com Sci 311', 'Atanassoff 310');
	*/

		//Display a checkmark if we downloaded successfully.
        document.getElementById("wait").style.display = "block";
        setTimeout(function(){document.getElementById("wait").style.display = "none";}, 850);
		cal.download(cal); //ICS format 

		//cal.download(cal,".csv"); //If we want different extensions
		              

	}   

//-------------------------------</Calendar>--------------------------------------

//meetingDate object, will contain the different parts of the meeting date string, such as month, date year
//month - given month, has to be reduced by 1
//day - given day
//year - given year
function meetingDateObj(month, day, year){
		this.month = month;
		this.day = day;
		this.year = year;
}

//decrements the string month by one and updates the year to be in the 21st century
function updMonthYr(obj, month, year){
	var m = parseInt(month);
	var mnt;
	m--;//Necessary to convert from 1-indexed to 0-indexed.
	if (m <= 10) mnt = "0";
	else mnt = "";
	mnt += m.toString();
	
	var yr = "20";
	yr+=year;
	
	obj.month = mnt;
	obj.year = yr;
	
}

//Returns a meeting date string as a readable format for the Calendar
//As the months begin at index 0, the month part has to be reduced by 1 
//date - a meeting date string
function splitDates(date){
	var dates = date.split('-');
	var date1 = dates[0];
	var date2 = dates[1];
	var obj;
	
	var parts1 = date1.split('/');
	var parts2 = date2.split('/');
	
	var objArr = [];
	
	obj = new meetingDateObj("", parts1[1], "");
	updMonthYr(obj, parts1[0], parts1[2]);
	objArr.push(obj);
	
	obj = new meetingDateObj("", parts2[1], "");
	updMonthYr(obj, parts2[0], parts2[2]);
	objArr.push(obj);
	
	return objArr;
}

/*
//Was attempting to send a request to a website to be able to parse 
//the received page. Apparently cross-domain access is illegal with ajax - bummer
function getPage() { //illegal
	$.ajax({url: 'https://www.ratemyprofessors.com/search.jsp?query=LATHROP+Iowa+State+University'}).
		done(function(pageHtml) {
			alert(pageHtml.html());
	});
}
*/


//Calculates the "ideal" div size according to the number of found teachers
//@param number - number of teachers
function getBoxSize(number){
	var mult;
	if (number === 1) mult = 60; //a single entry
	else mult = number*45 + 1; //+1 for the title line
	return mult + 'px';
}

//The css for each rmp entry. There was no need for repeating this code if there was only small changes
//backGColor - background color for the div
//prof - prof's name
//nome - parsed name
function cssEntry(backGColor, prof, nome){
	
		var txtShadow = 'font-size: 1em; text-shadow: 1px 1px 0px rgba(150, 150, 150, 1); font-family:Verdana, Geneva, sans-serif;';
		return '<div style="background-color:' + backGColor + ';    border-radius: 5px;padding-bottom:10px;display:table; width:320px; height: 20px;">\
                <table style=""><tr><td style="padding-left: 30px; padding-top: 10px;width:150px;'+txtShadow+'">'+prof+'</td>\
                <td style="width:150px"><br>\
                <a style = " border: 1px solid black; padding-left: 100px;text-shadow: none; text-decoration: none; color: white; padding: 5px; background-color: #aac628; border-radius: 7px;" href= "http://www.ratemyprofessors.com/search.jsp?query=' + nome + '+Iowa+State+University'+'" target="_blank"> Check my rating!</a>\
                </td></tr></table></div>';		
	
}

//Where the magic happens //Uhh I didn't write this. Flavia, was this you?
$(document).ready(function() {
 var updProfs = []; //updated array with the professor information, will not contain any repeated names
 var nome = []; 
 //$(document).append(bootstrap);
 
 if (url == accessPlus || url == accessPlus1){

 
  updateIDs(); 
  updProfs = remRepeats(profs);
  
  var div = $('<div id = "rmpBox" style = padding-top: 20px;></div>');
  var imgDiv = $('<div style = "margin-left: 170px; ; z-index: 1;  position: absolute;"> <img src="http://www.userlogos.org/files/logos/Karmody/Rate_My_Prof_01.png" alt="RMP" style="width:130px;height:120px"> </div>');

  var hatDiv = $('<div style = "margin-left: 340px; ; z-index: 1; padding-top: 9px; position: absolute;"> <img src="http://findicons.com/files/icons/2677/educons/128/graduation_hat.png" style = "-webkit-transform: rotate(15deg); width: 57px; height: 50px;"> </div>');

  var box = $('<div style = "width:400px; height:' + getBoxSize(updProfs.length) +'; margin-left: 60px; padding-top: 30px;"> </div>');
  var title = $('<div style = "width:320px; height: 23px; border-style: outset;border-color:#A30000; -webkit-border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;border-radius: 5px 5px 5px 5px;background-image: -webkit-linear-gradient(bottom, #FF1111 0%, #9E0101 100%); color: white; font-size: 15px;"> <div style = "padding-left: 5px;  color: white;"></div> </div>');
  
  var expBut = $('<br><div title="Generate an .ics Calendar" style = "float:left; position: absolute; padding: 15px; margin-left: 133px"><button id="exportBut" style = "border-radius: 5px; box-shadow: 1px 1px 1px #888888; padding: 5px;color: #FFF;background-color: #900;font-weight: bold;"><img src="http://rightsfreeradio.com/wp-content/uploads/2013/05/Shopping-Cart-Icon-256-e1368787850653.png" style="width:17px;height:17px; margin-right: 3px;"> Export My Calendar</button></div>');
  element.append(expBut); 
  document.getElementById("exportBut").addEventListener("click", function(){expSched()});
  document.getElementById("exportBut" ).onmouseover = function(){
    this.style.backgroundColor = "#CC0000";
    this.style.cursor = "pointer";
  }
  
  document.getElementById("exportBut" ).onmouseout = function(){
    this.style.backgroundColor = "#900";
  }

  var waitDiv = $('<div id = "wait" style= "display: none; float:left; margin-left: 320px;"><img src="https://order.mediacomcable.com/Content/images/spinner.gif" alt="Wheres My Checkmark?" style="width:25px;height:25px"> </div>');
  element.append(waitDiv);

  element.append("<br><br><br>");
  
  $(element).append(imgDiv);
  element.append("<br> <br>");
  $(div).append(hatDiv);
  $(box).append(title);  
  $(div).append(box);  

   
  for (i = 0; i < updProfs.length; i++){ 
   nome = parseName(updProfs[i]);
   if (!(i%2 == 0)) {
    $(box).append(cssEntry('#E8E8E8', updProfs[i], nome[0]));
   }
   
   else {
    $(box).append(cssEntry('white', updProfs[i], nome[0]));
   }
  } 

  element.append(div);
  element.append('<br><br><div style = "padding-left: 70px;font-size: 0.6em; width:320px;"><b>Note:</b> There is no guarantee that a given professor will have a Rate My Professor page.</div><br><br>');
  
          
  var btn = $('<div> <button id="button" style = "width:2px; height:5px;   background-color:rgba(236, 236, 236, 0.6);  border: none !important;"> </button> </div>'); 
        element.append(btn);
     document.getElementById("button").addEventListener("click", function(){func()});

  function func(){ //^ω^
   if (clicked == false) {
     clicked = true;
     element.append(img);
   }
   else{
    clicked = false;
    $(img).remove();
   }
  }

  getStartEndTime(meetingsT, meetingeT);
  getMeetingDates(startEndDate);
  getLocations(locations);
  createClassInfo(classNames, meetingD, meetingsT, meetingeT, startEndDate, locations);

 }

});
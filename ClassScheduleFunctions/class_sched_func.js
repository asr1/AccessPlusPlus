//Hopefully you're ready for a completely "hacky" plugin - seriously don't judge ヽ（´ー｀）┌

//The main functionality of this part of the Access++ extension is to add the Rate My Professor functionality, but it will also get the needed information
//for the google calendar exportation, such as: class name, beginning and end date, dates, ect... The information will be saved in classInfo objects, which will
//be stored in an array. When a class contains multiple meeting times at different times, such as: Math M,W @ 10:00 and T,R @8:00; independed classInfo objects will 
//be created. ClassInfo1: name: Math, meetingDays: M, W; Meeting Times: 10:00 A, Meeting End Time: 11:00A, startendDate: : 01/15/2014-05/25/2014
//be created. ClassInfo2: name: Math, meetingDays: T, R; Meeting Times: 8:00 A, Meeting End Time: 9:00A, startendDate: : 01/15/2014-05/25/2014

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
	if ($(tr).html().indexOf('&nbsp;') != -1 && containsDW(id)){
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
	//	alert(names[1]);
		var Names = names[1].split('</a>'); //names[1] contains the class name, but it also includes a ton of stuff after it that we do not care about
		classNames.push(Names[0]);
		lastClassName = Names[0];
		//alert(classNames);
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
        'addEvent': function(subject, description, location, begin, stop, rrule) {
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
              }
            }

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

	//Probably the best textbook example for when you should make a function.
	//Takes in the start and end date and repeat frequency, does some ugly formatting
	//And churns out a schedule
	//Start is the day the class starts, end is the day it ends. EventStart is the time of day it starts
	//EventEnd is the time of day the event ends, Weekdays is the days of week the event should occur on
	//(An array of integers is expected)
	function CreateSchedule(start, end,  eventTime,  eventTimeEnd,  WeekDays, name, location) //Got rid  of the subject parameter since this isnt something i can get from A++ page, not sure if its necessary
	{
	
	
		//Forcible typecasty garbage to bypass
		//JS's loosely typed shenanigans -- don't judge, Alex -_-
		var start = new Date(start);
		var end = new Date(end);
		var eventTime = new Date(eventTime);
		var eventTimeEnd = new Date(eventTimeEnd);

	
	    while(start <= end)
		{
		//Now update our counter to tomorrow
	
		  var eventStart = new Date(start.setHours(eventTime.getHours(), eventTime.getMinutes()));
		  var eventEnd = new Date(start.setHours(eventTimeEnd.getHours(),eventTimeEnd.getMinutes()));
		  var newDate = start.setDate(start.getDate() + 1);
	      start = new Date(newDate);
		
		   //Hopefully the longest, grossest line of parsey Javascript I will ever produce. --Did you see all the crap I had to write?
		   //It converts the event to a properly formatted string
		 var eventStartString = (eventStart.getMonth()+1).toString().concat("/").concat(eventStart.getDate().toString()).concat("/").concat(eventStart.getFullYear().toString()).concat(" ").concat(eventStart.getHours().toString()).concat(":").concat(eventStart.getMinutes().toString());//.concat(" PM"));
		 
		 //There is a discrepancy between indexing in months, hence the + 1
		 var eventEndString = (eventEnd.getMonth()+1).toString().concat("/").concat(eventEnd.getDate().toString()).concat("/").concat(eventEnd.getFullYear().toString()).concat(" ").concat(eventEnd.getHours().toString()).concat(":").concat(eventEnd.getMinutes().toString());//.concat(" PM"));
	

				var rule = {
			  freq: "WEEKLY",
			  until: new Date(end.setHours(1,0))
			};
			
			
			//Check to see if it's on the right day of the week.
			 for(x = 0; x < WeekDays.length; x++)
			 {
				if(eventStart.getDay().toString() == WeekDays[x])
				{   
					cal.addEvent(name, "Class",location, new Date(eventStartString) ,new Date(eventEndString), rule);
				}
			  }
		}
	}
	
	
	//Used for expSched string formatting garbage
	function timeParseHours(time)
	{
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
		//NOTE that this breaks if our first class is only half a semester long and
		//we have a class without a date. Ooops, sorry.
		if(isEmptyString(classInfoArr[i].mDates))
		{
			classInfoArr[i].mDates = safetyNet;
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
		
		//DEBUG-- can be removed
		// alert("start: "+StartDate);
		// alert("end: "+EndDate);
		// alert("Start Time: " + new Date(StartDate.setHours(timeParseHours(classInfoArr[i].mTimesS), timeParseMinutes(classInfoArr[i].mTimesS))));
		// alert("end Time : " + new Date(EndDate.setHours(timeParseHours(classInfoArr[i].mTimesE), timeParseMinutes(classInfoArr[i].mTimesE))))
		
		
		//Create everything
		CreateSchedule(StartDate, EndDate,new Date(StartDate.setHours(timeParseHours(classInfoArr[i].mTimesS), timeParseMinutes(classInfoArr[i].mTimesS))),new Date(EndDate.setHours(timeParseHours(classInfoArr[i].mTimesE), timeParseMinutes(classInfoArr[i].mTimesE))),meetDays,classInfoArr[i].nome,classInfoArr[i].loc);
	
	

		
	}//Note:: MIGHT be an issue with classes that only meet once (we'll
	//have to check && pad with an 8, per the API that Past-Alex wrote during the hackathon. //Think we solved this.
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
  //checkValues(classInfoArr, true);
  //alert(classInfoArr[3].mDates);
 }

});
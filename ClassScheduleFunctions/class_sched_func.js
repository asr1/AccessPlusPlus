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

//This is a library we're using. Or possibly jquery. I'm not sure, the hackathon was 4 months ago. Just...keep scrolling or //something. //It's ics.js
var saveAs=saveAs||typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(e){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=e.URL||e.webkitURL||e,i=t.createElementNS("http://www.w3.org/1999/xhtml","a"),s=!e.externalHost&&"download"in i,o=function(n){var r=t.createEvent("MouseEvents");r.initMouseEvent("click",true,false,e,0,0,0,0,0,false,false,false,false,0,null);n.dispatchEvent(r)},u=e.webkitRequestFileSystem,a=e.requestFileSystem||u||e.mozRequestFileSystem,f=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},l="application/octet-stream",c=0,h=[],p=function(){var e=h.length;while(e--){var t=h[e];if(typeof t==="string"){r.revokeObjectURL(t)}else{t.remove()}}h.length=0},d=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var i=e["on"+t[r]];if(typeof i==="function"){try{i.call(e,n||e)}catch(s){f(s)}}}},v=function(r,o){var f=this,p=r.type,v=false,m,g,y=function(){var e=n().createObjectURL(r);h.push(e);return e},b=function(){d(f,"writestart progress write writeend".split(" "))},w=function(){if(v||!m){m=y(r)}if(g){g.location.href=m}else{window.open(m,"_blank")}f.readyState=f.DONE;b()},E=function(e){return function(){if(f.readyState!==f.DONE){return e.apply(this,arguments)}}},S={create:true,exclusive:false},x;f.readyState=f.INIT;if(!o){o="download"}if(s){m=y(r);t=e.document;i=t.createElementNS("http://www.w3.org/1999/xhtml","a");i.href=m;i.download=o;var T=t.createEvent("MouseEvents");T.initMouseEvent("click",true,false,e,0,0,0,0,0,false,false,false,false,0,null);i.dispatchEvent(T);f.readyState=f.DONE;b();return}if(e.chrome&&p&&p!==l){x=r.slice||r.webkitSlice;r=x.call(r,0,r.size,l);v=true}if(u&&o!=="download"){o+=".download"}if(p===l||u){g=e}if(!a){w();return}c+=r.size;a(e.TEMPORARY,c,E(function(e){e.root.getDirectory("saved",S,E(function(e){var t=function(){e.getFile(o,S,E(function(e){e.createWriter(E(function(t){t.onwriteend=function(t){g.location.href=e.toURL();h.push(e);f.readyState=f.DONE;d(f,"writeend",t)};t.onerror=function(){var e=t.error;if(e.code!==e.ABORT_ERR){w()}};"writestart progress write abort".split(" ").forEach(function(e){t["on"+e]=f["on"+e]});t.write(r);f.abort=function(){t.abort();f.readyState=f.DONE};f.readyState=f.WRITING}),w)}),w)};e.getFile(o,{create:false},E(function(e){e.remove();t()}),E(function(e){if(e.code===e.NOT_FOUND_ERR){t()}else{w()}}))}),w)}),w)},m=v.prototype,g=function(e,t){return new v(e,t)};m.abort=function(){var e=this;e.readyState=e.DONE;d(e,"abort")};m.readyState=m.INIT=0;m.WRITING=1;m.DONE=2;m.error=m.onwritestart=m.onprogress=m.onwrite=m.onabort=m.onerror=m.onwriteend=null;e.addEventListener("unload",p,false);g.unload=function(){p();e.removeEventListener("unload",p,false)};return g}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined")module.exports=saveAs;if(!(typeof Blob==="function"||typeof Blob==="object")||typeof URL==="undefined")if((typeof Blob==="function"||typeof Blob==="object")&&typeof webkitURL!=="undefined")self.URL=webkitURL;else var Blob=function(e){"use strict";var t=e.BlobBuilder||e.WebKitBlobBuilder||e.MozBlobBuilder||e.MSBlobBuilder||function(e){var t=function(e){return Object.prototype.toString.call(e).match(/^\[object\s(.*)\]$/)[1]},n=function(){this.data=[]},r=function(t,n,r){this.data=t;this.size=t.length;this.type=n;this.encoding=r},i=n.prototype,s=r.prototype,o=e.FileReaderSync,u=function(e){this.code=this[this.name=e]},a=("NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "+"NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR").split(" "),f=a.length,l=e.URL||e.webkitURL||e,c=l.createObjectURL,h=l.revokeObjectURL,p=l,d=e.btoa,v=e.atob,m=e.ArrayBuffer,g=e.Uint8Array;r.fake=s.fake=true;while(f--){u.prototype[a[f]]=f+1}if(!l.createObjectURL){p=e.URL={}}p.createObjectURL=function(e){var t=e.type,n;if(t===null){t="application/octet-stream"}if(e instanceof r){n="data:"+t;if(e.encoding==="base64"){return n+";base64,"+e.data}else if(e.encoding==="URI"){return n+","+decodeURIComponent(e.data)}if(d){return n+";base64,"+d(e.data)}else{return n+","+encodeURIComponent(e.data)}}else if(c){return c.call(l,e)}};p.revokeObjectURL=function(e){if(e.substring(0,5)!=="data:"&&h){h.call(l,e)}};i.append=function(e){var n=this.data;if(g&&(e instanceof m||e instanceof g)){var i="",s=new g(e),a=0,f=s.length;for(;a<f;a++){i+=String.fromCharCode(s[a])}n.push(i)}else if(t(e)==="Blob"||t(e)==="File"){if(o){var l=new o;n.push(l.readAsBinaryString(e))}else{throw new u("NOT_READABLE_ERR")}}else if(e instanceof r){if(e.encoding==="base64"&&v){n.push(v(e.data))}else if(e.encoding==="URI"){n.push(decodeURIComponent(e.data))}else if(e.encoding==="raw"){n.push(e.data)}}else{if(typeof e!=="string"){e+=""}n.push(unescape(encodeURIComponent(e)))}};i.getBlob=function(e){if(!arguments.length){e=null}return new r(this.data.join(""),e,"raw")};i.toString=function(){return"[object BlobBuilder]"};s.slice=function(e,t,n){var i=arguments.length;if(i<3){n=null}return new r(this.data.slice(e,i>1?t:this.data.length),n,this.encoding)};s.toString=function(){return"[object Blob]"};return n}(e);return function(n,r){var i=r?r.type||"":"";var s=new t;if(n){for(var o=0,u=n.length;o<u;o++){s.append(n[o])}}return s.getBlob(i)}}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content||this);var ics=function(){"use strict";if(navigator.userAgent.indexOf("MSIE")>-1&&navigator.userAgent.indexOf("MSIE 10")==-1){console.log("Unsupported Browser");return}var e=navigator.appVersion.indexOf("Win")!==-1?"\r\n":"\n";var t=[];var n=["BEGIN:VCALENDAR","VERSION:2.0"].join(e);var r=e+"END:VCALENDAR";return{events:function(){return t},calendar:function(){return n+e+t.join(e)+r},addEvent:function(n,r,i,s,o){if(typeof n==="undefined"||typeof r==="undefined"||typeof i==="undefined"||typeof s==="undefined"||typeof o==="undefined"){return false}var u=new Date(s);var a=new Date(o);var f=("0000"+u.getFullYear().toString()).slice(-4);var l=("00"+(u.getMonth()+1).toString()).slice(-2);var c=("00"+u.getDate().toString()).slice(-2);var h=("00"+u.getHours().toString()).slice(-2);var p=("00"+u.getMinutes().toString()).slice(-2);var d=("00"+u.getMinutes().toString()).slice(-2);var v=("0000"+a.getFullYear().toString()).slice(-4);var m=("00"+(a.getMonth()+1).toString()).slice(-2);var g=("00"+a.getDate().toString()).slice(-2);var y=("00"+a.getHours().toString()).slice(-2);var b=("00"+a.getMinutes().toString()).slice(-2);var w=("00"+a.getMinutes().toString()).slice(-2);var E="";var S="";if(p+d+b+w!=0){E="T"+h+p+d;S="T"+y+b+w}var x=f+l+c+E;var T=v+m+g+S;var N=["BEGIN:VEVENT","CLASS:PUBLIC","DESCRIPTION:"+r,"DTSTART;VALUE=DATE-TIME:"+x,"DTEND;VALUE=DATE-TIME:"+T,"LOCATION:"+i,"SUMMARY;LANGUAGE=en-us:"+n,"TRANSP:TRANSPARENT","END:VEVENT"].join(e);t.push(N);return N},download:function(i,s){if(t.length<1){return false}s=typeof s!=="undefined"?s:".ics";i=typeof i!=="undefined"?i:"calendar";var o=n+e+t.join(e)+r;var u;if(navigator.userAgent.indexOf("MSIE 10")===-1){u=new Blob([o])}else{var a=new BlobBuilder;a.append(o);u=a.getBlob("text/x-vCalendar;charset="+document.characterSet)}saveAs(u,i+s);return o}}}

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
	

			//Check to see if it's on the right day of the week.
			 for(x = 0; x < WeekDays.length; x++)
			 {
				if(eventStart.getDay().toString() == WeekDays[x])
				{   
					cal.addEvent(name, "Class",location, new Date(eventStartString) ,new Date(eventEndString));
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
		if(mins > 30)
		{
			mins--;//*sigh*. It's an API thing. For some reason, if we don't end in 00, we get off by one errors in the minutes.--40 becomes 41. So we decrement. Not sure where the overlap starts, but it's after 20 and before 40. This seems to fix it.

		}
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
	
	

		//Display a checkmark if we downloaded successfully.
        document.getElementById("checkId").style.display = "block";
        setTimeout(function(){document.getElementById("checkId").style.display = "none";}, 1500);
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
		return '<tr> <td> <div style = "background-color:' + backGColor + 'display:table; padding-left: 40px; color:black;'+ txtShadow+ '">' + '<br>' + prof + ' </td></div><td> <br><a style = " border: 1px solid black;  padding-left: 100px;text-shadow: none; text-decoration: none; color: white;' + txtShadow + 'padding: 5px; background-color: #aac628; border-radius: 7px; margin: 5px;" href= "http://www.ratemyprofessors.com/search.jsp?query=' + nome + '+Iowa+State+University'+'" target="_blank"> Check my rating!</a> <br><br> </td></tr>';		
	
}

//Where the magic happens //Uhh I didn't write this. Flavia, was this you?
$(document).ready(function() {
	var updProfs = []; //updated array with the professor information, will not contain any repeated names
	var nome = [];	
	//$(document).append(bootstrap);
	
	if (url == accessPlus || url == accessPlus1){

 
		updateIDs(); 
		updProfs = remRepeats(profs);
		
		var div = $('<div style = padding-top: 20px;></div>');
		var imgDiv = $('<div style = "margin-left: 170px; ; z-index: 1;  position: absolute;"> <img src="http://www.userlogos.org/files/logos/Karmody/Rate_My_Prof_01.png" alt="RMP" style="width:130px;height:120px"> </div>');

		var hatDiv = $('<div style = "margin-left: 345px; ; z-index: 1; padding-top: 9px; position: absolute;"> <img src="http://www.pyramidcg.com/blog/wp-content/uploads/2013/01/hat1.png" style = "-webkit-transform: rotate(15deg); width: 60px; height: 40px;"> </div>');

		var box = $('<div style = "width:400px; height:' + getBoxSize(updProfs.length) +'; margin-left: 60px; padding-top: 30px;"> </div>');
		var title = $('<div style = "width:320px; height: 23px; border-style: outset;border-color:#A30000; -webkit-border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;border-radius: 5px 5px 5px 5px;background-image: -webkit-linear-gradient(bottom, #FF1111 0%, #9E0101 100%); color: white; font-size: 15px;"> <div style = "padding-left: 5px;  color: white;"></div> </div>');
		

        
        var checkDiv = $('<div id = "checkId" style= "display: none; float:left; margin-left: 320px; top: 5px;"><img src="http://www.clker.com/cliparts/e/3/9/7/1245686792938124914raemi_Check_mark.svg.hi.png" alt="Wheres My Checkmark?" style="width:25px;height:25px"> </div>');
        element.append(checkDiv);
        
		var expBut = $('<div style = "float:left; position: absolute; padding-top: 15px; margin-left: 150px"><button id="expBtn" style = "border-style: outset; border-color:#A30000;; -webkit-border-radius: 5px;  color: #FFF; background-color: #900; font-weight: bold;"><img src="http://rightsfreeradio.com/wp-content/uploads/2013/05/Shopping-Cart-Icon-256-e1368787850653.png" style="width:15px;height:15px"> Export My Calendar</button></div>');
        element.append(expBut);	
		document.getElementById("expBtn").addEventListener("click", function(){expSched()});
        

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
		element.append("<br><br><br><br>");
		
        		
		var btn = $('<div> <button id="button" style = "width:2px; height:5px;   background-color:rgba(236, 236, 236, 0.9);  border: none !important;"> </button> </div>'); 
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

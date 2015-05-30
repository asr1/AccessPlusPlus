//Hopefully you're ready for a completely "hacky" plugin - seriously don't judge ヽ（´ー｀）┌
//Ignore the random portuguese var names, I ran out of names in english

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
img.src = "https://imgflip.com/s/meme/Jackie-Chan-WTF.jpg"; //I regret nothing

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


//ClassInfo object, each object will contain all needed information for the calendar exportation
//nome - class name
//mDays - meeting days, all days of the week where the class meets
//mTimes - meeting times
//sDate - start date
//eDate - end date 
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

//AccessPlus sucks, so to make our lives easier, lets give each table an id, and use these to search for the required info
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

//This is a library we're using. Or possibly jquery. I'm not sure, the hackathon was 4 months ago. Just...keep scrolling or //something.
var saveAs=saveAs||typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(e){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=e.URL||e.webkitURL||e,i=t.createElementNS("http://www.w3.org/1999/xhtml","a"),s=!e.externalHost&&"download"in i,o=function(n){var r=t.createEvent("MouseEvents");r.initMouseEvent("click",true,false,e,0,0,0,0,0,false,false,false,false,0,null);n.dispatchEvent(r)},u=e.webkitRequestFileSystem,a=e.requestFileSystem||u||e.mozRequestFileSystem,f=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},l="application/octet-stream",c=0,h=[],p=function(){var e=h.length;while(e--){var t=h[e];if(typeof t==="string"){r.revokeObjectURL(t)}else{t.remove()}}h.length=0},d=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var i=e["on"+t[r]];if(typeof i==="function"){try{i.call(e,n||e)}catch(s){f(s)}}}},v=function(r,o){var f=this,p=r.type,v=false,m,g,y=function(){var e=n().createObjectURL(r);h.push(e);return e},b=function(){d(f,"writestart progress write writeend".split(" "))},w=function(){if(v||!m){m=y(r)}if(g){g.location.href=m}else{window.open(m,"_blank")}f.readyState=f.DONE;b()},E=function(e){return function(){if(f.readyState!==f.DONE){return e.apply(this,arguments)}}},S={create:true,exclusive:false},x;f.readyState=f.INIT;if(!o){o="download"}if(s){m=y(r);t=e.document;i=t.createElementNS("http://www.w3.org/1999/xhtml","a");i.href=m;i.download=o;var T=t.createEvent("MouseEvents");T.initMouseEvent("click",true,false,e,0,0,0,0,0,false,false,false,false,0,null);i.dispatchEvent(T);f.readyState=f.DONE;b();return}if(e.chrome&&p&&p!==l){x=r.slice||r.webkitSlice;r=x.call(r,0,r.size,l);v=true}if(u&&o!=="download"){o+=".download"}if(p===l||u){g=e}if(!a){w();return}c+=r.size;a(e.TEMPORARY,c,E(function(e){e.root.getDirectory("saved",S,E(function(e){var t=function(){e.getFile(o,S,E(function(e){e.createWriter(E(function(t){t.onwriteend=function(t){g.location.href=e.toURL();h.push(e);f.readyState=f.DONE;d(f,"writeend",t)};t.onerror=function(){var e=t.error;if(e.code!==e.ABORT_ERR){w()}};"writestart progress write abort".split(" ").forEach(function(e){t["on"+e]=f["on"+e]});t.write(r);f.abort=function(){t.abort();f.readyState=f.DONE};f.readyState=f.WRITING}),w)}),w)};e.getFile(o,{create:false},E(function(e){e.remove();t()}),E(function(e){if(e.code===e.NOT_FOUND_ERR){t()}else{w()}}))}),w)}),w)},m=v.prototype,g=function(e,t){return new v(e,t)};m.abort=function(){var e=this;e.readyState=e.DONE;d(e,"abort")};m.readyState=m.INIT=0;m.WRITING=1;m.DONE=2;m.error=m.onwritestart=m.onprogress=m.onwrite=m.onabort=m.onerror=m.onwriteend=null;e.addEventListener("unload",p,false);g.unload=function(){p();e.removeEventListener("unload",p,false)};return g}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined")module.exports=saveAs;if(!(typeof Blob==="function"||typeof Blob==="object")||typeof URL==="undefined")if((typeof Blob==="function"||typeof Blob==="object")&&typeof webkitURL!=="undefined")self.URL=webkitURL;else var Blob=function(e){"use strict";var t=e.BlobBuilder||e.WebKitBlobBuilder||e.MozBlobBuilder||e.MSBlobBuilder||function(e){var t=function(e){return Object.prototype.toString.call(e).match(/^\[object\s(.*)\]$/)[1]},n=function(){this.data=[]},r=function(t,n,r){this.data=t;this.size=t.length;this.type=n;this.encoding=r},i=n.prototype,s=r.prototype,o=e.FileReaderSync,u=function(e){this.code=this[this.name=e]},a=("NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "+"NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR").split(" "),f=a.length,l=e.URL||e.webkitURL||e,c=l.createObjectURL,h=l.revokeObjectURL,p=l,d=e.btoa,v=e.atob,m=e.ArrayBuffer,g=e.Uint8Array;r.fake=s.fake=true;while(f--){u.prototype[a[f]]=f+1}if(!l.createObjectURL){p=e.URL={}}p.createObjectURL=function(e){var t=e.type,n;if(t===null){t="application/octet-stream"}if(e instanceof r){n="data:"+t;if(e.encoding==="base64"){return n+";base64,"+e.data}else if(e.encoding==="URI"){return n+","+decodeURIComponent(e.data)}if(d){return n+";base64,"+d(e.data)}else{return n+","+encodeURIComponent(e.data)}}else if(c){return c.call(l,e)}};p.revokeObjectURL=function(e){if(e.substring(0,5)!=="data:"&&h){h.call(l,e)}};i.append=function(e){var n=this.data;if(g&&(e instanceof m||e instanceof g)){var i="",s=new g(e),a=0,f=s.length;for(;a<f;a++){i+=String.fromCharCode(s[a])}n.push(i)}else if(t(e)==="Blob"||t(e)==="File"){if(o){var l=new o;n.push(l.readAsBinaryString(e))}else{throw new u("NOT_READABLE_ERR")}}else if(e instanceof r){if(e.encoding==="base64"&&v){n.push(v(e.data))}else if(e.encoding==="URI"){n.push(decodeURIComponent(e.data))}else if(e.encoding==="raw"){n.push(e.data)}}else{if(typeof e!=="string"){e+=""}n.push(unescape(encodeURIComponent(e)))}};i.getBlob=function(e){if(!arguments.length){e=null}return new r(this.data.join(""),e,"raw")};i.toString=function(){return"[object BlobBuilder]"};s.slice=function(e,t,n){var i=arguments.length;if(i<3){n=null}return new r(this.data.slice(e,i>1?t:this.data.length),n,this.encoding)};s.toString=function(){return"[object Blob]"};return n}(e);return function(n,r){var i=r?r.type||"":"";var s=new t;if(n){for(var o=0,u=n.length;o<u;o++){s.append(n[o])}}return s.getBlob(i)}}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content||this);var ics=function(){"use strict";if(navigator.userAgent.indexOf("MSIE")>-1&&navigator.userAgent.indexOf("MSIE 10")==-1){console.log("Unsupported Browser");return}var e=navigator.appVersion.indexOf("Win")!==-1?"\r\n":"\n";var t=[];var n=["BEGIN:VCALENDAR","VERSION:2.0"].join(e);var r=e+"END:VCALENDAR";return{events:function(){return t},calendar:function(){return n+e+t.join(e)+r},addEvent:function(n,r,i,s,o){if(typeof n==="undefined"||typeof r==="undefined"||typeof i==="undefined"||typeof s==="undefined"||typeof o==="undefined"){return false}var u=new Date(s);var a=new Date(o);var f=("0000"+u.getFullYear().toString()).slice(-4);var l=("00"+(u.getMonth()+1).toString()).slice(-2);var c=("00"+u.getDate().toString()).slice(-2);var h=("00"+u.getHours().toString()).slice(-2);var p=("00"+u.getMinutes().toString()).slice(-2);var d=("00"+u.getMinutes().toString()).slice(-2);var v=("0000"+a.getFullYear().toString()).slice(-4);var m=("00"+(a.getMonth()+1).toString()).slice(-2);var g=("00"+a.getDate().toString()).slice(-2);var y=("00"+a.getHours().toString()).slice(-2);var b=("00"+a.getMinutes().toString()).slice(-2);var w=("00"+a.getMinutes().toString()).slice(-2);var E="";var S="";if(p+d+b+w!=0){E="T"+h+p+d;S="T"+y+b+w}var x=f+l+c+E;var T=v+m+g+S;var N=["BEGIN:VEVENT","CLASS:PUBLIC","DESCRIPTION:"+r,"DTSTART;VALUE=DATE:"+x,"DTEND;VALUE=DATE:"+T,"LOCATION:"+i,"SUMMARY;LANGUAGE=en-us:"+n,"TRANSP:TRANSPARENT","END:VEVENT"].join(e);t.push(N);return N},download:function(i,s){if(t.length<1){return false}s=typeof s!=="undefined"?s:".ics";i=typeof i!=="undefined"?i:"calendar";var o=n+e+t.join(e)+r;var u;if(navigator.userAgent.indexOf("MSIE 10")===-1){u=new Blob([o])}else{var a=new BlobBuilder;a.append(o);u=a.getBlob("text/x-vCalendar;charset="+document.characterSet)}saveAs(u,i+s);return o}}}

var notifier, dialog;
var cal = ics();//Make our new Calendar (globally)

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
		 var eventStartString = (eventStart.getMonth()+1).toString().concat("/").concat(eventStart.getDate().toString()).concat("/").concat(eventStart.getFullYear().toString()).concat(" ").concat(eventStart.getHours().toString()).concat(":").concat(eventStart.getMinutes().toString());//.concat(" PM"));
		 
		 //There is a discrepancy between indexing in months, hence the + 1
		 var eventEndString = (eventEnd.getMonth()+1).toString().concat("/").concat(eventEnd.getDate().toString()).concat("/").concat(eventEnd.getFullYear().toString()).concat(" ").concat(eventEnd.getHours().toString()).concat(":").concat(eventEnd.getMinutes().toString());//.concat(" PM"));
	
	
			 for(x = 0; x < WeekDays.length; x++)
			 {
				if(eventStart.getDay().toString() == WeekDays[x])
				{   
					cal.addEvent(name, location, new Date(eventStartString) ,new Date(eventEndString));
				}
			  }
		}
	}
	
	//This is just for hacky demo purposes. This can be deleted. This should be deleted.
	function expSched() { 
	//Note that each class that meets only once a week has been padded with an 8. Why is this?
	//It's because if there is only one element in a list, it is not iterated through. Not sure why this is.
	//It seems to be a bounds issue, but <= does no fix it. So the kludge.
	//But why 8?
	//Days are indexed 0-6. 8 was chosen because it is a clearly invalid option, without being negative.
	//Negative values COULD be confused for an error message and return the wrong thing in a comparison.
	//There should be no instance where a day of 8 makes sense, nor could trigger a false positive.
	
	alert("hit");
	//Uhhh just guessing here, I don't know javascript
	for(i=0; i<classInfoArr.length; i++)
	{//Okay so we actually need both start and end time
		CreateSchedule(classInfoArr[i].sDate, classInfoArr[i].eDate,classInfoArr[i].mTimesS,classInfoArr[i].mTimesE,classInfoArr[i].mDays,classInfoArr[i].nome,classInfoArr[i].loc);//Flavia tell me if this is the right way to access?
	}//Note::MIght be an issue with off by one issue on dates and MIGHT be an issue with classes that only meet once (we'll
	//have to check && pad with an 8, per the API that Past-Alex wrote during the hackathon.
	
		//Start wtih  Com Sci 311 Lecture
		var StartDate = new Date(2015,07,24);//Same for every class this semester
		var EndDate = new Date(2015,11,18);
		var StartTime =  new Date(StartDate).setHours(12,39);
		var EndTime = new Date(StartDate).setHours(14,0);
		var WeekDays= new Array(2,4);//Tuesday and Thursday
		CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'Com Sci 311', 'Atanassoff 310');
		
		//Then Com Sci 311 recitation
		StartTime = new Date(StartDate.setHours(14,10));
		EndTime = new Date(StartDate.setHours(15,00));
		WeekDays = new Array(4,8);
		CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'Com Sci 311', 'Carver 129');
	
		//Now Com Sci 336
		StartTime = new Date(StartDate.setHours(11,00));
		EndTime = new Date(StartDate.setHours(12,20));
		WeekDays = new Array(2,4);
		CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'Com Sci 336', 'Durham 171');
	
		//Now Cpre 491
		StartTime = new Date(StartDate.setHours(14,10));
		EndTime = new Date(StartDate.setHours(16,00));
		WeekDays = new Array(2,8);
		CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'CPRE 491', 'Coover 2253');
	
		//Cpre 494
		StartTime = new Date(StartDate.setHours(15,10));
		EndTime = new Date(StartDate.setHours(16,00));
		WeekDays = new Array(3,8);
		CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'CPRE 494', 'Physics 3');
	
		//EE 230 Lecture
		StartTime = new Date(StartDate.setHours(08,0));
		EndTime = new Date(StartDate.setHours(08,50));
		WeekDays = new Array(1,3,5);
		CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'EE 230', 'Hoover 1213');
	
		//EE 230 Lab
		StartTime = new Date(StartDate.setHours(11,00));
		EndTime = new Date(StartDate.setHours(13,50));
		WeekDays = new Array(3,8);
		CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'EE 230 Lab', 'Coover 2250');
		
		cal.download(cal); 
		
	}  

//-------------------------------</Calendar>--------------------------------------


//Was attempting to send a request to a website to be able to parse 
//the received page. Apparently cross-domain access is illegal with ajax - bummer
function getPage() { //illegal
	$.ajax({url: 'https://www.ratemyprofessors.com/search.jsp?query=LATHROP+Iowa+State+University'}).
		done(function(pageHtml) {
			alert(pageHtml.html());
	});
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
	
		var txtShadow = 'font-size: 105%; text-shadow:1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 1px 0 #000, 1px 0px 0 #000, 0px -1px 0 #000, -1px 0px 0 #000, 4px 4px 3px #000; font-family:Verdana, Geneva, sans-serif;';
		return '<tr> <td> <div style = "display:table; padding-left: 40px;margin-left: 0px; color:#b5d333;'+ txtShadow+ '">' + '<br>' + prof + ' </td> <td> <br><a style = "padding-left: 100px;text-shadow: none; text-decoration: none; color: white;' + txtShadow + '" href= "http://www.ratemyprofessors.com/search.jsp?query=' + nome + '+Iowa+State+University'+'"> Check me out!</a> <br><br> </td></div></tr>';		
	
}

//Where the magic happens //Uhh I didn't write this. Flavia, was this you?
$(document).ready(function() {
	var updProfs = []; //updated array with the professor information, will not contain any repeated names
	var nome = [];	
	//$(document).append(bootstrap);
	
	if (url == accessPlus || url == accessPlus1){

		updateIDs(); 
		updProfs = remRepeats(profs);
		
		var div = $('<div style = padding-top: 10px;></div>');
		var imgDiv = $('<div style = "margin-left: 150px; ; z-index: 1; padding-top: 5px; position: absolute;"> <img src="http://miietl.mcmaster.ca/site/wp-content/uploads/2014/11/RateMyProfessors.com_Logo.jpg" alt="RMP" style="width:100px;height:50px"> </div>');

		var box = $('<div style = "width:400px; height:' + getBoxSize(updProfs.length) +'; margin-left: 5px; padding-top: 30px;"> </div>');
		var title = $('<div style = "width:400px; height: 23px; -webkit-border-radius: 5px 5px 5px 5px;-moz-border-radius: 5px 5px 5px 5px;border-radius: 5px 5px 5px 5px;background-image: -webkit-linear-gradient(bottom, #FF1111 0%, #9E0101 100%); color: white; font-size: 15px;"> <div style = "padding-left: 5px;  color: white;"></div> </div>');
		
		
		var btn = document.createElement("BUTTON"); 
		btn.onclick=function(){ //^ω^
			if (clicked == false) {
			 	clicked = true;
			 	element.append(img);
			}
			else{
				clicked = false;
				$(img).remove();
			}
		}
		element.append(btn);
		
		var expBut = $('<div style = "margin-left: 120px"><br><br><br><br> <button style = "-webkit-border-radius: 5px;  color: #FFF; background-color: #900; font-weight: bold;"id="myBtn" onclick="expSched()">Export My Calendar</button></div>');
		element.append(expBut);
		element.append("<br>");		
		
		$(div).append(imgDiv);
		$(box).append(title);		
		$(div).append(box);		
		$(div).append(expBut);	
			
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
		element.append("<br><br>");
		
		getStartEndTime(meetingsT, meetingeT);
		getMeetingDates(startEndDate);
		getLocations(locations);
		createClassInfo(classNames, meetingD, meetingsT, meetingeT, startEndDate, locations);
		//checkValues(classInfoArr, true);
		//alert(classInfoArr[3].mDates);
	}
	
	
	//Alexandro, all the stuff you need (i hope) are in the classInfoArr -> className, meeting days, meeting time start, meeting time end, start/end date, and location
	//you can access them by using basic OOP like classInfoArr[0].loc to get the location for that specific class object
	//you can look at the createClassInfo function - at the very top- for more info
	//you'll probably need to do some string manipulation when creating your calendar- nothing difficult - 
	//your calendar creatiion is kinda weird and im not too certain about some parameters + I dont want to look at this for a while so ill leave the rest of the calendar for you ;D
	//anyways it should be straight forward everything you need is in that array 
}); 

/*! ics.js March 11, 2014 */
//Forcibly include this library.
var saveAs=saveAs||typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(e){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=e.URL||e.webkitURL||e,i=t.createElementNS("http://www.w3.org/1999/xhtml","a"),s=!e.externalHost&&"download"in i,o=function(n){var r=t.createEvent("MouseEvents");r.initMouseEvent("click",true,false,e,0,0,0,0,0,false,false,false,false,0,null);n.dispatchEvent(r)},u=e.webkitRequestFileSystem,a=e.requestFileSystem||u||e.mozRequestFileSystem,f=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},l="application/octet-stream",c=0,h=[],p=function(){var e=h.length;while(e--){var t=h[e];if(typeof t==="string"){r.revokeObjectURL(t)}else{t.remove()}}h.length=0},d=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var i=e["on"+t[r]];if(typeof i==="function"){try{i.call(e,n||e)}catch(s){f(s)}}}},v=function(r,o){var f=this,p=r.type,v=false,m,g,y=function(){var e=n().createObjectURL(r);h.push(e);return e},b=function(){d(f,"writestart progress write writeend".split(" "))},w=function(){if(v||!m){m=y(r)}if(g){g.location.href=m}else{window.open(m,"_blank")}f.readyState=f.DONE;b()},E=function(e){return function(){if(f.readyState!==f.DONE){return e.apply(this,arguments)}}},S={create:true,exclusive:false},x;f.readyState=f.INIT;if(!o){o="download"}if(s){m=y(r);t=e.document;i=t.createElementNS("http://www.w3.org/1999/xhtml","a");i.href=m;i.download=o;var T=t.createEvent("MouseEvents");T.initMouseEvent("click",true,false,e,0,0,0,0,0,false,false,false,false,0,null);i.dispatchEvent(T);f.readyState=f.DONE;b();return}if(e.chrome&&p&&p!==l){x=r.slice||r.webkitSlice;r=x.call(r,0,r.size,l);v=true}if(u&&o!=="download"){o+=".download"}if(p===l||u){g=e}if(!a){w();return}c+=r.size;a(e.TEMPORARY,c,E(function(e){e.root.getDirectory("saved",S,E(function(e){var t=function(){e.getFile(o,S,E(function(e){e.createWriter(E(function(t){t.onwriteend=function(t){g.location.href=e.toURL();h.push(e);f.readyState=f.DONE;d(f,"writeend",t)};t.onerror=function(){var e=t.error;if(e.code!==e.ABORT_ERR){w()}};"writestart progress write abort".split(" ").forEach(function(e){t["on"+e]=f["on"+e]});t.write(r);f.abort=function(){t.abort();f.readyState=f.DONE};f.readyState=f.WRITING}),w)}),w)};e.getFile(o,{create:false},E(function(e){e.remove();t()}),E(function(e){if(e.code===e.NOT_FOUND_ERR){t()}else{w()}}))}),w)}),w)},m=v.prototype,g=function(e,t){return new v(e,t)};m.abort=function(){var e=this;e.readyState=e.DONE;d(e,"abort")};m.readyState=m.INIT=0;m.WRITING=1;m.DONE=2;m.error=m.onwritestart=m.onprogress=m.onwrite=m.onabort=m.onerror=m.onwriteend=null;e.addEventListener("unload",p,false);g.unload=function(){p();e.removeEventListener("unload",p,false)};return g}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined")module.exports=saveAs;if(!(typeof Blob==="function"||typeof Blob==="object")||typeof URL==="undefined")if((typeof Blob==="function"||typeof Blob==="object")&&typeof webkitURL!=="undefined")self.URL=webkitURL;else var Blob=function(e){"use strict";var t=e.BlobBuilder||e.WebKitBlobBuilder||e.MozBlobBuilder||e.MSBlobBuilder||function(e){var t=function(e){return Object.prototype.toString.call(e).match(/^\[object\s(.*)\]$/)[1]},n=function(){this.data=[]},r=function(t,n,r){this.data=t;this.size=t.length;this.type=n;this.encoding=r},i=n.prototype,s=r.prototype,o=e.FileReaderSync,u=function(e){this.code=this[this.name=e]},a=("NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "+"NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR").split(" "),f=a.length,l=e.URL||e.webkitURL||e,c=l.createObjectURL,h=l.revokeObjectURL,p=l,d=e.btoa,v=e.atob,m=e.ArrayBuffer,g=e.Uint8Array;r.fake=s.fake=true;while(f--){u.prototype[a[f]]=f+1}if(!l.createObjectURL){p=e.URL={}}p.createObjectURL=function(e){var t=e.type,n;if(t===null){t="application/octet-stream"}if(e instanceof r){n="data:"+t;if(e.encoding==="base64"){return n+";base64,"+e.data}else if(e.encoding==="URI"){return n+","+decodeURIComponent(e.data)}if(d){return n+";base64,"+d(e.data)}else{return n+","+encodeURIComponent(e.data)}}else if(c){return c.call(l,e)}};p.revokeObjectURL=function(e){if(e.substring(0,5)!=="data:"&&h){h.call(l,e)}};i.append=function(e){var n=this.data;if(g&&(e instanceof m||e instanceof g)){var i="",s=new g(e),a=0,f=s.length;for(;a<f;a++){i+=String.fromCharCode(s[a])}n.push(i)}else if(t(e)==="Blob"||t(e)==="File"){if(o){var l=new o;n.push(l.readAsBinaryString(e))}else{throw new u("NOT_READABLE_ERR")}}else if(e instanceof r){if(e.encoding==="base64"&&v){n.push(v(e.data))}else if(e.encoding==="URI"){n.push(decodeURIComponent(e.data))}else if(e.encoding==="raw"){n.push(e.data)}}else{if(typeof e!=="string"){e+=""}n.push(unescape(encodeURIComponent(e)))}};i.getBlob=function(e){if(!arguments.length){e=null}return new r(this.data.join(""),e,"raw")};i.toString=function(){return"[object BlobBuilder]"};s.slice=function(e,t,n){var i=arguments.length;if(i<3){n=null}return new r(this.data.slice(e,i>1?t:this.data.length),n,this.encoding)};s.toString=function(){return"[object Blob]"};return n}(e);return function(n,r){var i=r?r.type||"":"";var s=new t;if(n){for(var o=0,u=n.length;o<u;o++){s.append(n[o])}}return s.getBlob(i)}}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content||this);var ics=function(){"use strict";if(navigator.userAgent.indexOf("MSIE")>-1&&navigator.userAgent.indexOf("MSIE 10")==-1){console.log("Unsupported Browser");return}var e=navigator.appVersion.indexOf("Win")!==-1?"\r\n":"\n";var t=[];var n=["BEGIN:VCALENDAR","VERSION:2.0"].join(e);var r=e+"END:VCALENDAR";return{events:function(){return t},calendar:function(){return n+e+t.join(e)+r},addEvent:function(n,r,i,s,o){if(typeof n==="undefined"||typeof r==="undefined"||typeof i==="undefined"||typeof s==="undefined"||typeof o==="undefined"){return false}var u=new Date(s);var a=new Date(o);var f=("0000"+u.getFullYear().toString()).slice(-4);var l=("00"+(u.getMonth()+1).toString()).slice(-2);var c=("00"+u.getDate().toString()).slice(-2);var h=("00"+u.getHours().toString()).slice(-2);var p=("00"+u.getMinutes().toString()).slice(-2);var d=("00"+u.getMinutes().toString()).slice(-2);var v=("0000"+a.getFullYear().toString()).slice(-4);var m=("00"+(a.getMonth()+1).toString()).slice(-2);var g=("00"+a.getDate().toString()).slice(-2);var y=("00"+a.getHours().toString()).slice(-2);var b=("00"+a.getMinutes().toString()).slice(-2);var w=("00"+a.getMinutes().toString()).slice(-2);var E="";var S="";if(p+d+b+w!=0){E="T"+h+p+d;S="T"+y+b+w}var x=f+l+c+E;var T=v+m+g+S;var N=["BEGIN:VEVENT","CLASS:PUBLIC","DESCRIPTION:"+r,"DTSTART;VALUE=DATE:"+x,"DTEND;VALUE=DATE:"+T,"LOCATION:"+i,"SUMMARY;LANGUAGE=en-us:"+n,"TRANSP:TRANSPARENT","END:VEVENT"].join(e);t.push(N);return N},download:function(i,s){if(t.length<1){return false}s=typeof s!=="undefined"?s:".ics";i=typeof i!=="undefined"?i:"calendar";var o=n+e+t.join(e)+r;var u;if(navigator.userAgent.indexOf("MSIE 10")===-1){u=new Blob([o])}else{var a=new BlobBuilder;a.append(o);u=a.getBlob("text/x-vCalendar;charset="+document.characterSet)}saveAs(u,i+s);return o}}}










var classSched = "https://accessplus.iastate.edu/servlet/adp.A_Plus";
var classSched1 = "https://accessplus.iastate.edu/servlet/adp.A_Plus?A_Plus_action=/R480/R480.jsp&SYSTEM=R480&SUBSYS=006&SYSCODE=CS&MenuOption=7"; //Not sure how necessary these two are. We'll see
var schedObj; //will include all of the necessary information for the calendar creation: eventTime, start, eventTimeEnd, end, WeekDays, name, subject, location
var arr = []; //will keep track of all classSched objects
var cnt = 2; //2 should be a pretty good starting point for the search

//Keeps track of the current row id
function tdID(){
	tdId = 'tr' + cnt;
	cnt++;
}

//Inspects the row associated with the given id to see whether it contains
//any useful info
//@param id - id of the given row
function splitInfo(id){
	var tr = '#' + id;
	
	if ($(tr).html().indexOf('&nbsp') !== -1){ //week days of class
		
	}
	
	else if ($(tr).html().indexOf(':') !== -1){ //get better check later - assuming we're dealing with time
		//check if its beg or end here
	}
	
	if ($(tr).html().indexOf('&nbsp') !== -1){ //figure out test thats specific for location
		
	}
	

}

//Will search for the needed information for each class
function search(){
	
	while ($('#' + tdId).length){
		$('#' + tdId).children().each(function (i) {
			splitName($(this).attr('id'));
		});
		tdID();	
	}
	
}


//Where the magic happens
$(document).ready(function() {
	
	if (url == classSched || url == classSched1){ //perform search when in the class schedule page
	
	
	}
}); 



var notifier,
    dialog;
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
function showDialog(){
    chrome.windows.create({
        url: 'dialog.html',
        width: 200,
        height: 120,
        type: 'popup'
    });
}    

//Probably the best textbook example for making a function.
//Takes in the start and end date and repeat frequency, does some ugly formatting
//And churns out a schedule
//Start is the day the class starts, end is the day it ends. EventStart is the time of day it starts
//EventEnd is the time of day the event ends, Weekdays is the days of week the event should occur on
//(An array of integers is expected)
function CreateSchedule(start, end,  eventTime,  eventTimeEnd,  WeekDays, name, subject, location)
{

	//Forcible typecasty garbage to bypass
	//JS's loosely typed shenanigans
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
	
	   //Hopefully the longest, grossest line of parsey Javascript I will ever produce.
	 var eventStartString = (eventStart.getMonth()+1).toString().concat("/").concat(eventStart.getDate().toString()).concat("/").concat(eventStart.getFullYear().toString()).concat(" ").concat(eventStart.getHours().toString()).concat(":").concat(eventStart.getMinutes().toString());//.concat(" PM"));
	 
	 //There is a discrepancy between indexing in months, hence the + 1
	 var eventEndString = (eventEnd.getMonth()+1).toString().concat("/").concat(eventEnd.getDate().toString()).concat("/").concat(eventEnd.getFullYear().toString()).concat(" ").concat(eventEnd.getHours().toString()).concat(":").concat(eventEnd.getMinutes().toString());//.concat(" PM"));


		 for(x = 0; x < WeekDays.length; x++)
		 {
			if(eventStart.getDay().toString() == WeekDays[x])
			{   
				cal.addEvent(name, subject, location, new Date(eventStartString) ,new Date(eventEndString));
			}
		  }
	}
}

function init() { 
//Note that each class that meets only once a week has been padded with an 8. Why is this?
//It's because if there is only one element in a list, it is not iterated through. Not sure why this is.
//It seems to be a bounds issue, but <= does no fix it. So the kludge.
//But why 8?
//Days are indexed 0-6. 8 was chosen because it is a clearly invalid option, without being negative.
//Negative values COULD be confused for an error message and return the wrong thing in a comparison.
//There should be no instance where a day of 8 makes sense, nor could trigger a false positive.


	//Start wtih  Com Sci 311 Lecture
	var StartDate = new Date(2015,07,24);//Same for every class this semester
	var EndDate = new Date(2015,11,18);
	var StartTime =  new Date(StartDate).setHours(12,39);
	var EndTime = new Date(StartDate).setHours(14,0);
	var WeekDays= new Array(2,4);//Tuesday and Thursday
	CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'Com Sci 311', 'Lecture', 'Atanassoff 310');
	
	//Then Com Sci 311 recitation
	StartTime = new Date(StartDate.setHours(14,10));
	EndTime = new Date(StartDate.setHours(15,00));
	WeekDays = new Array(4,8);
	CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'Com Sci 311', 'Recitation', 'Carver 129');

	//Now Com Sci 336
	StartTime = new Date(StartDate.setHours(11,00));
	EndTime = new Date(StartDate.setHours(12,20));
	WeekDays = new Array(2,4);
	CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'Com Sci 336', 'Lecture', 'Durham 171');

	//Now Cpre 491
	StartTime = new Date(StartDate.setHours(14,10));
	EndTime = new Date(StartDate.setHours(16,00));
	WeekDays = new Array(2,8);
	CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'CPRE 491', 'Senior Design', 'Coover 2253');

	//Cpre 494
	StartTime = new Date(StartDate.setHours(15,10));
	EndTime = new Date(StartDate.setHours(16,00));
	WeekDays = new Array(3,8);
	CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'CPRE 494', 'R credit crap', 'Physics 3');

	//EE 230 Lecture
	StartTime = new Date(StartDate.setHours(08,0));
	EndTime = new Date(StartDate.setHours(08,50));
	WeekDays = new Array(1,3,5);
	CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'EE 230', 'EE 230', 'Hoover 1213');

	//EE 230 Lab
	StartTime = new Date(StartDate.setHours(11,00));
	EndTime = new Date(StartDate.setHours(13,50));
	WeekDays = new Array(3,8);
	CreateSchedule(StartDate, EndDate, StartTime, EndTime , WeekDays, 'EE 230 Lab', 'Lab', 'Coover 2250');
	
	cal.download(cal); 
	
}    
document.getElementById('clickme').addEventListener('click', init);
//Hopefully you're ready for a completely "hacky" plugin - seriously don't judge ヽ（´ー｀）┌

//The main functionality of this part of the Access++ extension is to add the Rate My Professor functionality, but it will also get the needed information
//for the google calendar exportation, such as: class name, beginning and end date, dates, ect...

var url =  window.location.href;  
var accessPlus = "https://accessplus.iastate.edu/servlet/adp.A_Plus"; //possible url for access plus after first access
var accessPlus1 = "https://accessplus.iastate.edu/servlet/adp.A_Plus?A_Plus_action=/R480/R480.jsp&SYSTEM=R480&SUBSYS=006&SYSCODE=CS&MenuOption=7"; //possible url for access plus 

var img = document.createElement("img"); //useless crap -- i wonder if i can sneak a meme somewhere?
img.src = "https://imgflip.com/s/meme/Jackie-Chan-WTF.jpg"; //I regret nothing

var element = $('#Grid').next(); //where we're going to append our RMP div to 
var Name; //keeps track of the name of the current prof being read
var curDate; //keeps track of the name of the current prof being read
var cnt = 7; //7 should be a pretty good place to start searching
var tdId; //keeps track of the current tdId being read
var profs = []; //will store the prof's names here

//Keeps track of the current row id
function tdID(){
	tdId = 'tr' + cnt;
	cnt++;
}

//Calculated the "ideal" div size according to the number of found teachers
//@param number - number of teachers
function getBoxSize(number){
	var mult;
	if (number === 1) mult = 60;
	else mult = number*45 + 1; //+1 for the title line
	return mult + 'px';
}

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

//Checks to see whether the given row contains any "Days of the Week", such as M for Monday, T for Tuesday, ect...
function containsDW(id){
	var tr = '#' + id;
	if ($(tr).html().indexOf(" M ") !== -1 || $(tr).html().indexOf(" T ") !== -1 || $(tr).html().indexOf(" W ") !== -1 || $(tr).html().indexOf(" R ") !== -1 || $(tr).html().indexOf(" F ") !== -1){
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

//Checks whether the row associated with the given id has any association with the class dates, 
//if so, it'll save the class days and its start/end time
//@param id - id of the given row
function checkDates(id){
	var tr = '#' + id;
	if ($(tr).html().indexOf('&nbsp;') !== -1 && containsDW(id)){
		var date = $(tr).html().split(';');		
		//save date[3] - thats the meeting times for the class
		var startTime = incrementID(id, 1);
		var endTime = incrementID(id, 2);

	}
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
		});
		tdID();	
	} 
}

//Was attempting to send a request to a website to be able to parse 
//the received page. Apparently cross-domain access is illegal with ajax - bummer
function getPage() { //illegal
	$.ajax({url: 'https://www.ratemyprofessors.com/search.jsp?query=LATHROP+Iowa+State+University'}).
		done(function(pageHtml) {
			alert(pageHtml.html());
	});
}

//Where the magic happens
$(document).ready(function() {
	var updProfs = []; //updated array with the professor information, will not contain any repeated names
	var nome = [];	
	
	if (url == accessPlus || url == accessPlus1){

		updateIDs(); 
		updProfs = remRepeats(profs);

		var div = $('<div style = "margin-left: 0px; width:400px; height:' + getBoxSize(updProfs.length) +'; border-left:1px solid #CC0000; position:relative;margin-left: 50px;"> </div>');
		var title = $('<div style = "margin-left: 0px; width:400px; height: 23px; background: #CC0000; color: white; font-size: 15px;"> <b>Rate My Professor! </div>');
		
		$(div).append(title);		
		
		for (i = 0; i < updProfs.length; i++){
			nome = parseName(updProfs[i]);
			if (!(i%2 == 0)) {
				$(div).append('<div style = "margin-left: 0px; background: #E8E8E8;">' + '<br>' + updProfs[i] + ' <a href= "http://www.ratemyprofessors.com/search.jsp?query=' + nome[0] + '+Iowa+State+University'+'"> Check me out!</a><br><br></div>');		
			}
			
			else {
				$(div).append('<div> <br>' + updProfs[i] + '<a href= "http://www.ratemyprofessors.com/search.jsp?query=' + nome[0] + '+Iowa+State+University'+'"> Check me out!</a><br><br></div>');		
			}
		}		
		
		element.append("<br>");
		element.append(div);
		element.append("<br><br>");
	
	}
}); 

var url =  window.location.href;  
var accessPlus = "https://accessplus.iastate.edu/servlet/adp.A_Plus";
var accessPlus1 = "https://accessplus.iastate.edu/servlet/adp.A_Plus?A_Plus_action=/R480/R480.jsp&SYSTEM=R480&SUBSYS=006&SYSCODE=CS&MenuOption=7";

var img = document.createElement("img"); //useless crap -- i wonder if i can sneak a meme somewhere?
img.src = "https://imgflip.com/s/meme/Jackie-Chan-WTF.jpg";

var element = $('#Grid').next(); //where we're going to append our RMP div to 
var Name; //keeps track of the name of the current prof being read
var cnt = 7; //7 should be a pretty good place to start searching
var tdId; //keeps track of the current tdId being read
var arr = []; //will store the prof's names here

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
function splitName(id){
	var tr = '#' + id;
	
	if ($(tr).html().indexOf('mailto:') !== -1){
		var prof = $('#' + id).html().split('>');
		Name = prof[1].split('<');
		arr.push(Name[0]);
		//i++;
	}
}

//Gives ids to every table data and table row that includes class information
//Also sees whether the given table data contains a professor name
function getProfessors() {
	$("#long").children().children().children().each(function (i) {
		$(this).attr('id', 'tr' +i);
	});
	
	tdID();
	
	while ($('#' + tdId).length){
		$('#' + tdId).children().each(function (i) {
			$(this).attr('id', tdId + 'td' +i);
			splitName($(this).attr('id'));
		});
		tdID();	
	} 
}

//Was attempting to send a request to a website to be able to parse 
//the received page. Apparently cross-domain access is illegal with ajax
function getPage() { //illegal
	$.ajax({url: 'https://www.ratemyprofessors.com/search.jsp?query=LATHROP+Iowa+State+University'}).
		done(function(pageHtml) {
			alert(pageHtml.html());
	});
}

//Where the magic happens
$(document).ready(function() {
	var array = [];
	var nome = [];	
	
	if (url == accessPlus || url == accessPlus1){
		
		getProfessors(); 
		array = remRepeats(arr);
		
		var div = $('<div style = "margin-left: 0px; width:400px; height:' + getBoxSize(array.length) +'; border-left:1px solid #CC0000; position:relative;margin-left: 50px;"> </div>');
		var title = $('<div style = "margin-left: 0px; width:400px; height: 23px; background: #CC0000; color: white; font-size: 15px;"> <b>Rate My Professor! </div>');
		
		$(div).append(title);		
		
		for (i = 0; i < array.length; i++){
			nome = parseName(array[i]);
			if (!(i%2 == 0)) {
				$(div).append('<div style = "margin-left: 0px; background: #E8E8E8;">' + '<br>' + array[i] + ' <a href= "http://www.ratemyprofessors.com/search.jsp?query=' + nome[0] + '+Iowa+State+University'+'"> Check me out!</a><br><br></div>');		
			}
			
			else {
				$(div).append('<div> <br>' + array[i] + '<a href= "http://www.ratemyprofessors.com/search.jsp?query=' + nome[0] + '+Iowa+State+University'+'"> Check me out!</a><br><br></div>');		
			}
		}		
		
		element.append("<br>");
		element.append(div);
		element.append("<br><br>");
	
	}
}); 

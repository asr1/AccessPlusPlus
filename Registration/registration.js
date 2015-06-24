var strPage = $("td[align='left'][class='sfff'][width='40%']").children().text(); //Used to determine if on class registration page
var strPage2 = $("div[id='appDiv']").children("h2").text(); //Used to determine if on add/drop page
var strPage3 = window.location.href; //The URL we are on.
var appPage = "https://accessplus.iastate.edu/servlet/adp.A_Plus"; //The registration applet
if((strPage2.substring(0,8) === "Add/Drop" && strPage === "Class Registration") || (strPage === "Class Schedule" && strPage3 == appPage))
{
	//$("input[name='applicationSize']").next("tr").children().children("table").next().append("<div id='insert_schedule_here'></div>");
	$("table[summary='Tab selection and application display area']").append("<div id='insert_schedule_here'></div>");
	$("#insert_schedule_here").load("https://accessplus.iastate.edu/servlet/adp.A_Plus?A_Plus_action=/R480/R480.jsp&SYSTEM=R480&SUBSYS=006&SYSCODE=CS&MenuOption=7 #Grid", 
		function(responseText, textStatus, jqXHR) 
		{ 
			$("#Grid").css("visibility", "visible"); 
			$("#Grid").css("display", "block");
		});
	$("#insert_schedule_here").css("visibility", "visible");	
}
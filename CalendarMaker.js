  //Manually loop through each class we have.
  //This is gross and kludgey
function MakeCal(){
  alert("RUNNING");
  //Start with Com S 311
  var start = new Date("08/24/2015");
    var end = new Date("12/18/2015");

	var cal = ics();//Make our new Calendar
	
    while(start <= end)
	{
       //alert(start);           

       var newDate = start.setDate(start.getDate() + 1);
       start = new Date(newDate);
	   
	   //It's a Tuesday or Thursday
	   if(start.getDay() == 2 || start.getDay() == 4)
	   {
		cal.addEvent('Com Sci 311', 'Algorithms', 'Atanassoff 310', start.setHours(12,40), start.setHours(14);
	   }
    }
	
	/*
	//Example
    cal.addEvent('Demo Event', 'This is thirty minut event', 'Nome, AK', '8/7/2013 5:30 pm', '8/9/2013 6:00 pm');

	cal.addEvent(subject, description, location, begin, end);
	*/

	
	//Download the calendar?
	 window.open( "data:text/calendar;charset=utf8," + escape(ics));
	

}
//document.addEventListener('DOMContentLoaded', MakeCal);
document.getElementById("dialog").addEventListener("click", MakeCal);
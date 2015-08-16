//Hackyness is hacky
//This part of the plugin is responsible for keeping track of the amount of meals that the student has 

var url = window.location.href;
var dining = "Dining Summary";

var element = $("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children(":nth-child(2)"); //where we are appending Meal Tracker to
var date = new Date(); 
var curDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

var meals; //object which will contain all of our meal plan info
var startMeals; //the number of meals the student has initially
var avgMealsD; //the average number of meals one can have per day with the given meal plan (object)
var avgMealsW; //the average number of meals one can have per week with the given meal plan
var avgMealsM; //the average number of meals one can have per month with the given meal plan

var extraMeals;
var meals_left_str=$("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children().prev().text();
var regex = new RegExp("[0-9]{1,3}") ; 
var meals_left= meals_left_str.match(regex)[0];		
var timef = "day"; //let's initially start @daily
var isHoliday = false;
var debug = true; //testing purposes -- set to true when you want variables to be printed out on the console
var toPrint = ""; //string where we're printing all of our debug info

//String containing the student's dining information 
var str =$("td[class='alignvt'][valign='top'][colspan='1'][rowspan='1'][width='19%']").text();

//Initializes the meals object
//semester - the semester associated 
//sDate - start date
//sMonth - start month
//eDate - end date
//eMonth - end month
function mealsInfo(semester, planSem, sDate, sMonth, eDate, eMonth){
        this.semester = semester;
        this.planSem = planSem;
		this.sDate = sDate;
		this.sMonth = sMonth;
		this.eDate = eDate;
		this.eMonth = eMonth;
}

//Saving the daily meal info in an object since its the only time frame that includes extra meals per week (eg. 1+2) and str representation
function mealsD(avgMeals, extraW, avgMealsDstr){
    this.avgMeals = avgMeals;
    this.extraW = extraW;
    this.avgMealsDstr = avgMealsDstr;
}

//->Currently NOT being used - switched over to the iSholiday() function in dependencies<-
//Meal plan isn't used during hollidays. 
//Everybody breaks off during thanksgiving
//No meals are served May 25 (Memorial Day)
//Dinner is not served on July 4 (Independance Day) 
//No meals are served during spring break
function getHoliday(year){
    
    var thanksgivingD = new Date("November 21, " + year); //Thanksgiving-- fourth thursday of november
    var memDay = new Date ("May 21, " + year); //last monday of may
    var springBreak = new Date ("March 7, " + year); //Begins on the second saturday of March
    
    while(thanksgivingD.getDay() != 4){
        thanksgivingD.setDate(thanksgivingD.getDate() + 1);
    }
    
    if ((date.getDate() >= thanksgivingD.getDate().getDate()) && (date.getDate() <= (thanksgivingD.getDate()+7))){
        isHoliday = true;
    }
    
    while (memDay.getDay() != 1){
        memDay.setDate(memDay.getDate() + 1);
    }
    
    if (date.getDate() == thanksgivingD.getDate()) isHoliday = true;
    
    while (springBreak.getDate() != 6){
        springBreak.setDate(springBreak.getDate() + 1);
    }
    
    if (date.getDate() == springBreak.getDate()) isHoliday = true;
    
    isHoliday = iSholiday(new Date(curDate));
}

//Returns the current plan's semester
function getPlanSem(str){
    if (str.indexOf("fall") > -1) return "fall";
    else if (str.indexOf("spring") > -1) return "spring";
    else if (str.indexOf("summer") > -1) return "summer";
}

//Returns the term associated with the given date
function getTerm (month, day, year){
    
    //Plan starts on a monday on the third week of May and ends on a friday of the 1st week of August
    if ((month >= 4 && month <= 7) && (!((month == 4 && (day <= 14) ||(month == 7 && (day >= 7)))))){//ignore if we're before the third week of May or after the first week of Aug 

            var sumStartStr = "May 14, " + year; 
            var sumStr = new Date(sumStartStr);
            var sumEndStr = "August 1," + year;
            var sumEnd = new Date(sumEndStr);

            while ((sumStr.getDay() != 1)){
                sumStr.setDate(sumStr.getDate() + 1);
            }

            while ((sumEnd.getDay() != 5)){
                sumEnd.setDate(sumEnd.getDate() + 1);
            }  //Friday of the 1st week
        
    
        
        meals = new mealsInfo("summer", getPlanSem(meals_left_str), sumStr.getDate(), sumStr.getMonth(), sumEnd.getDate(), sumEnd.getMonth());
    }
    
    //Plan starts on a tuesday on the third week of august and ends on a friday of the 3rd week of December
    else if (month >= 7 && month <= 11 && (!(month == 7 && day <= 1) ||(month == 11 && (day >= 21)))){ //ignore if we're before the third wk of Aug or after the 3rd wk of Dec
        
            var fallStartStr = "August 14, " + year; //we know the term starts some time in August (3rd week)
            var fallStr = new Date(fallStartStr);
            var fallEndStr = "December 14, " + year; 
            var fallEnd = new Date(fallEndStr);
            
            while ((fallStr.getDay() != 2)){ //tuesday
                fallStr.setDate(fallStr.getDate() + 1);
            }

            while ((fallEnd.getDay() != 5)){ //friday
                fallEnd.setDate(fallEnd.getDate() + 1);
            }  //Saturday of the 3rd week
        
        
        meals = new mealsInfo("fall", getPlanSem(meals_left_str), fallStr.getDate(), fallStr.getMonth(), fallEnd.getDate(), fallEnd.getMonth());
    }
    
    //Plan starts on a saturday on the second week of Jan and ends on a Sunday of the 1st week of May
    else if (month >= 0 && month <= 4 && (!(month == 0 && day > 7 ||(month == 4 && (day <= 14))))){ //ignore if its before the 2nd wk of Jan or after the 2nd wk of May
            var sprStartStr = "January 7, " + year; //we know the term starts some time in January
            var sprStr = new Date(fallStartStr);
            var sprEndStr = "May 1, " + year; //we know the term ends sometime during the first week
            var sprEnd = new Date(fallEndStr);  

            while ((sprStr.getDay() != 6)){ //saturday
                sprStr.setDate(sprStr.getDate() + 1);
            }

            while ((sprEnd.getDay() != 5)){ //friday
                sprEnd.setDate(sprEnd.getDate() + 1);
            }  //Sunday of the 2nd week
        

        meals = new mealsInfo("spring", getPlanSem(meals_left_str), sprStr.getDate(), sprStr.getMonth(), sprEnd.getDate(), sprEnd.getMonth());
    }
}

//Determines whether it is currently the fall, spring, or summer term
//Associates a start date accordingly
//The start date is an estimate as it is not possible to retrieve the information from the dinning page
//and scrapping external pages would require a running server, which we obviously are not using
function initStart(){
        var curDay = date.getDate();
        var curMonth = date.getMonth();
        var curYear = date.getFullYear();
        var curWkDay = date.getDay();

        getTerm(curMonth, curDay, curYear);
}

function initMeals (str){
        //if we just dont have a meal plan OR we have a meal plan for a future semester and not one for the current one
        if((str.indexOf("No meal plan") > -1) || (str.indexOf("fall meal plan balance") > -1 && meals_left_str.indexOf("fall") == -1) || (str.indexOf("spring meal plan balance") > -1 && meals_left_str.indexOf("spring") == -1) || (str.indexOf("summer meal plan balance") > -1 && meals_left_str.indexOf("summer") == -1)){
            startMeals = 0;
            avgMealsD = new mealsD(0, 0, "0");
            avgMealsW = 0;
            avgMealsM = 0;          
        }

		else if(str.indexOf("Bronze") > -1){
			startMeals = 125;
            avgMealsD = new mealsD(1, 1, "1(+1)");
            avgMealsW = 8;
            avgMealsM = 32;            
		}
        
        else if(str.indexOf("Silver") > -1){
			startMeals = 175;
            avgMealsD = new mealsD(1, 4, "1(+4)");
            avgMealsW = 11;
            avgMealsM = 44;
		}
        
        else if(str.indexOf("Gold") > -1){
			startMeals = 225;
            avgMealsD = new mealsD(2, 0, "2");
            avgMealsW = 14;
            avgMealsM = 56;
		}
        
        else if (str.indexOf("Cardinal") > -1){
			startMeals = 275;
            avgMealsD = new mealsD(2, 3, "2(+3)");
            avgMealsW = 17;
            avgMealsM = 68;
		}
        
        else if (str.indexOf("Cyclone") > -1){
			startMeals = 304;
            avgMealsD = new mealsD(2, 5, "2(+5)");
            avgMealsW = 19;
            avgMealsM = 76;
		}
    
        else { //Whelp this is me not being able to think of other conditions
            startMeals = 0;
            avgMealsD = new mealsD(0, 0, "0");
            avgMealsW = 0;
            avgMealsM = 0;   
        }
    
}

//Checks whether we are still in the semester time frame
function checkTerm (){

   if (date.getMonth() >= meals.sMonth && date.getMonth() <= meals.eMonth){
        if (!((date.getMonth() == meals.sMonth && (date.getDate() < meals.sDate)) || (date.getMonth() == meals.eMonth && (date.getDate() > meals.eDate))) && !iSholiday(new Date(curDate))){
            if (debug) toPrint+= ("Check term: true -> " + meals.semester + "\n\n");
            if (!(meals.planSem != meals.semester) || debug == true){
                return true;
            }
        }
   }
   return false;
}

//Yeah we need this function since some months change its number of days
//Blast you february
//Also to keep track of months that have 30/31 days
//start - the current month
//numMonths - how many months have passed since the start of the term
function daysinMonth(start, numMonths, year){
    var count = 0;
    var i;

    if (numMonths > 0){
        for (i = (start-1); i > (start - numMonths); i--){
            count += new Date(year, i, 0).getDate();
        }
        //new Date(year, meals.sMonth, 0)) initializes the date to the last day of the month
        count+=((new Date(year, meals.sMonth, 0)).getDate() - meals.sDate); //add the days of the first month (ex. start date is Aug 18 -> add 31 - 18 = 13)
    }
    else{
        count = date.getDate() - meals.sDate;
    }
    
    return count;
}

// returns the total number of times the timeF has passed
function getTimeFrame(per){
    var numMonths = 0;
    var numWeeks = 0; 
    var numDays = 0;
    

    if (checkTerm()){
        numMonths = date.getMonth() - meals.sMonth;
        if (per == "day"){
            if (numMonths == 0) numDays = date.getDate() - meals.sDate;
            else{
                numDays = (daysinMonth(date.getMonth(), numMonths, date.getFullYear())) + date.getDate(); //some dates have 31, 30, or 28 (yeah im watching you february) days...
            }

            if (debug) toPrint += ("Calculated number of passed days : " + numDays + "\n\n");
            return numDays;
        }

        else if (per == "week"){
            numWeeks = ((Math.floor(date.getDate()/7))+numMonths*4)-Math.floor(meals.sDate/7);
            if (debug) toPrint += ("Calculated number of passed weeks : " + numWeeks + "\n\n");
            return numWeeks;
        }

        else if (per == "month"){
            if (debug) toPrint += ("Calculated number of passed months : " + numMonths + "\n\n");
            return numMonths;
        }
    }
}

//Calculates the number of extra meals the student has
function calcExtra (){
    
    //make sure we're still in the term 
    if (checkTerm()){ //check the extremes - make sure we're not before/after the start/end periods nor during a holiday 
            if(timef == "day") {
                extraMeals = avgMealsD.avgMeals*getTimeFrame("day") + avgMealsD.extraW*getTimeFrame("week"); 
                if (extraMeals == 0) extraMeals = avgMealsD.avgMeals; //the first day is the 0th day and it must still account for meals
                if (debug) toPrint+=("Predicted number of meals for ("+timef+") is: "+extraMeals);
            }
            
            else if(timef == "week") {
                extraMeals = avgMealsW*getTimeFrame("week");
                if (extraMeals == 0) extraMeals = avgMealsW; //the first week will be the 0th week, and as such will have to allow for meals
                if (debug) toPrint+=("Predicted number of meals for ("+timef+") is: "+extraMeals);
            }
            
            else {
                extraMeals = avgMealsM*getTimeFrame("month"); 
                if (extraMeals == 0) extraMeals = avgMealsM; //the first moth is the 0th month and it must still account for meals
                if (debug) toPrint+=("Predicted number of meals for ("+timef+") is: "+extraMeals);
            }
            
            extraMeals-=(startMeals-meals_left);
            if (debug){
                toPrint += ("\n\nNumber of meals left is: " + meals_left + "\n");
                toPrint += ("\n\nAvailable meals for this " + timef + " is " + extraMeals + "\nPAY ATTENTION to the active semester");
            }
    }
}

//Updates the borders around the buttons when one is clicked
//Im missing something here with JS. Not sure if it is unable to interpret the given ids as variables. 
//I assume they need extra quotes to be interpreted correctly
function updBorder(id, circleId){
    document.getElementById(circleId).style.boxShadow = "1px 1px 1px #f0ff00";
    document.getElementById(circleId).style.background = "#f5ff5a";
    document.getElementById(id).style.boxShadow = "none";
    
    if (id != "dailyBut"){
        document.getElementById("dailyBut").style.boxShadow= "2px 2px 1px #888888";
        document.getElementById("dailyButCircle").style.boxShadow = "none";
        document.getElementById("dailyButCircle").style.background = "linear-gradient(rgb(255, 255, 34), orange)";
    }
    if (id != "weeklyBut"){
        document.getElementById("weeklyBut").style.boxShadow= "2px 2px 1px #888888";
        document.getElementById("weeklyButCircle").style.boxShadow = "none";
        document.getElementById("weeklyButCircle").style.background = "linear-gradient(rgb(255, 255, 34), orange)";
    }
    if (id != "monthlyBut"){
        document.getElementById("monthlyBut").style.boxShadow= "2px 2px 1px #888888";
        document.getElementById("monthlyButCircle").style.boxShadow = "none";
        document.getElementById("monthlyButCircle").style.background = "linear-gradient(rgb(255, 255, 34), orange)";
    }

}

function updText(timef, avgMeals){
   if (debug) console.log(toPrint);
   var avgMealsComp = avgMeals;
    
   if (timef == "day"){
        avgMealsComp = avgMealsD.avgMeals;
   }
    
   if (startMeals == 0){ //no meal plan for the active term
//            if (str.indexOf(meals.semester) == -1){
//                document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 8px;padding-top:20px; padding-bottom:20px;font-size: 1em;text-align: center;"><br>Sorry but you do not currently have a meal plan for the '+ meals.planSem + '.</div>';
//            } //if you're looking at a future semester that does not have a meal plan
//       
//            else
       document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 8px;padding-top:20px; padding-bottom:20px;font-size: 1em;text-align: center;"><br>Sorry but you do not currently have a meal plan for the '+ meals.semester + '.</div>';
    }

    else if (meals.planSem != meals.semester){ //possible meal plan for the future term, but we're not currently in that term
        document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMeals+'</b><br><i>Your '+meals.planSem +' meal plan is not currently activated.</i></div>';
    }
    
    else if (extraMeals == 0 ||  extraMeals == avgMealsComp){ //user is on track
        document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMeals+'</b><br> You can still have <u><b>'+extraMeals+'</b></u> meal(s) this '+timef+'</div>';      
    }
        
    else if (extraMeals < 0){
        document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMeals+'</b><br> Your predicted meal count is <u>below</u> by: <b>'+extraMeals+'</b></div>'; 
    }
    
    else if (extraMeals > avgMealsComp){
        document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMeals+'</b><br> Your predicted meal count is <u>above</u> by: <b>'+extraMeals+'</b></div>';   
    }
    
    else{ //in any other scenario, assume A+ terminated the last meal plan but has yet to activate the next term's meal plan
        document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px; text-align: justify;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMeals+'</b><br><i>Your '+meals.planSem +' meal plan is not currently activated.</i></div>';
    }
}

function dailyFunc(){
    timef = "day";
    calcExtra();
    updText(timef, avgMealsD.avgMealsDstr);
    updBorder("dailyBut", "dailyButCircle");
}

function weeklyFunc(){
    timef = "week";
    calcExtra();
    updText(timef, avgMealsW);
    updBorder("weeklyBut", "weeklyButCircle");
}

function monthlyFunc(){
    timef = "month";
    calcExtra();
    updText(timef, avgMealsM);
    updBorder("monthlyBut", "monthlyButCircle");
}


function help(){
    alert("MEAL TRACKER Is supposed to help you plan your meal usage throughout the semester.\n\nClick on one of the buttons (Daily/Weekly/Monthly) to view how many meals you have for that chosen time frame, as well as how many you still have available in order to keep up with your meal plan.\n\nWhat does it mean to have x(+y) meals?\nThis means that you have an average of 'x' meal(s) per day, with an extra 'y' meal(s) for the week.\nEx: 1(+1) -> 1 meal per day with an extra meal for the week.\n\nAlso we are taking in consideration the extra 5 meals given per semester.");
}

//returns specific colors for the title/image according to the semester term
//@param term - the current meal plan term
function bubbleSem(term){
    if (term == "fall") return "<div style = 'width: 215px; margin-left: auto; margin-right:auto;'> <span style = 'color:#cf4c39; font-size: 2.3em; font-weight: bold;'>MEAL</span> <span style = 'color: #ec8134; font-size: 2.3em; font-weight: bold;'>TRACKER</span></div><div style = 'margin:auto; margin-top:10px; width:115px; height:115px;'><img src='http://vector-magz.com/wp-content/uploads/2013/12/autumn-leaves-clip-art.png' style = 'width:115px; height:115px; '></div>";
    
    else if (term == "spring") return "<div style = 'width: 215px; margin-left: auto; margin-right:auto;'> <span style = 'color:#dc6767; font-size: 2.3em; font-weight: bold;'>MEAL</span> <span style = 'color: #ee7f7e; font-size: 2.3em; font-weight: bold;'>TRACKER</span></div><div style = 'margin:auto; margin-top:10px; width:115px; height:115px;'><img src='http://www.season-basket.com/print/cut/pc_sakura18_l.png' style = 'width:115px; height:115px; '></div>";
    
    else if (term == "summer") return "<div style = 'width: 215px; margin-left: auto; margin-right:auto;'> <span style = 'color:#f4aa1a; font-size: 2.3em; font-weight: bold;'>MEAL</span> <span style = 'color: #f4bf08; font-size: 2.3em; font-weight: bold;'>TRACKER</span></div><div style = 'margin:auto; margin-top:10px; width:115px; height:115px;'><img src='http://www.myiconfinder.com/uploads/iconsets/e154aa56822591b968cc98ae9c72dd57.png' style = 'width:115px; height:115px; '></div>";

}

//returns a specific gradient according to the given term
//@param term - the current meal plan term
function bubbleGradSem(term){
    if (term == "fall") return "border-image: linear-gradient(rgba(236, 129, 52, 0.7), rgba(236, 73, 56, 0.5)) 1 100%;";
    
    else if (term == "spring") return "border-image: linear-gradient(rgba(236, 129, 52, 0.7), rgba(238, 127, 126, 0.5)) 1 100%;";
    
    else if (term == "summer") return "border-image: linear-gradient(rgba(251, 131, 29, 0.7), rgba(255, 201, 7, 0.5)) 1 100%;";
}

//returns specific button colors according to the given term
//@param term - the current meal plan term
function butSem(term, type){
    if (term == "fall"){
        if (type == "mouseover") return "#e66342";
        else if (type == "mouseout" || type == "standard") return "#cc4938";
    }
    
    else if (term == "spring"){
        if (type == "mouseover") return "#ee7f7e";
        else if (type == "mouseout" || type == "standard") return "#dc6767";
    }
    
    else if (term == "summer"){
        if (type == "mouseover") return "#fbad19";
        else if (type == "mouseout" || type == "standard") return "#fb8319";
    }
}

$(document).ready(function() {
    
    //check to see whether the html page actually is the dining page
    if($("title").text()== dining){
            initStart();
            initMeals(str);
            calcExtra();

            var img = $('<div style = "float:left; padding: 10px; padding-top: 70px;"> <img src = "http://www.webweaver.nu/clipart/img/misc/food/fast-food/hot-dog.png" style = "width:50px; height: 50px;" <br></div>'); 
            var interrogation = $('<div id = "helpMe" onclick="help()" title = "Help" style = "width: 40px; height: 40px; padding-left: 10px; margin-left: -35px; margin-top: -280px; z-index:2; position:absolute;"><img src = "http://png-2.findicons.com/files/icons/1008/quiet/256/interrogation.png" style = "width:40px; height: 40px;"></div>');
            var bubble = $('<div style = "margin-top:20px;  margin-bottom: 20px; width:300px; height:325px; background:rgb(248, 248, 248); border: 10px solid;' + bubbleGradSem(meals.planSem) + '">\
                                        <div style = "padding:30px; padding-left: 0px; height: 200px; width: 300px; margin:auto; ">' + bubbleSem(meals.planSem) + '<div id = "onDisplay" style = "width:260px; margin:auto;"></div>\
                                                <div style = "padding-left: 25px;width: 250px;  margin-left: auto; margin-right:auto; position:aboslute;">\
                                                    <button id="dailyBut" type="button" style = "width: 60px;box-shadow: none; margin-right:10px; height:25px; background: '+ butSem(meals.planSem, "standard") +'; border-radius: 5px; font-weight: bold;"><div style = "float:left; color: white;">Daily</div> <div id = "dailyButCircle" style = "margin-left: 38px; margin-top: 4px;width: 7px; height: 7px; box-shadow: 1px 1px 1px #f0ff00; border-radius: 50%; background: #f5ff5a;"></div></button>\
                                                    <button id="weeklyBut" type="button" style = "width: 70px; box-shadow: 2px 2px 1px #888888; margin-right:10px; height:25px; border-radius: 5px; background: '+ butSem(meals.planSem, "standard") +'; font-weight: bold;"><div style = "float:left; color: white;">Weekly</div> <div id = "weeklyButCircle" style = "margin-left: 48px; margin-top: 4px;width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(rgb(255, 255, 34), orange);"></div></button>\
                                              <button id="monthlyBut" type="button" style = "width: 75px; box-shadow: 2px 2px 1px #888888; margin-right:10px; height:25px; border-radius: 5px; background:'+ butSem(meals.planSem, "standard") +'; font-weight: bold;"><div style = "float:left; color: white;">Monthly</div> <div id = "monthlyButCircle" style = "margin-left: 53px; margin-top: 4px;width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(rgb(255, 255, 34), orange);"></div></button>\
                                    </div>\
                                    </div>\
                                    </div>\
                                    </div>\
                                    </div>\
                                    </div>');
        
            bubble.append(interrogation);
            element.append(bubble);

            updText("day", avgMealsD.avgMealsDstr);
                                      document.getElementById("dailyBut").addEventListener("click", function(){dailyFunc()});
            document.getElementById("dailyBut" ).onmouseover = function(){
                this.style.backgroundColor = butSem(meals.planSem, "mouseover");
                this.style.cursor = "pointer";
            }

            document.getElementById("dailyBut" ).onmouseout = function(){
            this.style.backgroundColor = butSem(meals.planSem, "mouseout");
            }
                        document.getElementById("weeklyBut").addEventListener("click", function(){weeklyFunc()});
            document.getElementById("weeklyBut" ).onmouseover = function(){
                this.style.backgroundColor = butSem(meals.planSem, "mouseover");
                this.style.cursor = "pointer";
            }

            document.getElementById("weeklyBut" ).onmouseout = function(){
            this.style.backgroundColor = butSem(meals.planSem, "mouseout");
            }

            document.getElementById("monthlyBut").addEventListener("click", function(){monthlyFunc()});
            document.getElementById("monthlyBut" ).onmouseover = function(){
                this.style.backgroundColor = butSem(meals.planSem, "mouseover");
                this.style.cursor = "pointer";
            }

            document.getElementById("monthlyBut" ).onmouseout = function(){
            this.style.backgroundColor = butSem(meals.planSem, "mouseout");
            }
            document.getElementById("helpMe").addEventListener("click", function(){help()});
            document.getElementById("helpMe").onmouseover = function(){
                    this.style.cursor = "pointer";
            }
            if (debug){
                toPrint+=("\n\nStarting month for: " + meals.semester + " is " + meals.sMonth + "\n\n" + "Starting date is: " + meals.sDate + "\n\nEnding month is: " + meals.eMonth + "\n\nEnding date is: " + meals.eDate + "\n\nIs Holiday? " + isHoliday);
                console.log(toPrint);
            }
        }
    });
//Hackyness is hacky
//This part of the plugin is responsible for keeping track of the amount of meals that the student has 

var url = window.location.href;
var dining = "Dining Summary";

var element = $("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children(":nth-child(2)"); //where we are appending Meal Tracker to
var date = new Date(); 
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
var debug = true; //testing purposes
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

//Saving the daily meal info in an object since its the only time frame that includes extras per week and str representation
function mealsD(avgMeals, extraW, avgMealsDstr){
    this.avgMeals = avgMeals;
    this.extraW = extraW;
    this.avgMealsDstr = avgMealsDstr;
}

//Meal plan isn't used during hollidays. 
//Pretty sure it aint served during thanksgiving
//No meals are served May 25 (Memorial Day)
//Dinner is not served on July 4 (Independance Day) - WHY only dinner?? WHy do YoU MaKE My LIfE HarDEeEeeEEr?
function getHoliday(year){
    year+=1900;
    //Thanksgiving-- fourth thursday of november
    var thanksgivingD = new Date("November 21, " + year);
    var memDay = new Date ("May 21, " + year); //last monday of may
    
    while(thanksgivingD.getDay() != 4){
        thanksgivingD.setDate(thanksgivingD.getDate() + 1);
    }
    
    if ((date.getDate() >= thanksgivingD.getDate().getDate()) && (date.getDate() <= (thanksgivingD.getDate()+7))){//gotta check - thanksgiving is a week yes?
        isHoliday = true;
    }
    
    while (memDay.getDay() != 1){
        memDay.setDate(memDay.getDate() + 1);
    }

    if (date.getDate() == thanksgivingD.getDate()) isHoliday = true;
}

//Returns the current plan's semester
function getPlanSem(str){
    if (str.indexOf("fall") > -1) return "fall";
    else if (str.indexOf("spring") > -1) return "spring";
    else if (str.indexOf("summer") > -1) return "summer";
}

//Returns the term associated with the given date
function getTerm (month, day, year){
    year += 1900; //yeah...
    
    //Plan starts on a monday on the third week of May and ends on a friday of the 1st week of August
    if (month >= 4 && month <= 7){
        if (!((month == 4 && (day <= 14) ||(month == 7 && (day >= 7))))){     
            var sumStartStr = "May 14, " + year; //we know the term starts some time in May (3rd week)
            var sumStr = new Date(sumStartStr);
            var sumEndStr = "August 1," + year;
            var sumEnd = new Date(sumEndStr);

            while ((sumStr.getDay() != 1)){
                sumStr.setDate(sumStr.getDate() + 1);
            }

            while ((sumEnd.getDay() != 5)){
                sumEnd.setDate(sumEnd.getDate() + 1);
            }  //Friday of the 1st week
        }
    
        
        meals = new mealsInfo("summer", getPlanSem(meals_left_str), sumStr.getDate(), sumStr.getMonth(), sumEnd.getDate(), sumEnd.getMonth());
    }
    
    //Plan starts on a tuesday on the third week of august and ends on a saturday of the 3rd week of August
    else if (month >= 7 && month <= 11){
        if (!((month == 7 && (day <= 14) ||(month == 11 && (day >= 21))))){ //ignore if we're before the third wk of Aug or after the 3rd wk of Dec
            var fallStartStr = "August 14, " + year; //we know the term starts some time in August (3rd week)
            var fallStr = new Date(fallStartStr);
            var fallEndStr = "December 1, " + year; 
            var fallEnd = new Date(fallEndStr);
            
            while ((fallStr.getDay() != 2)){ //tuesday
                fallStr.setDate(fallStr.getDate() + 1);
            }

            while ((fallEnd.getDay() != 6)){ //saturday
                fallEnd.setDate(fallEnd.getDate() + 1);
            }  //Saturday of the 3rd week
        }
        
        meals = new mealsInfo("fall", getPlanSem(meals_left_str), fallStr.getDate(), fallStr.getMonth(), fallEnd.getDate(), fallEnd.getMonth());
    }
    
    //Plan starts on a saturday on the second week of Jan and ends on a Sunday of the 2nd week of May
    else if (month >= 0 && month <= 4){
        if (!((month == 0 && (day <= 7) ||(month == 4 && (day >= 14))))){ //ignore if its before the 2nd wk of Jan or after the 2nd wk of May
            var sprStartStr = "January 1, " + year; //we know the term starts some time in January
            var sprStr = new Date(fallStartStr);
            var sprEndStr = "May 7, " + year; //we know the term ends sometime during the second week
            var sprEnd = new Date(fallEndStr);  

            while ((sprStr.getDay() != 6)){ //saturday
                sprStr.setDate(sprStr.getDate() + 1);
            }

            while ((sprEnd.getDay() != 0)){ //sunday
                sprEnd.setDate(sprEnd.getDate() + 1);
            }  //Sunday of the 2nd week
        }

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
        var curYear = date.getYear();
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
    
}

//Checks whether we are still in the semester time frame
function checkTerm (){
   if (date.getMonth() >= meals.sMonth && date.getMonth() <= meals.eMonth){
        if (!((date.getMonth() == meals.sMonth && (date.getDate() <= meals.sDate)) || (date.getMonth() == meals.eMonth && (date.getDate() >= meals.eDate))) && !isHoliday){
            if (debug) toPrint+= ("Check term: true -> " + meals.semester + "\n\n");
            if (!(meals.planSem != meals.semester) || debug == true){
                return true;
            }
        }
   }
    else return false;
}

//Yeah we need this function since some months change its number of days
//Blast you february
//Also to keep track of months that have 30/31 days
//start - the current month
//numMonths - how many months have passed since the start of the term
function daysinMonth(start, numMonths, year){
    year+=1900;
    var count = 0;
    var i;
    for (i = (start-1); i > (start - numMonths); i--){
        count += new Date(year, i, 0).getDate();
    }
    count+=((new Date(year, meals.sMonth, 0)).getDate() - meals.sDate); //we have to add the remaining days of the initial month
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
            numDays = date.getDate() + daysinMonth(date.getMonth(), numMonths, date.getYear()); //some dates have 31, 30, or 28 (yeah im watching you february) days...
            if (debug) toPrint += ("Calculated number of passed days : " + numDays + "\n\n");
            return numDays;
        }

        else if (per == "week"){
            numWeeks = (Math.floor(date.getDate()/7))+numMonths*4;
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
                if (debug) toPrint+=("Predicted number of meals for ("+timef+") is: "+extraMeals);
            }
            
            else if(timef == "week") {
                extraMeals = avgMealsW*getTimeFrame("week");
                if (debug) toPrint+=("Predicted number of meals for ("+timef+") is: "+extraMeals);
            }
            
            else {
                extraMeals = avgMealsM*getTimeFrame("month"); 
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
            if (str.indexOf(meals.semester) == -1){
                document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 8px;padding-top:20px; padding-bottom:20px;font-size: 1em;text-align: center;"><br>Sorry but you do not currently have a meal plan for the '+ meals.planSem + '.</div>';
            } //if you're looking at a future semester that does not have a meal plan
       
            else document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 8px;padding-top:20px; padding-bottom:20px;font-size: 1em;text-align: center;"><br>Sorry but you do not currently have a meal plan for the '+ meals.semester + '.</div>';
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
    alert("MEAL TRACKER Is supposed to help you plan your meal usage throughout the semester.\n\nClick on one of the buttons (Daily/Weekly/Monthly) to view your number of available meals for your chosen time frame, as well as how many you still have available in order to keep up with your meal plan.\n\nWhat does it mean to have x(+y) meals?\nThis means that you have an average of 'x' meal(s) per day, with an extra 'y' meal(s) for the week.\nEx: 1(+1) -> 1 meal per day with an extra meal for the week.");
}

$(document).ready(function() {

    //check to see whether the html page actually is the dining page
    if($("title").text()== dining){
            initStart();
            initMeals(str);
            calcExtra();
        

            var img = $('<div style = "float:left; padding: 10px; padding-top: 70px;"> <img src = "http://www.webweaver.nu/clipart/img/misc/food/fast-food/hot-dog.png" style = "width:50px; height: 50px;" <br></div>');
            var interrogation = $('<div id = "helpMe" onclick="help()" title = "Help" style = "width: 50px; height: 50px; padding-left: 10px; margin-left: -40px; margin-top: -280px; z-index:2; position:absolute;"><img src = "http://img3.wikia.nocookie.net/__cb20140921131252/criminal-case-grimsborough/images/a/a7/Question_Mark-Icon.png" style = "width:50px; height: 50px;"></div>');
            var bubble = $('<div style = "margin-top:20px;  margin-bottom: 20px; width:300px; height:325px; background:rgb(248, 248, 248); border: 10px solid; border-image: linear-gradient(rgba(50, 104, 153, 0.7), rgba(74, 188, 232, 0.5)) 1 100%; border-radius:15px;">\
                                        <div style = "padding:30px; padding-left: 0px; height: 200px; width: 300px; margin:auto; ">\
                                            <div style = "width: 215px; margin-left: auto; margin-right:auto;"> <span style = "color:#326899; font-size: 2.3em; font-weight: bold;">MEAL</span> <span style = "color: #4abce8; font-size: 2.3em; font-weight: bold;">TRACKER</span><hr style = "width:85%;"></div>\
                                            <div style = "margin:auto; margin-top:10px; width:115px; height:115px;"><img src="http://www.juniata.edu/life/i/redesign/dining/diningicon.png" style = "width:115px; height:115px; "></div>\
                                            <div id = "onDisplay" style = "width:260px; margin:auto;"></div>\
                                                <div style = "padding-left: 25px;width: 250px;  margin-left: auto; margin-right:auto; position:aboslute;">\
                                                    <button id="dailyBut" type="button" style = "width: 60px;box-shadow: none; margin-right:10px; height:25px; background: #006699; border-radius: 5px; font-weight: bold;"><div style = "float:left; color: white;">Daily</div> <div id = "dailyButCircle" style = "margin-left: 38px; margin-top: 4px;width: 7px; height: 7px; box-shadow: 1px 1px 1px #f0ff00; border-radius: 50%; background: #f5ff5a;"></div></button>\
                                                    <button id="weeklyBut" type="button" style = "width: 70px; box-shadow: 2px 2px 1px #888888; margin-right:10px; height:25px; border-radius: 5px; background: #006699; font-weight: bold;"><div style = "float:left; color: white;">Weekly</div> <div id = "weeklyButCircle" style = "margin-left: 48px; margin-top: 4px;width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(rgb(255, 255, 34), orange);"></div></button>\
                                              <button id="monthlyBut" type="button" style = "width: 75px; box-shadow: 2px 2px 1px #888888; margin-right:10px; height:25px; border-radius: 5px; background: #006699; font-weight: bold;"><div style = "float:left; color: white;">Monthly</div> <div id = "monthlyButCircle" style = "margin-left: 53px; margin-top: 4px;width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(rgb(255, 255, 34), orange);"></div></button>\
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
                this.style.backgroundColor = "#3366FF";
                this.style.cursor = "pointer";
            }

            document.getElementById("dailyBut" ).onmouseout = function(){
            this.style.backgroundColor = "#006699";
            }
                        document.getElementById("weeklyBut").addEventListener("click", function(){weeklyFunc()});
            document.getElementById("weeklyBut" ).onmouseover = function(){
                this.style.backgroundColor = "#3366FF";
                this.style.cursor = "pointer";
            }

            document.getElementById("weeklyBut" ).onmouseout = function(){
            this.style.backgroundColor = "#006699";
            }

            document.getElementById("monthlyBut").addEventListener("click", function(){monthlyFunc()});
            document.getElementById("monthlyBut" ).onmouseover = function(){
                this.style.backgroundColor = "#3366FF";
                this.style.cursor = "pointer";
            }

            document.getElementById("monthlyBut" ).onmouseout = function(){
            this.style.backgroundColor = "#006699";
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
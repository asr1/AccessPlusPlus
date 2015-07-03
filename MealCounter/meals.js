//Hackyness is hacky
//This part of the plugin is responsible for keeping track of the amount of meals that the student has

var url = window.location.href;
var dining = "Dining Summary";

var element = $("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children(":nth-child(2)");
var date = new Date(); 
var meals; //object which will contain all of our info
var startMeals; //the number of meals the student has initially
var avgMealsD; //the average number of meals one can have per day with the given meal plan
var avgMealsW; //the average number of meals one can have per week with the given meal plan
var avgMealsM; //the average number of meals one can have per month with the given meal plan

var extraMeals;
var meals_left_str=$("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children().prev().text();
var regex = new RegExp("[0-9]{1,3}") ;
var meals_left= meals_left_str.match(regex)[0];		
var mealLeft = 0;
var timef = "day";
var isHoliday = false;

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

//Meal plan isn't used during hollidays. For now i'm only checking for thanksgiving
function getHoliday(year){
    year+=1900;
    //Thanksgiving fourth thursday of november
    var thanksgivingD = new Date("November 21, " + year);
    while(thanksgivingD.getDay() != 4){
        thanksgivingD.setDate(thanksgivingD.getDate() + 1);
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
            
            while ((fallStr.getDay() != 2)){
                fallStr.setDate(fallStr.getDate() + 1);
            }

            while ((fallEnd.getDay() != 6)){
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

            while ((sprStr.getDay() != 6)){
                sprStr.setDate(sprStr.getDate() + 1);
            }

            while ((sprEnd.getDay() != 0)){
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
        //checks to see what meal plan you have
		//By searching for meal name
        if((str.indexOf("No meal plan") > -1) || (str.indexOf("fall meal plan balance") > -1 && meals_left_str.indexOf("fall") == -1) || (str.indexOf("spring meal plan balance") > -1 && meals_left_str.indexOf("spring") == -1) || (str.indexOf("summer meal plan balance") > -1 && meals_left_str.indexOf("summer") == -1)){
            startMeals = 0;
            avgMealsD = 0;
        }
    
		else if(str.indexOf("Bronze") > -1){
			startMeals = 125;
            avgMealsD = "1 (+1)";
            avgMealsW = 8;
            avgMealsM = 32;            
		}
        
        else if(str.indexOf("Silver") > -1){
			startMeals = 175;
            avgMealsD = "1 (+4)";
            avgMealsW = 11;
            avgMealsM = 44;
		}
        
        else if(str.indexOf("Gold") > -1){
			startMeals = 225;
            avgMealsW = 14;
            avgMealsD = 2;
            avgMealsM = 56;
		}
        
        else if (str.indexOf("Cardinal") > -1){
			startMeals = 275;
            avgMealsW = 17;
            avgMealsD = "2 (+3)";
            avgMealsM = "68";
		}
        
        else if (str.indexOf("Cyclone") > -1){
			startMeals = 304;
            avgMealsW = 19;
            avgMealsD = "2 (+5)";
            avgMealsM = 76;
		}
    
}

//Checks whether we are still in the semester time frame
function checkTerm (){
   if (date.getMonth() >= meals.sMonth && date.getMonth() <= meals.eMonth){
        if (!((date.getMonth() == meals.sMonth && (date.getDate() <= meals.sDate)) || (date.getMonth() == meals.eMonth && (date.getDate() >= meals.eDate))) && !isHoliday) return true;
   }
    else return false;
}

// returns the total number of times the timeF has passed
function getTimeFrame(per){
    var numMonths = 0;
    var numWeeks = 0; 
    var numDays = 0;
    
    if (checkTerm()){
        numMonths = date.getMonth() - meals.sMonth;
        
        if (per == "day"){
            numDays = date.getDate() + numMonths*30; //some dates have 31 days...
            return numDays;
        }

        else if (per == "week"){
            numWeeks = (Math.floor(date.getDate()/7))+numMonths*4;
            return numWeeks;
        }

        else if (per == "month"){
            return numMonths;
        }
    }
}

//Calculates the number of extra meals the student has
function calcExtra (){
    getHoliday(date.getYear()); //???
    var usedMeals = startMeals - meals_left_str;
    var predictedMeals = 0;
    var stat = 0;
    
    //make sure we're still in the term 
    if (checkTerm()){ //check the extremes - make sure we're not before/after the start/end periods nor during a holiday 
            if(timef == "day") {
                extraMeals = avgMealsD;
                
            }
            
            else if(timef == "week") {
                extraMeals = avgMealsW;
                predictedMeals = getTimeFrame("week")*avgMealsW;
                stat = predictedMeals - usedMeals;
                if (stat < 0) extraMeals += stat; //if its negative value then add it to extraMeals
                else extraMeals -= stat;
            }
            
            else {
                extraMeals = avgMealsM; 
            }
    }
}

//Updates the borders around the buttons when one is clicked
function updBorder(id){
    document.getElementById(id).style.border = "2px solid #DE0000";
    if (id != "dailyBut")   document.getElementById("dailyBut").style.border = "2px solid #900";
    if (id != "weeklyBut")   document.getElementById("weeklyBut").style.border = "2px solid #900";
    if (id != "monthlyBut")   document.getElementById("monthlyBut").style.border = "2px solid #900";

}


function updText(timef, avgMeals){
   if (meals.planSem != meals.semester){
        document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMeals+'</b><br><i>Your '+meals.planSem +' meal plan is not currently activated.</i></div>';
        } else if (startMeals == 0){
            document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 8px;padding-top:20px; padding-bottom:20px;font-size: 1em;text-align: center;"><br>Sorry but you do not currently have a meal plan for the '+ meals.semester + '.</div>';
        }else { document.getElementById("onDisplay").innerHTML = '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMeals+'</b><br> You can still have <u><b>'+mealLeft+'</b></u> meal(s) this '+timef+'</div>';
        }
}

function dailyFunc(){
    timef = "day";
    calcExtra();
    updText(timef, avgMealsD);
    updBorder("dailyBut");
}

function weeklyFunc(){
    timef = "week";
    calcExtra();
    updText(timef, avgMealsW);
    updBorder("weeklyBut");
}

function monthlyFunc(){
    timef = "month";
    calcExtra();
    updText(timef, avgMealsM);
    updBorder("monthlyBut");
}

function numMeals(num){
    if(num == "exactly"){
        if (meals.planSem != meals.semester){
            return '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMealsD+'</b><br><i>Your '+meals.planSem +' meal plan is not currently activated.</i></div>';
        } else {
            return '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMealsD+'</B<br> You can still have <u><b>'+mealLeft+'</b></u> meal(s) this '+timef+'</div>';
        }        
    }
    else if(num == "none"){
        return '<div style = "line-height: 150%; padding: 8px;padding-top:20px; padding-bottom:20px;font-size: 1em;text-align: center;"><br>Sorry but you do not currently have a meal plan for the '+ meals.semester + '.</div>';
    }
    else if (num < 0){
          return '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMealsD+'</B<br> Your meal count is below by: <u><b>'+mealLeft+'</b></u></div>';    
    }
    
    else{
            return '<div style = "line-height: 150%; padding: 15px; padding-top:25px; padding-bottom:25px; width:250px;">Total number of Meals for the '+meals.planSem+': <b>'+startMeals+'</b><br>Average number of meals p/ '+timef+' is: <b>'+avgMealsD+'</b><br><i>Your '+meals.planSem +' meal plan is not currently activated.</i></div>';
    }
}

function help(){
    alert("HELP \n\n Select Daily/Weekly/Monthly to view how many meals you have for that time frame and how many you still have available.\n\nWhat does it mean to have 1(+1) meals?\nThis means that you have an average of one meal per day, with an extra one for the week.");
}

$(document).ready(function() {

    //check to see whether the html page actually is the dining page
    if($("title").text()== dining){
            var toAppend = "";
            initStart();
            initMeals(str);
            calcExtra();

            if(extraMeals){
                toAppend = numMeals(extraMeals);
            }

            else if(startMeals == 0){
                toAppend = numMeals("none");
            }   

            else toAppend = numMeals("exactly");


            var img = $('<div style = "float:left; padding: 10px; padding-top: 70px;"> <img src = "http://www.webweaver.nu/clipart/img/misc/food/fast-food/hot-dog.png" style = "width:50px; height: 50px;" <br></div>');
            var interrogation = $('<div id = "helpMe" onclick="help()" title = "Help" style = "width: 35px; height: 35px; padding-left: 10px; margin-left: -30px; margin-top: -280px; z-index:2; position:absolute;"><img src = "http://www.clker.com/cliparts/b/F/3/q/f/M/help-browser-hi.png" style = "width:35px; height: 35px;"></div>');
            var bubble = $('<div style = "margin-top:20px;  margin-bottom: 20px; width:300px; height:325px; background:rgb(248, 248, 248); border: 10px solid; border-image: linear-gradient(to bottom, rgba(0, 3, 173, 0.5), rgba(0, 116, 232, 0.5)) 1 100%;border-radius:15px;">\
                                        <div style = "padding:30px; padding-left: 0px; height: 200px; width: 300px; margin:auto; ">\
                                            <div style = "width: 215px; margin-left: auto; margin-right:auto;"> <span style = "color:#326899; font-size: 2.3em; font-weight: bold;">MEAL</span> <span style = "color: #4abce8; font-size: 2.3em; font-weight: bold;">TRACKER</span><hr style = "width:85%;"></div>\
                                            <div style = "margin:auto; margin-top:10px; width:115px; height:115px;"><img src="http://www.juniata.edu/life/i/redesign/dining/diningicon.png" style = "width:115px; height:115px; "></div>\
                                            <div id = "onDisplay" style = "width:260px; margin:auto;">'+toAppend+'</div>\
                                                <div style = "padding-left: 25px;width: 220px;  margin-left: auto; margin-right:auto; position:aboslute;">\
                                                    <button id="dailyBut" type="button" style = "box-shadow: 3px 3px 1px #888888; margin-right:10px; color: #900; border: 2px solid #DE0000; font-weight: bold;">Daily</button>\
                                                    <button id="weeklyBut" type="button" style = "box-shadow: 3px 3px 1px #888888; margin-right:10px; color: #900; border: 2px solid #900; font-weight: bold;">Weekly</button>\
                                                    <button id="monthlyBut" type="button" style = "box-shadow: 3px 3px 1px #888888; margin-right:10px; color: #900; border: 2px solid #900; font-weight: bold;">Monthly</button>\
                                    </div>\
                                    </div>\
                                    </div>\
                                    </div>\
                                    </div>\
                                    </div>');
            //creates a box to display alert

            bubble.append(interrogation);
            element.append(bubble);
            document.getElementById("dailyBut").addEventListener("click", function(){dailyFunc()});
            document.getElementById("weeklyBut").addEventListener("click", function(){weeklyFunc()});
            document.getElementById("monthlyBut").addEventListener("click", function(){monthlyFunc()});
            document.getElementById("helpMe").addEventListener("click", function(){help()});

        }
    });
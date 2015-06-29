//Hackyness is hacky
//This part of the plugin is responsible for keeping track of the amount of meals that the student has

var url = window.location.href;
var dining = "Dining Summary";

var element = $("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children(":nth-child(2)");

var date = new Date(); 
var meals; //object which will contain all of our info
var startMeals; //the number of meals the student has initially
var avgMeals; //the average number of meals one can have per week with the given meal plan
var extraMeals;
var meals_left_str=$("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children().prev().text();
var regex = new RegExp("[0-9]{1,3}") ;
var meals_left= meals_left_str.match(regex)[0];		

//String containing the student's dining information 
var str =$("td[class='alignvt'][valign='top'][colspan='1'][rowspan='1'][width='19%']").text();

//Initializes the meals object
//semester - the semester associated 
//sDate - start date
//sMonth - start month
//eDate - end date
//eMonth - end month
function mealsInfo(semester, sDate, sMonth, eDate, eMonth){
        this.semester = semester;
		this.sDate = sDate;
		this.sMonth = sMonth;
		this.eDate = eDate;
		this.eMonth = eMonth;
}

function isHoliday(){
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
        
        meals = new mealsInfo("summer", sumStr.getDate(), sumStr.getMonth(), sumEnd.getDate(), sumEnd.getMonth());
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
        
        meals = new mealsInfo("fall", fallStr.getDate(), fallStr.getMonth(), fallEnd.getDate(), fallEnd.getMonth());
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

        meals = new mealsInfo("spring", sprStr.getDate(), sprStr.getMonth(), sprEnd.getDate(), sprEnd.getMonth());
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
        if((str.indexOf("No meal plan") > -1) || (str.indexOf("fall meal plan balance") > -1 && meals.semester != "fall") || (str.indexOf("spring meal plan balance") > -1 && meals.semester != "spring") || (str.indexOf("summer meal plan balance") > -1 && meals.semester != "summer")){
            startMeals = 0;
            avgMeals = 0;
        }
    
		else if(str.indexOf("Bronze") > -1){
			startMeals = 125;
            avgMeals = 8;
		}
        
        else if(str.indexOf("Silver") > -1){
			startMeals = 175;
            avgMeals = 11;
		}
        
        else if(str.indexOf("Gold") > -1){
			startMeals = 225;
            avgMeals = 14;
		}
        
        else if (str.indexOf("Cardinal") > -1){
			startMeals = 275;
            avgMeals = 17;
		}
        
        else if (str.indexOf("Cyclone") > -1){
			startMeals = 304;
            avgMeals = 19;
		}
    
}

//Calculates the number of extra meals the student has
function calcExtra (){
    //make sure we're still in the term 
    if (date.getMonth() >= meals.sMonth && date.getMonth() <= meals.eMonth){
        if (!((date.getMonth() == meals.sMonth && (date.getDate() <= meals.sDate)) || (date.getMonth() == meals.eMonth && (date.getDate() >= meals.eDate)))){
            
        }
    }
}

function numMeals(num){
    if(num == "exactly"){
        return '<div style = "font-size: 0.9em; text-align: center; width: 125px;"><b><br>You have <b>' + num +' </b>the number of expected meals.</b></div>';
    }
    else if(num == "none"){
        return '<div style = "font-size: 0.9em;text-align: center; width: 125px;"><b><br>You do not currently have a meal plan for the '+ meals.semester + '.</b></div>';
    }
    else if (num < 0){
        return '<div style = "font-size: 0.9em; text-align: center; width: 125px;"><b><br>You are currently '+ num +' meals <u>below</u> expected.</b></div>';
    }
    
    else{
        return '<div style = "font-size: 0.9em; text-align: center; width: 125px;"><b><br>You are currently '+ num +' meals <u>above</u> planned.</b></div>';
    }
}

//check to see whether the html page actually is the dining page
if($("title").text()== dining){
    
		initStart();
        initMeals(str);
        calcExtra();
    
		if (startMeals == 0){
            extraMeals = "none";
        }
//        else{
// 	  	   predicted_usage = start_meals - (days_at_school*rate);
//		   extra_meals = meals_left - predicted_usage;       
//        }
		var toAppend = "";
//
//		//are you over or under, sends alert message
//		if(extra_meals>0){
//			toAppend = numMeals(extra_meals);
//		}
//    
//        else if (extra_meals<0){
//			numMeals(-1*extra_meals);
//		}

        if(extraMeals == "none"){
			toAppend = numMeals("none");
		}   


        else toAppend = numMeals("exactly");
		
    
        var img = $('<br><br><div style = "float:left; padding: 10px; padding-top: 70px;"> <img src = "http://www.webweaver.nu/clipart/img/misc/food/fast-food/hot-dog.png" style = "width:50px; height: 50px;" <br></div>')
        var bubble = $('<div style = "width=170px; height=100px; padding-left: 55px; position: absolute;"><img src = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Speech_bubble.svg/1280px-Speech_bubble.svg.png" style = "width:170px; height:100px;"><div style = "z-index: 2;  position: absolute; text-align:center; margin-top: -2.3cm; margin-left: 0.8cm;">'+toAppend+'</div></div>');
		//creates a box to display alert

        element.append(img);
        element.append(bubble);
	}
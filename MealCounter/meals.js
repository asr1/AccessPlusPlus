    //Hackyness is hacky
    //This part of the plugin is responsible for keeping track of the amount of meals that the student has
    var url = window.location.href;
    var dining = "Dining Summary";
    
    var element = $("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children(":nth-child(2)");

var date = new Date(); //The current day
var start;             //The first day of the semester
var start_meals;
var rate;
var days_at_school;
var predicted_usage;
var extra_meals;
var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds 
var meals_left_str=$("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children().prev().text();
var regex = new RegExp("[0-9]{1,3}") ;
var meals_left= meals_left_str.match(regex)[0];
		console.log('meals_left_str');
		

		//gets string from HTML to check using regex
var str =$("td[class='alignvt'][valign='top'][colspan='1'][rowspan='1'][width='19%']").text();
    
    //determines if it is the spring or fall semester, based on 
function initStart(){
		//Before or after July (6)
		if (date.getMonth()<6){
			start = new Date(new Date().getFullYear(),0,12);
		}
        
        else{//It is after July, fall semester
			start = new Date(new Date().getFullYear(),7,24);
		}
}

function initMeals (str){
        //checks to see what meal plan you have
		//By searching for meal name
		if(str.indexOf("Bronze")> -1){
			start_meals = 125;
			rate = 1;
		}
        
        else if(str.indexOf("Silver")> -1){
			start_meals = 175;
			rate = 11.0/7;
		}
        
        else if(str.indexOf("Gold") > -1){
			start_meals = 225;
			rate = 2;
		}
        
        else if (str.indexOf("Cardinal") > -1){
			start_meals = 275;
			rate = 17.0/7;
		}
        
        else if (str.indexOf("Cyclone") > -1){
			start_meals = 304;
			rate=18.0/7;
		}
}

function numMeals(num){
    if(num == "EXACTLY"){
        return "<div><b><br/>You have "+num+" the number of expected meals.</b></div>";
    }
    else{
        return "<div><b><br/>You have "+num+" more meals than planned.</b></div>";
    }
}

//check to see whether the html page actually is the dining page
if($("title").text()== dining){
    
		initStart();
        initMeals(str);
    
		days_at_school = Math.round(Math.abs((new Date().getTime() - start.getTime())/(oneDay)));
		//End weeping
		
	  	predicted_usage = start_meals - (days_at_school*rate);
		extra_meals = meals_left - predicted_usage;
		
		var toAppend;
		
		//are you over or under, sends alert message
		if(extra_meals>0){
			toAppend = numMeals(extra_meals);
		}
    
        else if (extra_meals<0){
			numMeals(-1*extra_meals);
		}
    
        else{
			toAppend = numMeals("EXACTLY");
		}
		
    
        var img = $('<br><div style = "float:left; padding: 10px;"> <img src = "http://www.webweaver.nu/clipart/img/misc/food/fast-food/hot-dog.png" style = "width:50px; height: 50px;" </div>')
		//creates a box to display alert
		element.append(img);
        element.append(toAppend);
	}
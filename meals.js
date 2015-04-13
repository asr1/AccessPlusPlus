
	
	if($("title").text()!= "Dining Summary"){
		function f(){
			return;
		}
	}else{
		var date = new Date(); //The current day
		var start;             //The first day of the semester
		var start_meals;
		var rate;
		var days_at_school;
		var predicted_usage;
		var extra_meals;
		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds //I'd make it a const if I knew how.
		var meals_left_str=$("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children().prev().text();
		var regex = new RegExp("[0-9]{1,3}") ;
		var meals_left= meals_left_str.match(regex)[0];
		console.log('meals_left_str');
		
		//determines if it is the spring or fall semester, based on 
		//Before or after July (6)
		if (date.getMonth()<6){
			start = new Date(new Date().getFullYear(),0,12);
		}else{//It is after July, fall semester
			start = new Date(new Date().getFullYear(),7,24);
		}
		//gets string from HTML to check using regex
		var str =$("td[class='alignvt'][valign='top'][colspan='1'][rowspan='1'][width='19%']").text();
		
		//checks to see what meal plan you have
		//By searching for meal name
		if(str.indexOf("Bronze")> -1){
			start_meals = 125;
			rate = 1;
		}else if(str.indexOf("Silver")> -1){
			start_meals = 175;
			rate = 11.0/7;
		}else if(str.indexOf("Gold") > -1){
			start_meals = 225;
			rate = 2;
		}else if (str.indexOf("Cardinal") > -1){
			start_meals = 275;
			rate = 17.0/7;
		}else if (str.indexOf("Cyclone") > -1){
			start_meals = 304;
			rate=18.0/7;
		}else{
			function t(){
			return;	
			}
		}
		
		//Commence weeping as we calculate how many days we've been at school
		days_at_school = Math.round(Math.abs((new Date().getTime() - start.getTime())/(oneDay)));
		//End weeping
		
	  	predicted_usage = start_meals - (days_at_school*rate);
		extra_meals = meals_left - predicted_usage;
		
		extra_meals = Math.round(extra_meals);
		var toAppend;
		
		//are you over or under, sends alert message
		if(extra_meals>0){
			toAppend = "<b><br/>You have "+extra_meals+" more meals than planned.</b>";
		}else if (extra_meals<0){
			toAppend = "<b><br/>You have "+-1*extra_meals+" fewer meals than planned.</b>";
		}else{
			toAppend = "<b><br/>You have EXACTLY the right amount of meals, good for you!</b>";
		}
		
		//creates a box to display alert
		$("input[name='KEY_CYCL']").next("table").children().children(":nth-child(3)").children(":nth-child(2)").append(toAppend);
	}


	
	
//Adds an export CSV link to the housemates page

var url =  window.location.href;
var accessPlus = "https://accessplus.iastate.edu/RH05/RH958"; //possible url for access plus after first access
var accessPlus2 = "https://accessplus.iastate.edu/servlet/adp.A_Plus";


var done = false;
var table, exportStr;
 if (url.includes(accessPlus) || url == accessPlus2)
 {
	$("body").prepend('<input type="button" id="exportBtn" value="Export Emails">');
		

		
		
		$("#exportBtn").click(function(){

		//Iterate through each cell in the third row
		table = $("table:visible"); 
		table = table[7];
		var done = false;
		
		
		exportStr = "";
		
	
		checkPage();
		

		//Iterate through each link
		$("a").each(function() {
			if($(this).context.innerHTML.includes("Next"))
			{
				console.log($(this));
				window.location.href = $(this).context.href;
				//Chrome hates timeouts for some reason, have to run on every page :/
				return false; //Break statement
			}
		})
		download();
	});
 }
 
 function download()
 {
	 		alert("Attention: please make sure to run this script on every page of housemates. Mailing lists can be made form this script as asw.iastate.edu");//This is the best we can do.
	 	//Download the result
		var blob = new Blob([exportStr], {
			type: "text/plain;charset=utf-8;",
		});
			saveAs(blob, "emails.txt");
 }
 
 function checkPage()
 {
	 for (var i = 0, row; row = table.rows[i]; i++)
		{
			for (var j = 0, col; col = row.cells[j]; j++)
			{
				var str = col.innerHTML;
				var addr = str.split(" ");
				if(str.includes("@"))//We have an email address. It's not a 300 character regex, but it works for this input.
				{
					exportStr += addr[20] + "\r\n";
					continue; //We want to only execute the links once all emails are done.
				}
			}  
		}
 }
 
 
 

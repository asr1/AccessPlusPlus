//Adds an export CSV link to the housemates page

var url =  window.location.href;
var accessPlus = "https://accessplus.iastate.edu/RH05/RH958"; //possible url for access plus after first access
var accessPlus2 = "https://accessplus.iastate.edu/servlet/adp.A_Plus";
 if (url.includes(accessPlus) || url == accessPlus2)
 {
	$("body").prepend('<input type="button" value="Export Emails">').click(function(){ 
		//Iterate through each cell in the third row
		var table = $("table:visible"); 
		table = table[7];
		
		var exportStr = "";
		
		//All on first page
		for (var i = 0, row; row = table.rows[i]; i++)
		{
			for (var j = 0, col; col = row.cells[j]; j++)
			{
				var str = col.innerHTML;
				var addr = str.split(" ");
				console.log(addr);
				
				if(str.includes("@"))//We have an email address. It's not a 300 character regex, but it works for this input.
				{
					exportStr += addr[20] + ",";
				}
			}  
		}
		//Delete the last comma.
		exportStr = exportStr.substr(0, exportStr.length -1);
		var blob = new Blob([exportStr], {
			type: "text/plain;charset=utf-8;",
		});
		saveAs(blob, "emails.csv");
		alert("Attention: please make sure to run this script on every page of housemates. Mailing lists can be made form this script as asw.iastate.edu");
	});
 }
 
 
 

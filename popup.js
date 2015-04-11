

function hello() {
  chrome.tabs.executeScript({
    file: 'alert.js'
  }); 
}
 document.getElementById("clickme").addEventListener("click", function(){
    document.getElementById("demo").innerHTML = "Hello World";
});
//document.getElementById("clickme").addEventListener("click", hello);
//alert("Running");
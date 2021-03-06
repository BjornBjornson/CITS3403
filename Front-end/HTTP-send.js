var http = null;
	
	function validate(){  // This validates the shape of a login request. Not a particularly in-depth validation, but better than nought.
		var Pass = document.getElementById("Password").value;
		var mail = document.getElementById("Email").value;
		var valid = true;
		if( Pass.length < 7 ){ //checking password meets length requirement
			alert("Your Password must be at least 7 characters long");
			valid = false;
		}
		else{ //at this point password has been ok'd
			var locA = mail.indexOf("@");// this bit checks to see if the email is roughly the right shape.
			var locD = mail.lastIndexOf(".");
			if ( (locA < 1) || ( locD - locA < 2 ) ) {// making sure that the last '.' is after the '@'
				alert("Enter a valid email address");
			valid = false;
			}
		}
		if(valid){
			document.getElementById('myForm').submit();//submits the login request.
		}
		else{
			return valid;
		}	
	}
		
	function validateSignup(){ //checks that the signup details are roughly the right shape.
		var User= document.getElementById("Username").value;
		var Pass = document.getElementById("Password").value;
		var mail = document.getElementById("Email").value;
		var valid = true;
		//Makes sure the user details are in a close-to-correct shape
		if( (User == "") || (User.search(/\W/i)!=-1) ) 	{
			alert( "Please provide a name using only numbers and letters." );
			valid = false
		}
		else if( Pass.length < 7 ){
			alert("Your Password must be at least 7 characters long");
			valid = false;
		}
		else{
			var locA = mail.indexOf("@");
			var locD = mail.lastIndexOf(".");
			if ( (locA < 1) || ( locD - locA < 2 ) ) {
				alert("Enter a valid email address");
				valid = false;
			}
		}
		if(valid){
			document.getElementById('myForm').submit();
		}
		return valid;
	}
	
	//on page load checks the user's group panel can be filled out, and drops the time at the bottom of the page.
	//also triggers putting in the logout link.
	function toLoad(){
		fetchMyTeams();
		var time = new Date();
		document.getElementById('footTime').innerHTML = "It is now: " +time.getHours()+":"+time.getMinutes()+":"+time.getSeconds()+ "    Last updated on: 10/4/17" ;
	}
	
	function toGroupPage(group){ //navigates to the a group's page on request.
		var whereTo ="groupPage?"+group;
		alert(whereTo);
		window.location = whereTo;
	}
	
	//populates the mygroups window
	function fetchMyTeams(){
		http = new XMLHttpRequest();
		http.onreadystatechange = showTeams; //will need to debug before posting.
		http.open("GET", "http://localhost:3000/mygroups", true); //currently a-synchronous iirc, also limited to self hosted servers.
		http.send();
		//document.getElementById('myGroups').innerHTML = "<table><tr><td>'This could take a moment, please wait'</td></tr></table>"; // optional loading text.
	}
	
	function showTeams(){ // if the user is logged in, this will show their groups.
		if (http.readyState==4) {
			if(http.responseText=="You're not logged in"){ //general no-session response.
				document.getElementById('myGroups').innerHTML ="<tr><td class='searchReturn'>Log in to see more!</td></tr>";
			}
			else{
				document.getElementById('logoutLink').innerHTML = 'Logout'; //it also triggers the display of the logout link.
				var myArray = JSON.parse(http.responseText);
				var myTable = "<table class='tablePrint' id='groupList'>";
				for(var a=0; a<myArray.length;a++){
					for(var key in myArray[a]){
						console.log(myArray[a][key]);
						myTable +="<tr class='collapsedRow'><td class='searchReturn'><a class='buttonInterior' href='groupPage?groupName="+myArray[a][key]+"'>"+myArray[a][key]+"</a></td></tr>";
					}
				}
				myTable+="<tr class='collapsedRow'><td class='searchReturn'><a class='buttonInterior' href='groupCreate'>Start a new group</a></td></tr></table>";
				document.getElementById('myGroups').innerHTML = myTable;
			}
		}
	}
	
	
	//creates the resultant search table from theoretical data returned from the database
	function createTable(){
		//Just a catch in case they've not logged in. Probably going to be replaced with serverside redirects using passport's session storage.
		var bod = "game="+document.getElementById('Game').value+"&role="+document.getElementById('role').value+"&mode="+document.getElementById('mode').value;
		http = new XMLHttpRequest();
		
		http.onreadystatechange = populateTable; 
		http.open("POST", "http://localhost:3000/myGroupSearch", true); //currently a-synchronous iirc
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		http.send(bod);
		alert(bod);
		return false;
	}
	
	
	function populateTable(){ //populates createTable's table.
		if(http.readyState==4){
			if(http.responseText=="You're not logged in"){
				document.getElementById('tablePrint').innerHTML ="<tr><td class='searchReturn'>Log in to see that!</td></tr>";
			}
			else{
				var myArray = JSON.parse(http.responseText);
				var myTable= "";
				for(var b in myArray[0]){	
					if (myArray[0][b] == "No results found"){
						myTable = "<tr><td class='searchReturn'>"+myArray[0][b]+"</td></tr>";
					}
					else{
						for(var a=0; a<myArray.length; a++){
							for(var key in myArray[a]){
								myTable +="<tr><td class='searchReturn'>"+myArray[a][key]+"</td> <td class='searchReturn'><button type='button' onclick='toGroupPage("+'"groupName='+myArray[a][key]+'"'+");'>View Group</button></td></tr>";
							}
						}
					}
				document.getElementById('tablePrint').innerHTML = myTable;
				}
			}
			
		}
	}

	/*-----------------------------------------------------------------------------------------------
							messaging stuff
	----------------------------------------------------------------------------------------------*/
//will need this later
var globalConvId = ''

//
function toLoadMail() {
	findChats()
	var time = new Date()
	document.getElementById('footTime').innerHTML = "It is now: " +time.getHours()+":"+time.getMinutes()+":"+time.getSeconds()+ "     Last updated on: 10/4/17" 
}

//find all conversations the logged in user is participating in
function findChats() {
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if(xhttp.readyState == 4) {
            if(xhttp.responseText=="You're not logged in") {
				document.getElementById('mailbox').innerHTML ="<tr><td class='searchReturn'>Log in to see more!</td></tr>"

			} else if( xhttp.responseText == "No conversations") {	
          		document.getElementById('inbox').innerHTML = 'No chats to display'

        	} else {
				//create a table of buttons, one for each conversation
                document.getElementById('logoutLink').innerHTML = 'Logout'
				var chatArray = JSON.parse(xhttp.responseText)
                var chatTable = document.createElement('TABLE')
                chatTable.id = 'inboxList'
                chatTable.class = 'jsmail'
				for(var i = 0 ; i < chatArray.length ; i++) {
					console.log(chatArray[i]);
                    var tr = document.createElement('TR')	
                    var td = document.createElement('TD')
					var btn = document.createElement('BUTTON')
                    btn.innerHTML = ''
                    btn.id = chatArray[i]._id.toString()
					btn.style.padding = '10px'
					btn.style.borderStyle = 'solid'
					console.log(btn.id)
					//when you press a conversation button, the chat history shows up in the div next door
                    btn.addEventListener("click", function () {
						findHistory(btn.id)
					})
					for(var j = 0 ; j < chatArray[i].participants.length ; j++){
						console.log(chatArray[i].participants[j])
                        btn.innerHTML += '- ' + chatArray[i].participants[j].username + ' 	'
                    }
					td.appendChild(btn)
                    tr.appendChild(td)
                    chatTable.appendChild(tr)
				}
                document.getElementById('inbox').innerHTML = ''
				document.getElementById('inbox').appendChild(chatTable)
            }
		}
    }
    xhttp.open('GET', 'http://localhost:3000/mail/list', true)
    xhttp.send()
}

//hit up the server and get the chat history from the db
function findHistory( convId ) {
	//probably not best to do but easy way to pass this to next func
	globalConvId = convId
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if(xhttp.readyState == 4) {
			if(xhttp.responseText=="You're not logged in") {
				document.getElementById('mailbox').innerHTML ="<tr><td class='searchReturn'>Log in to see more!</td></tr>"
			} else if( xhttp.responseText == "No messages" ) {
				document.getElementById('conversation').innerHTML = 'You have no messages'
			} else {
				//make a basic table to emulate a chat window, populate it with previous messages
				var msgArray = JSON.parse(xhttp.responseText)
				var msgTable = document.createElement('TABLE')
				msgTable.id = 'history'
				msgTable.class = 'jsmail'
				for(var i = 0 ; i < msgArray.length ; i++) {
							
						console.log(msgArray[i])
						var tr = document.createElement('TR')
						var td = document.createElement('TD')
						td.innerHTML = 'From: ' + msgArray[i].author.username + '</br>' + msgArray[i].message + '</br>' + msgArray[i].timestamp.toString()
						tr.appendChild(td)
						msgTable.appendChild(tr)
				}
				document.getElementById('conversation').innerHTML = ''
				document.getElementById('conversation').appendChild(msgTable)
				//cant refresh automatically when another user sends a message, so give em a button to hit every few seconds
				document.getElementById('refresh').addEventListener('click', function () {
					findHistory(convId)
				})
			}
		}	
    }
	var params = JSON.stringify({ convId: convId })
    xhttp.open('GET', 'http://localhost:3000/mail/conversation')
    xhttp.send(params)
}

//send a message to be stored
function sendReply() {
	console.log('check6')
	var xhttp = new XMLHttpRequest()
	xhttp.onreadystatechange = function () {
		if(xhttp.readyState == 4) {
			if(xhttp.responseText=="You're not logged in") {
				document.getElementById('mailbox').innerHTML ="<tr><td class='searchReturn'>Log in to see more!</td></tr>"
			} else {
				//when message is sent, refresh chat window
				findHistory(globalConvId)
			}
		}
	}
	var msg = document.querySelector('#replyText').value
	var params = JSON.stringify({ convId: globalConvId, newMsg: msg })
	xhttp.open('POST', 'http://localhost:3000/mail/conversation')
	xhttp.send(params)
}

var text = '{ "thisIsATest": "banana Republic" }'; // this is the body of the request
				var x = new XMLHttpRequest(); 
        alert("handshake initiating"); //diagnostic
				x.open("post", "http://localhost:3000"); //TODO: change to HTTPS in the near future
				//x.setRequestHeader("Content-type", "application/json"); something wrong with this bit, server failed to receive it.
				x.send(text); //sends request
        x.close();
				alert("Connection severed"); //diagnostic
				sessionStorage.setItem("longString", "0"); // stand in for authorisation token
				alert("saved");  //diagnostic
				window.location = "Home.html"; //should redirect to page. currently does not work for provided HTML page.

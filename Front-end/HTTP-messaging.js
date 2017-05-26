
function findChats() {
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if(this.readyState == 4 && this.status == 200) {
            if(xhttp.responseText=="You're not logged in") {
				document.getElementById('mailbox').innerHTML ="<tr><td class='searchReturn'>Log in to see more!</td></tr>"
			} else {
                document.getElementById('logoutLink').innerHTML = 'Logout'
				var chatArray = JSON.parse(http.responseText)
                var chatTable = document.createElement('TABLE')
                chatTable.id = 'inboxList'
                chatTable.class = 'mail'
				for(var i = 0 ; i < chatArray.length ; i++) {
					console.log(chatArray[i]);
                    var tr = document.createElement('TR')
                    var td = document.createElement('TD')
                    td.innerHTML = ''
                    td.id = toString(chatArray[i]._id)
                    td.onclick = 'findHistory('+td.id+')'
					for(var j = 0 ; j < chatArray[i].length ; j++){
						console.log(chatArray[i][j])
                        td.innerHTML += '- ' + chatArray[i][j].username
                    }
                    tr.appendChild(td)
                    chatTable.appendChild(tr)
				}
				/*chatTable+="<tr class='collapsedRow'><td class='searchReturn'>Start a new chat</a></td></tr></table>"
                chatTable+="<tr class='collapsedRow'><td><input type='text' id='newChat' placeholder='Enter usernames'></input></td>"
                chatTable+="<td><input type='button' onsubmit='" */
                document.getElementById('inbox').innerHTML = ''
				document.getElementById('inbox').appendChild(chatTable)
            }
        } else if( this.status == 204) {
            document.getElementById('inbox').innerHTML = 'No chats to display'
        }

    }
    xhttp.open('GET', 'http://localhost:3000/mail', true)
    xhttp.send()
}

function findHistory( convId ) {
    document.getElementById('replyForm').action = 'http://localhost:3000/mail/:' + convId
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if(this.readyState == 4 && this.status == 200) {
            var msgArray = JSON.parse(http.responseText)
            var msgTable = document.createElement('TABLE')
            msgTable.id = 'history'
            msgTable.class = 'mail'
            for(var i = 0 ; i < msgArray.length ; i++) {
                        
                    console.log(msgArray[i])
                    var tr = document.createElement('TR')
                    var td = document.createElement('TD')
                    td.innerHTML = 'From: ' + msgArray[i].author.username + '</ br>' + msgArray[i].message + '</br>' + msgArray[i].timestamp.toString()
                    tr.appendChild(td)
                    msgTable.appendChild(tr)
            }
            document.getElementById('conversation').innerHTML = ''
            document.getElementById('conversation').appendChild(msgTable)
            document.getElementById('refresh').addEventListener('click//', findHistory(convId))
        } else if( this.status == 204 ) {
            document.getElementById('conversation').innerHTML = 'You have no messages'
        }
    }

    xhttp.open('GET', 'http://localhost:3000/mail/:'+convId)
    xhttp.send()
}




//document.getElementById('sendButton').addEventListener('click', sendReply())
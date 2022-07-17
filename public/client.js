const socket = io()

let name;

let textarea = document.querySelector('#textarea')

let messageArea = document.querySelector('.message__area')

do{
    name = prompt('Please enter your name: ')
}while(!name)



textarea.addEventListener('keyup', (e)=>{
    if(e.key === 'Enter'){
        sendMessage(e.target.value)
    }
})

function sendMessage(message){
    let msg ={
        user: name,
        message: message.trim()
    }
    //append message in box
    appendMessage(msg, 'outgoing')
    textarea.value = ''
    scrolltobottom()

    //send to server
    socket.emit('message',msg)

}

function appendMessage(msg, type){
    let mainDiv = document.createElement('div')
    let className = type
    mainDiv.classList.add(className, 'message')

    let markup = `
    <h4>${msg.user}</h4>
    <p>${msg.message}</p>

    `
    mainDiv.innerHTML = markup

    messageArea.appendChild(mainDiv)
}

//recieve messages

socket.on('message', (msg)=>{
    // console.log(msg)
    appendMessage(msg, 'incoming')
    scrolltobottom();
})

function scrolltobottom(){
    messageArea.scrollTop = messageArea.scrollHeight
}



socket.emit('new-user-joined', name);

//if a new user joins , recieve his/her name from the server
socket.on('user-joined', name =>{
    append(`${name} joined the chat`, 'incoming');
})


//if user leaves the chat , append the info to the container
socket.on('left', name =>{
    append(`${name} left the chat`, 'incoming');
})

//Function which will append event info to the container
const append = (message, position)=>{
    const messageElement = document.createElement('div');
    // messageElement.innerText = message;
    messageElement.classList.add(position,'message');
    let markup = `
    <h4>${message.user}</h4>
    <p>${message.message}</p>

    `

    messageArea.appendChild(markup);
    }


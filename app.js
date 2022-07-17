const express = require('express')

const app = express()
const path = require("path");
const fs = require("fs");
const http = require('http').createServer(app)
const PORT = process.env.PORT || 5000
const bodyparser = require("body-parser")



// connecting mongoose with mongodb
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/OurApp', {useNewUrlParser: true, useUnifiedTopology: true});

//Define mongoose schema
const guestSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
  });

const guest = mongoose.model('guest', guestSchema);





const users ={ };

http.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`)
})


app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded())
app.set('view engine', 'ejs') // Set the template engine as ejs
app.set('views', path.join(__dirname, 'views')) // Set the views directory

app.get('/', (req,res) =>{
    const params = { }
    res.status(200).render('home-guest.ejs',params);
})


app.post('/dashboard', async (req,res) =>{
    const myData = new guest(req.body);
    const result = await guest.findOne({name : myData.name, password: myData.password});
    if(result.name ===myData.name && result.password === myData.password)
       {
           res.status(200).render('home-dashboard.ejs');
       }
       else
       {
           res.render("present.ejs")
        // res.render('home-dashboard.ejs');

       } 
})

app.post('/Guest', (req,res) =>{
    var myData = new guest(req.body);

    guest.findOne({$or:[{name:myData.name} ,{email: myData.email}]}, (err, existingUser)=>{
    if(existingUser ===null)
    {
        myData.save().then(()=>{
            // res.send("This item has been saved to the database")
            res.render("home-dashboard.ejs");
    
        }).catch(()=>{
            res.status(400).send("item was not saved to the database")
        });
}
    else{
        // res.render("present.ejs");
        res.render("home-dashboard.ejs");
    }
    })
});




//socket for chat box

const io = require('socket.io')(http)

io.on('connection', (socket) =>{
    console.log('connected....')
    // if any new user joins , let other users connected to the server know!
    socket.on('new-user-joined', name =>{
        console.log("New user", name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('message', (msg)=>{
        // console.log(msg)
        socket.broadcast.emit('message', msg)
    });

        // if someone leaves the chat , let others know
        socket.on('disconnect', message =>{
            socket.broadcast.emit('left', users[socket.id]);
            delete users[socket.id];
        });
});


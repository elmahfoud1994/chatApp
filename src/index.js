const express=require('express')
const path=require('path')
const http=require('http')
const socketio=require('socket.io')
const Filter=require('bad-words')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 3000
const publicDirectory = path.join(__dirname,'../public')
const {gernerateMessage}=require('./utils/messges')
const {generateLocation}=require('./utils/locations')
const {addUser,getUser,removeUser,getUsersInRoom}=require('./utils/users')
app.use(express.static(publicDirectory))
io.on('connection',(socket)=>{
    console.log("new web socket connection")
    socket.on('Send Message',(message,callback)=>{
        const user=getUser(socket.id)
        if(!user){
            return callback('user not found')
        }
        const filter=new Filter()
        if(filter.isProfane(message)){
            return  callback("this is not allowed")
        }
        io.to(user.room).emit('message',gernerateMessage(message,user.username))
        callback()
    })
    socket.on('Send Location',(location,callback)=>{
        const user=getUser(socket.id)
        if(user){
            io.emit('locationMessage',generateLocation(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`,user.username))
            return callback()
        }
        callback('user not found')
    })
    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',gernerateMessage('Welcome!','Admin'))
        socket.broadcast.to(user.room).emit('message',gernerateMessage(`${user.username} has joined!`,'Admin'))
       
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',gernerateMessage(user.username+' a user has left','Admin'))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

})


app.get('/',(req,resp)=>{
    resp.render('index')
})

server.listen(port,()=>console.log('listening on port :',port))
const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const { generateMessage, generateLocationMessage } = require("./utils/messages.js")
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users.js")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

io.on("connection", (socket) => {
    console.log("New WebSocket connection")

    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }
        
        socket.join(user.room)
        
        socket.emit("message", generateMessage("Welcome!"))
        socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined!`))

        callback()
    })
    
    socket.on("sendMessage", (message, callback) => {
        io.to("LA").emit("message", generateMessage(message))
        callback()
    })
    
    socket.on("sendLocation", (position, callback) => {
        io.emit("locationMessage", generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        console.log(user)
        if (user) {
            io.to(user.room).emit("message", generateMessage(`${user.username} has left!`))
        }
    })
}) 

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})

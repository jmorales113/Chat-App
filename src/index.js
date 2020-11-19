const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const { generateMessage } = require("./utils/messages.js")
const { generateLocationMessage } = require("./utils/messages.js")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

io.on("connection", (socket) => {
    console.log("New WebSocket connection")

    socket.emit("message", generateMessage("Welcome!"))
    socket.broadcast.emit("message", generateMessage("A new user has joined!"))
    
    socket.on("sendMessage", (message, callback) => {
        io.emit("message", generateMessage(message))
        callback()
    })
    
    socket.on("sendLocation", (position, callback) => {
        io.emit("locationMessage", generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

    socket.on("disconnect", () => {
        io.emit("message", generateMessage("A user has left!"))
    })
}) 

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})

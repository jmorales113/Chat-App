const socket = io()

socket.on("message", (msg) => {
    console.log(msg)
})

document.querySelector("#form").addEventListener("submit", (e) => {
    e.preventDefault()

    const message = document.querySelector("#message").value
    
    socket.emit("sendMessage", message)
})
const socket = io()

socket.on("message", (msg) => {
    console.log(msg)
})

document.querySelector("#form").addEventListener("submit", (e) => {
    e.preventDefault()

    const message = document.querySelector("#message").value

    socket.emit("sendMessage", message)
})

document.querySelector("#location").addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.")
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const long = position.coords.longitude

        socket.emit("sendLocation", {
            latitude: lat, 
            longitude: long
        })
    })
})
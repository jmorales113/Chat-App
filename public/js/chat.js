const socket = io()

// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = document.querySelector("#message-input")
const $messageFormButton = document.querySelector("#message-button")
const $locationButton = document.querySelector("#location-button")
const $messages = document.querySelector("#messages")

const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML

socket.on("message", (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        msg
    })
    $messages.insertAdjacentHTML("beforeend", html)
})

socket.on("locationMessage", (url) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        url
    })
    $messages.insertAdjacentHTML("beforeend", html)
})

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute("disabled", "disabled")

    const message = document.querySelector("#message-input").value

    socket.emit("sendMessage", message, (error) => {
        
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value = ""
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log("Message delivered!")
    })
})

$locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.")
    }

    $locationButton.setAttribute("disabled", "disabled")

    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const long = position.coords.longitude

        socket.emit("sendLocation", {
            latitude: lat, 
            longitude: long
        }, () => {
            $locationButton.removeAttribute("disabled")
            console.log("location shared!")
        })
    })
})
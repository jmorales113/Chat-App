const socket = io()

// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = document.querySelector("#message-input")
const $messageFormButton = document.querySelector("#message-button")
const $locationButton = document.querySelector("#location-button")
const $messages = document.querySelector("#messages")

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscoll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight * newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("message", (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format("M/DD/YYYY h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscoll()
})

socket.on("locationMessage", (urlMessage) => {
    console.log(urlMessage)
    const html = Mustache.render(locationMessageTemplate, {
        username: urlMessage.username,
        url: urlMessage.url,
        createdAt: moment(urlMessage.createdAt).format("M/DD/YYYY h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscoll()
})

socket.on("roomList", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
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

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})
// chat.js
// Client-side Socket.IO logic

const socket = io()
const chatBox = document.getElementById("chat-box")
const roomSelect = document.getElementById("room-select")
const messageInput = document.getElementById("message-input")
const typingDiv = document.getElementById("typing-indicator")

// -------------------- REGISTER USER --------------------
const username = localStorage.getItem("username")
socket.emit("register-user", username)

// -------------------- JOIN ROOM --------------------
function joinRoom() {
    const room = roomSelect.value
    socket.emit("join-room", room)
}

// -------------------- LEAVE ROOM --------------------
function leaveRoom() {
    const room = roomSelect.value
    socket.emit("leave-room", room)
}

// -------------------- SEND GROUP MESSAGE --------------------
function sendGroupMessage() {
    const room = roomSelect.value
    const message = messageInput.value
    if (!room) return alert("Please join a room first")
    if (!message.trim()) return alert("Cannot send empty message")
    socket.emit("group-message", { from_user: username, room, message })
    messageInput.value = ""
}

// -------------------- SEND PRIVATE MESSAGE --------------------
function sendPrivateMessage(to_user) {
    const message = messageInput.value
    if (!message.trim()) return alert("Cannot send empty message")
    socket.emit("private-message", { from_user: username, to_user, message })
    messageInput.value = ""
}

// -------------------- TYPING INDICATOR --------------------
messageInput.addEventListener("input", () => {
    const to_user = null // For group chat, null; for 1-to-1, set recipient
    socket.emit("typing", { from_user: username, to_user })
})

socket.on("typing", (data) => {
    typingDiv.textContent = `${data.from_user} is typing...`
    setTimeout(() => typingDiv.textContent = "", 2000)
})

// -------------------- RECEIVE MESSAGES --------------------
socket.on("group-message", (data) => {
    chatBox.innerHTML += `<p><b>${data.from_user}:</b> ${data.message}</p>`
})

socket.on("private-message", (data) => {
    chatBox.innerHTML += `<p><b>Private from ${data.from_user}:</b> ${data.message}</p>`
})

socket.on("system-message", (msg) => {
    chatBox.innerHTML += `<p style="color: gray;"><i>${msg}</i></p>`
})

// -------------------- LOAD PREVIOUS MESSAGES --------------------
socket.on("previous-messages", (messages) => {
    messages.forEach(msg => {
        chatBox.innerHTML += `<p><b>${msg.from_user}:</b> ${msg.message}</p>`
    })
})
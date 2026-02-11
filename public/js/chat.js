// chat.js
document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    // DOM Elements
    const chatBox = document.getElementById("chat-box");
    const roomSelect = document.getElementById("room-select");
    const messageInput = document.getElementById("message-input");
    const typingDiv = document.getElementById("typing-indicator");

    const joinBtn = document.getElementById("join-btn");
    const leaveBtn = document.getElementById("leave-btn");
    const sendBtn = document.getElementById("send-btn");
    const logoutBtn = document.getElementById("logout-btn");

    // Private message elements
    const privateUserInput = document.getElementById("private-user");
    const privateMessageInput = document.getElementById("private-message");
    const sendPrivateBtn = document.getElementById("send-private-btn");

    // -------------------- REGISTER USER --------------------
    const username = localStorage.getItem("user");
    if (!username) {
        window.location.href = "/views/login.html";
        return;
    }
    document.getElementById("username-display").innerText = username;
    socket.emit("register-user", username);

    // -------------------- JOIN ROOM --------------------
    function joinRoom() {
        const room = roomSelect.value;
        socket.emit("join-room", room);
    }

    // -------------------- LEAVE ROOM --------------------
    function leaveRoom() {
        const room = roomSelect.value;
        socket.emit("leave-room", room);
        chatBox.innerHTML += `<p style="color: gray;"><i>You left room: ${room}</i></p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // -------------------- SEND GROUP MESSAGE --------------------
    function sendGroupMessage() {
        const room = roomSelect.value;
        const message = messageInput.value.trim();
        if (!room) return alert("Please join a room first.");
        if (!message) return alert("Cannot send empty message.");

        socket.emit("group-message", { from_user: username, room, message });
        messageInput.value = "";
    }

    // -------------------- SEND PRIVATE MESSAGE --------------------
    function sendPrivateMessage() {
        const toUser = privateUserInput.value.trim();
        const message = privateMessageInput.value.trim();
        if (!toUser || !message) return alert("Enter recipient and message");

        socket.emit("private-message", { from_user: username, to_user: toUser, message });
        privateMessageInput.value = "";
        chatBox.innerHTML += `<p style="color: purple;"><b>Private to ${toUser}:</b> ${message}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // -------------------- TYPING INDICATOR --------------------
    messageInput.addEventListener("input", () => {
        socket.emit("typing", { from_user: username, to_user: null });
    });

    socket.on("typing", (data) => {
        typingDiv.textContent = `${data.from_user} is typing...`;
        setTimeout(() => typingDiv.textContent = "", 2000);
    });

    // -------------------- RECEIVE MESSAGES --------------------
    socket.on("group-message", (data) => {
        chatBox.innerHTML += `<p><b>${data.from_user}:</b> ${data.message}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    socket.on("private-message", (data) => {
        chatBox.innerHTML += `<p style="color: purple;"><b>Private from ${data.from_user}:</b> ${data.message}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    socket.on("system-message", (msg) => {
        chatBox.innerHTML += `<p style="color: gray;"><i>${msg}</i></p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    // -------------------- LOAD PREVIOUS MESSAGES --------------------
    socket.on("previous-messages", (messages) => {
        messages.forEach(msg => {
            chatBox.innerHTML += `<p><b>${msg.from_user}:</b> ${msg.message}</p>`;
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    // -------------------- LOGOUT --------------------
    function logout() {
        localStorage.removeItem("user");
        window.location.href = "/views/login.html";
    }

    // -------------------- EVENT LISTENERS --------------------
    joinBtn.addEventListener("click", joinRoom);
    leaveBtn.addEventListener("click", leaveRoom);
    sendBtn.addEventListener("click", sendGroupMessage);
    logoutBtn.addEventListener("click", logout);
    sendPrivateBtn.addEventListener("click", sendPrivateMessage);
});
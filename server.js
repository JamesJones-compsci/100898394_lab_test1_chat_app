// server.js
// Express + Socket.IO + Mongoose backend

// -------------------- IMPORT MODULES --------------------
require("dotenv").config()

const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")

const User = require("./models/User")
const GroupMessage = require("./models/GroupMessage")
const PrivateMessage = require("./models/PrivateMessage")


// -------------------- EXPRESS SETUP --------------------
const app = express()
const SERVER_PORT = process.env.PORT || 3000

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")))

// Use body parser to parse JSON
app.use(bodyParser.json())

// -------------------- MONGODB CONNECTION --------------------

mongoose.connect(process.env.MONGO_URI)

const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))
db.once("open", () => console.log("Connected to MongoDB"))


// -------------------- EXPRESS ROUTES --------------------

// Signup route
app.post("/api/signup", async (req, res) => {
    const { username, firstname, lastname, password } = req.body
    try {
        const newUser = new User({ username, firstname, lastname, password })
        await newUser.save()
        res.json({ message: "Signup successful" })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "Username already exists" })
        }
        res.status(500).json({ error: err.message })
    }
})

// Login route
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await User.findOne({ username, password })
        if (!user) return res.status(400).json({ error: "Invalid credentials" })
        res.json({ message: "Login successful", username: user.username })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// -------------------- START SERVER --------------------
const server = http.createServer(app)
const io = socketio(server)

// -------------------- ONLINE USERS TRACKING --------------------
const onlineUsers = {} // username -> socket.id

// -------------------- SOCKET.IO EVENTS --------------------
io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`)

    // -------------------- REGISTER USER --------------------
    socket.on("register-user", (username) => {
        onlineUsers[username] = socket.id
        socket.username = username
        console.log(`User registered: ${username} -> ${socket.id}`)
    })

    // -------------------- JOIN ROOM --------------------
    socket.on("join-room", async (room) => {
        socket.join(room)
        socket.currentRoom = room
        io.to(room).emit("system-message", `${socket.username} joined room: ${room}`)

        // Send previous messages
        const previousMessages = await GroupMessage.find({ room }).sort({ date_sent: 1 })
        socket.emit("previous-messages", previousMessages)
    })

    // -------------------- LEAVE ROOM --------------------
    socket.on("leave-room", (room) => {
        socket.leave(room)
        socket.currentRoom = null
        io.to(room).emit("system-message", `${socket.username} left room: ${room}`)
    })

    // -------------------- GROUP MESSAGE --------------------
    socket.on("group-message", async (data) => {
        // Ensure user is in the room
        if (!socket.currentRoom || socket.currentRoom !== data.room) {
            return socket.emit("system-message", "You must join the room before sending messages")
        }
        const newMessage = new GroupMessage(data)
        await newMessage.save()
        io.to(data.room).emit("group-message", data)
    })

    // -------------------- PRIVATE MESSAGE --------------------
    socket.on("private-message", async (data) => {
        const targetSocket = onlineUsers[data.to_user]
        if (!targetSocket) {
            return socket.emit("system-message", `${data.to_user} is not online`)
        }
        const newPrivate = new PrivateMessage(data)
        await newPrivate.save()
        // Send to recipient
        io.to(targetSocket).emit("private-message", data)
        // Send to sender as confirmation
        socket.emit("private-message", data)
    })

    // -------------------- TYPING INDICATOR --------------------
    socket.on("typing", (data) => {
        const targetSocket = onlineUsers[data.to_user]
        if (targetSocket) {
            io.to(targetSocket).emit("typing", { from_user: data.from_user })
        }
    })

    // -------------------- DISCONNECT --------------------
    socket.on("disconnect", () => {
        for (const [user, id] of Object.entries(onlineUsers)) {
            if (id === socket.id) {
                delete onlineUsers[user]
                console.log(`User ${user} disconnected`)
                break
            }
        }
        console.log(`Socket disconnected: ${socket.id}`)
    })
})

// -------------------- LISTEN --------------------
server.listen(SERVER_PORT, () => {
    console.log(`Server running on http://localhost:${SERVER_PORT}`)
})
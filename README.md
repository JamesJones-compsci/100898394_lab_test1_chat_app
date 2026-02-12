# Lab Test 1 Chat Application

## Overview
This is a real-time chat application built using **Node.js**, **Express**, **Socket.IO**, and **MongoDB**.  
It allows multiple users to:

- Join different chat rooms  
- Send **group messages**  
- Send **private messages** to other users  
- See who is typing  
- Leave rooms and logout  

The app is intended for educational purposes as part of a college lab assignment.

---

## Features

1. **User Signup & Login**
   - Sign up with username, first name, last name, and password.
   - Login redirects to the chat page.

2. **Chat Rooms**
   - Users can join or leave rooms (DevOps, Cloud Computing, Covid19, Sports, NodeJS).  
   - Messages in a room are visible to all users in that room.  
   - System messages show when users join or leave rooms.

3. **Private Messaging**
   - Send private messages to any registered user.
   - Private messages appear in purple in the chat box.

4. **Typing Indicator**
   - Shows when another user is typing a message.

5. **Logout**
   - Clear session and return to login page.

---

## Requirements

- Node.js (v18+ recommended)  
- MongoDB instance (local or cloud)  
- Internet connection to load Bootstrap via CDN  

---

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-folder>

2. **Install dependencies**

npm install

3. **Create a .env file**

PORT=3000
MONGO_URI=<your-mongodb-connection-string>

4. **Start the server**

node server.js

5. **Access the app**

Open a browser and go to:

http://localhost:3000/views/signup.html

6. **File Structure**


/public
    /js
        chat.js
    /views
        signup.html
        login.html
        chat.html
server.js
models/
    User.js
    GroupMessage.js
    PrivateMessage.js
.env
package.json
README.md

7. **Usage Notes**


Always open the chat in a fresh browser session or Incognito to avoid caching issues.

Make sure the MongoDB server is running before starting Node.js.

To send a private message, enter the recipient's username exactly as registered.

Alerts appear for room leaving and empty messages.

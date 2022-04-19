const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
    generateMessage,
    generateLocationMessage,
} = require("./utils/messages");
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require("./utils/user");
//Create the Express application
const app = express();

//Create the HTTP server using the express app
const server = http.createServer(app);

//Connect socket.io to he HTTP server
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));
//Listen for new connections to Socket.io

const timestamp = new Date().getTime();

io.on("connection", (socket) => {
    console.log("New WebSocket Connection");

    socket.on("join", ({ username, room }, callback) => {
        //Vlidate/track user
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }

        // Join the room
        socket.join(user.room);
        // Welcome the user to the room
        socket.emit("message", generateMessage("Welcome!"));
        // Broadcast an event to everyone in the room
        socket.broadcast.to(user.room).emit(
            "message",
            generateMessage(`${user.username}
       has joined!`)
        );
        callback();
    });

    socket.on("sendMessage", (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("Profanity is not allowed!");
        }
        io.to("lol").emit("message", generateMessage(message));
        callback();
    });
    socket.on("sendLocation", (coords, callback) => {
        io.emit(
            "locationMessage",
            generateLocationMessage(
                `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
            )
        );
        callback();
    });
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit(
                "message",
                generateMessage(`${user.username} has left!`)
            );
        }
    });
});
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
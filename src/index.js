const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

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

io.on("connection", (socket) => {
	console.log("New WebSocket Connection");

	socket.emit("message", "Welcome!");
	socket.broadcast.emit("message", "A new User has joined");

	socket.on("sendMessage", (message, callback) => {
		const filter = new Filter();
		if (filter.isProfane(message)) {
			return callback("Profanity is not allowed!");
		}
		io.emit("message", message);
		callback();
	});
	socket.on("disconnect", () => {
		io.emit("message", "A user has left");
	});
	socket.on("sendLocation", (coords, callback) => {
		io.emit(
			"locationMessage",
			`https://google.com/maps?q=${coords.latitude},${coords.longitude}`
		);
		callback();
	});
});
server.listen(port, () => {
	console.log(`Server is up on port ${port}`);
});

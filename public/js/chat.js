const socket = io();
//Elements:

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
//Select the element in which you want to render the template
const $messages = document.querySelector("#messages");

//TemplatesSelect the template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
	"#location-message-template"
).innerHTML;

$messageForm.addEventListener("submit", (e) => {
	e.preventDefault();

	//Disable
	$messageFormButton.setAttribute("disabled", "disabled");

	const message = e.target.elements.message.value;

	//Send Message
	socket.emit("sendMessage", message, (error) => {
		//This callback runs
		//enable
		$messageFormButton.removeAttribute("disabled");
		$messageFormInput.value = "";
		$messageFormInput.focus();
		if (error) {
			return console.log(error);
		}
		console.log("Message delivered!");
	});
});

//Received message
socket.on("message", (message) => {
	console.log(message);
	//Render the template with the message data
	const html = Mustache.render(messageTemplate, {
		message: message.text,
		createdAt: moment(message.createdAt).format("h:mm a"),
	});
	//Insert the template into the DOM
	$messages.insertAdjacentHTML("beforeend", html);
});
socket.on("sendMessage", (message) => {
	console.log(message);
});

//Received Location Message
socket.on("locationMessage", (message) => {
	console.log(message);
	//Render the template with the message data
	const html = Mustache.render(locationMessageTemplate, {
		url: message.url,
		createdAt: moment(message.createdAt).format("h:mm a"),
	});
	//Insert the template into the DOM
	$messages.insertAdjacentHTML("beforeend", html);
});
socket.on("sendMessage", (message) => {
	console.log(message);
});

$locationButton.addEventListener("click", (e) => {
	e.preventDefault();

	$locationButton.setAttribute("disabled", "disabled");

	navigator.geolocation.getCurrentPosition(
		(position) => {
			console.log(position);
			socket.emit(
				"sendLocation",
				{
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				},
				() => {
					console.log("Location Shared");
				}
			);
		},
		function errorCallback(error) {
			if (error.code == error.PERMISSION_DENIED) {
				// pop up dialog asking for location

				alert("Geolocation is not supported by your browser.");
			}
		}
	);
	$locationButton.removeAttribute("disabled");
});

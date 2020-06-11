/**
 * Socket Controller
 */

const debug = require('debug')('09-simple-chat:socket_controller');
const rooms = [
	{
		name: "general",
		users: {},
	},
	{
		name: "lieutenant",
		users: {},
	},
	{
		name: "private",
		users: {},
	},
];
const users = {};

let io = null;

/**
 * Get username of online user
 */
function getOnlineUsers() {
	return Object.values(users);
}

/**
 * Get room names
 */
function getListOfRoomNames() {
	return rooms.map(room => room.name);
}

/**
 * Handle user disconnecting
 */

function handleUserDisconnect() {
	debug("Client disconnected");

	// broadcast to all connected sockets that this user has left the chat
	if (users[this.id]) {
		this.broadcast.emit('user-disconnected', users[this.id]);

		// remove user from list of connected users
		delete users[this.id];

		// broadcast online users to all connected sockets EXCEPT ourselves
		this.broadcast.emit('online-users', getOnlineUsers());
	}
}

/**
 * Handle incoming chat message
 */

function handleChatMsg(incomingMsg) {
	debug("Someone sent something nice", incomingMsg);
	//// emit to all connected sockets
	//io.emit('chatmsg', msg);
	const msg = {
		time: Date.now(),
		content: incomingMsg.content,
		username: users[this.id],
	}

	// broadcast to all connected sockets EXCEPT ourselves
	this.broadcast.emit('chatmsg', msg);
}

/**
 * Handle a request for rooms
 */
function handleGetRoomList(callback) {
	callback(getListOfRoomNames());
}

/**
 * Handle register new user
 */

function handleRegisterUser(room, username, callback) {
	debug(`User ${username} want to connect to the room ${room}`);

	// join the requested room
	this.join(room);

	users[this.id] = username;
	callback({
		joinChat: true,
		usernameInUse: false,
		onlineUsers: getOnlineUsers(),
	})

	// broadcast to all connected sockets in the room EXCEPT ourselves
	this.broadcast.to(room).emit('new-user-connected', username);
	// // broadcast to all connected sockets EXCEPT ourselves
	// this.broadcast.emit('new-user-connected', username);

	// broadcast to all connected sockets in the room EXCEPT ourselves
	this.broadcast.to(room).emit('online-users', username);
	// // broadcast online users to all connected sockets EXCEPT ourselves
	// this.broadcast.emit('online-users', getOnlineUsers());
}

// använder function declaration för att kunna binda this
module.exports = function(socket) {
	// this = io
	io = this;
	debug(`Client ${socket.id} connecting`);

	socket.on('disconnect', handleUserDisconnect);

	socket.on('chatmsg', handleChatMsg);

	socket.on('get-room-list', handleGetRoomList);

	socket.on('register-user', handleRegisterUser);
}

/**
 * Socket Controller
 */

const debug = require('debug')('09-simple-chat:socket_controller');
const users = {};

/**
 * Get username of online user
 */
function getOnlineUsers() {
	return Object.values(users);
}

/**
 * Handle user disconnecting
 */

function handleUserDisconnect() {
	debug("Someone left the chat");

	// broadcast to all connected sockets that this user has left the chat
	if (users[this.id]) {
		this.broadcast.emit('user-disconnected', users[this.id]);
	}

	// remove user from list of connected users
	delete users[this.id];
}

/**
 * Handle incoming chat message
 */

function handleChatMsg(msg) {
	debug("Someone sent something nice", msg);
	//// emit to all connected sockets
	//io.emit('chatmsg', msg);

	// broadcast to all connected sockets EXCEPT ourselves
	this.broadcast.emit('chatmsg', msg);
}

/**
 * Handle register new user
 */

function handleRegisterUser(username, callback) {
	debug(`User ${username} connected to the chat`);
	users[this.id] = username;
	callback({
		joinChat: true,
		usernameInUse: false,
		onlineUsers: getOnlineUsers(),
	})

	// broadcast to all connected sockets EXCEPT ourselves
	this.broadcast.emit('new-user-connected', username);

	// broadcast online users to all connected sockets EXCEPT ourselves
	this.broadcast.emit('online-users', getOnlineUsers());
}

// använder function declaration för att kunna bonda this
module.exports = function(socket) {
	// this = io
	debug(`Client ${socket.id} connecting`);

	socket.on('disconnect', handleUserDisconnect);

	socket.on('chatmsg', handleChatMsg);

	socket.on('register-user', handleRegisterUser)
}

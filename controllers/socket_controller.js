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
 * Get room names
 */
function getListOfRoomNames() {
	return rooms.map(room => room.name);
}

/**
 * Get username of online user
 */
// function getOnlineUsers() {
// 	return Object.values(users);
// }

/**
 * Get username of online users in room
 */
function getOnlineUsersInRoom(roomName) {
	const room = getRoomByName(roomName);
	return Object.values(room.users);
}

/**
 * Get room by room name
 */
function getRoomByName(roomName) {
	return rooms.find(room => room.name === roomName);
}

/**
 * Get username by id in room
 */
function getUsernameByIdForRoom(id, roomName) {
	const room = getRoomByName(roomName);
	return room.users[id];
}

/**
 * Get room by user id
 */
function getRoomByUserId(id) {
	return rooms.find(room => room.users.hasOwnProperty(this.id));
}

/**
 * Handle user disconnecting
 */

function handleUserDisconnect() {
	debug("Client disconnected");

	const room = getRoomByUserId(this.id);
	if (!room) {
		return;
	}
	// broadcast to all connected sockets in the room that this user has left the chat
	this.broadcast.to(room.name).emit('user-disconnected', room.users[this.id]);

	// remove user from list of connected users
	delete room.users[this.id];

	// broadcast online users in the room to all connected sockets EXCEPT ourselves
	this.broadcast.to(room.name).emit('online-users', getOnlineUsersInRoom(room.name));

}

/**
 * Handle incoming chat message
 */

function handleChatMsg(incomingMsg) {
	debug("Someone sent something nice", incomingMsg);
	//// emit to all connected sockets
	//io.emit('chatmsg', msg);

	const room = getRoomByName(incomingMsg.room)

	const msg = {
		time: Date.now(),
		content: incomingMsg.content,
		username: getUsernameByIdForRoom(this.id, incomingMsg.room),
	}

	// broadcast to all connected sockets EXCEPT ourselves
	this.broadcast.to(incomingMsg.room).emit('chatmsg', msg);
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
function handleRegisterUser(roomName, username, callback) {
	debug(`User ${username} want to connect to the room ${roomName}`);

	// join the requested room
	this.join(roomName);

	// add user to the room's list of online users
	const room = getRoomByName(roomName);
	room.users[this.id] = username;
	// addUserToRoom(this.id, username, room);
	// removeUserFromRoom(this.id, room);


	callback({
		joinChat: true,
		usernameInUse: false,
		onlineUsers: getOnlineUsersInRoom(roomName),
	})

	// broadcast to all connected sockets in the room EXCEPT ourselves
	this.broadcast.to(roomName).emit('new-user-connected', username);
	// // broadcast to all connected sockets EXCEPT ourselves
	// this.broadcast.emit('new-user-connected', username);

	// broadcast to all connected sockets in the room EXCEPT ourselves
	this.broadcast.to(roomName).emit('online-users', getOnlineUsersInRoom(roomName));
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

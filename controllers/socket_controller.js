/**
 * Socket Controller
 */

const debug = require('debug')('09-simple-chat:socket_controller');
const users = {};

module.exports = (socket) => {
	debug("A client connection");

	socket.on('disconnect', () => {
		debug("Someone left the chat");

		// broadcast to all connected sockets that this user has left the chat
		if (users[socket.id]) {
			socket.broadcast.emit('user-disconnected', users[socket.id]);
		}
	});

	socket.on('register-user', username => {
		debug(`User ${username} connected to the chat`);
		users[socket.id] = username;

		// broadcast to all connected sockets EXCEPT ourselves
		socket.broadcast.emit('new-user-connected', username);
	})

	socket.on('chatmsg', (msg) => {
		debug("Someone sent something nice", msg);
		//// emit to all connected sockets
		//io.emit('chatmsg', msg);

		// broadcast to all connected sockets EXCEPT ourselves
		socket.broadcast.emit('chatmsg', msg);
	});
}

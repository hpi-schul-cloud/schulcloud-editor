const io = require('socket.io-client');

// const { store, dispatch } = useContext(LessonContext)

class Socket {
	constructor(url, authorization, resolve) {
		this.url = url;
		this.socket = io(url);
		this.isConnected = false;
		this.resolve = resolve;

		this.socket.on('connect', () => {
			this.authorization(authorization);
			this.isConnected = this.socket.connected;
			this.resolve();
		});

		this.socket.on('reconnect', () => {
			this.authorization(authorization);
			this.isConnected = this.socket.connected;
		});

		this.socket.on('disconnect', () => {
			this.isConnected = this.socket.connected;
		});

		this.socket.on('error', (error) => {
			console.error(error);
			/* dispatch({
				type: 'ERROR',
				payload: 'Die Verbindung zum Server konnte nicht aufrecht erhalten werden'
			}) */
		});
	}


	async authorization(token) {
		try {
			await this.emit('authorization', {
				token,
			});
		} catch (err) {
			/* dispatch({
				type: 'ERROR',
				payload: 'Die Authentifizierung ist fehlgeschlagen. Bitte melde dich an'
			}) */
		}
	}

	on(...params) {
		this.socket.on(...params);
		return this;
	}

	emit(...params) {
		return new Promise((resolve, reject) => {
			this.socket.emit(...params, (error, message) => {
				if (error) return reject(error);
				return resolve(message);
			});
		});
	}

	close() {
		this.socket.close();
	}
}
module.exports = (url, jwt, resolve) => new Socket(url, jwt, resolve);

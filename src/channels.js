const logger = require('./logger');

module.exports =  (app) => {0
    
    app.on('connection', (connection, socket) => {
        //TODO 
       // app.channel('unique editorid').join(connection);
        logger.info('Socket.io: New Connection')
        //let clientId = socket.handshake.headers['authorization'];
    })

    app.use

    app.on('lessons get', (lesson, { connection }) => {
        // connection can be undefined if there is no
        // real-time connection, e.g. when logging in via REST
        if(conneciton){

        }
    });

    app.publish((data, hook) => { // eslint-disable-line no-unused-vars
        // Publish all service events to all authenticated users
        return app.channel('unique editorId');
    });
}
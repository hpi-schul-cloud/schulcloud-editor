const logger = require('./logger');

module.exports = (app) => {
    app.on('connection', connection => {
        //TODO 
       // app.channel('unique editorid').join(connection);
        logger.info('Socket.io: New Connection')
    })

    app.on('lessons', (lesson, { connection }) => {
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
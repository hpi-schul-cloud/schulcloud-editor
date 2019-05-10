module.exports = (app) => {
    app.on('connection', connection => {
        //TODO 
       // app.channel('unique editorid').join(connection);
    })

    app.on('connect', (lesson, { connection }) => {
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
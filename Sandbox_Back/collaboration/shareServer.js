var https = require('https');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var serveStatic = require('serve-static');
var WebSocketJSONStream = require('websocket-json-stream');
var fs = require('fs');

// Setup express app
var app = express();
app.use('/', serveStatic('static', {'index': ['index.html']}));

var server = https.createServer({
    key: fs.readFileSync("/etc/letsencrypt/live/sandboxcodes.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/sandboxcodes.com/fullchain.pem")
}, app);
server.listen(5555);

// Create ShareDB instance and connection
var backend = new ShareDB();
var connection = backend.connect();

// Pipe any incoming ws connection to db
var wss = new WebSocket.Server({server: server});
wss.on('connection', function(ws, req) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);

    // If session creator sent ID, create new document in ShareDB
    ws.on('message', function (msg) {
console.log(msg);
        let oMsg = JSON.parse(msg);
        if (oMsg.session) {
            createDocument(oMsg.session);
        }
    });
});

// Create new document in ShareDB with id
function createDocument(id) {
    var doc = connection.get('files', id);
    doc.fetch(function(err) {
        if (err) throw err;
        if (doc.type === null) {
            doc.create('', function () {
            });
        }
    });
}

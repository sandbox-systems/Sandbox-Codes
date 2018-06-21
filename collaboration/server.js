// Load required modules
var http = require("http");
var express = require("express");
var serveStatic = require('serve-static');
var io = require("socket.io");
var easyrtc = require("easyrtc");
var mongodb = require("mongodb");

// Setup express http server
var httpApp = express();
httpApp.use(serveStatic('static', {'index': ['index.html']}));

var db;
var dbClient;

var url = 'mongodb://localhost:27017';

// Use connect method to connect to the server
mongodb.connect(url, function(err, client) {
    if (err) throw err;
    console.log("Connected correctly to server");

    dbClient = client;
    db = client.db('sandbox');

    console.log("Disconnecting from server");
    // client.close();
});

// Start express server
var webServer = http.createServer(httpApp).listen(3000);

// Start socket.io and setup with express server
var socketServer = io.listen(webServer);

var updateEasyrtcid = function (connectionObj, msg, socketCallback, next) {
    var easyrtcid = connectionObj.getEasyrtcid();
    var username = msg.msgData.username;
    var query = { username: username };
    var newValues = { $set: {easyrtcid: easyrtcid } };
    db.collection("users").updateOne(query, newValues, function(err, res) {
        if (err) throw err;
        console.log("Easyrtcid updated");
    });
};

// Start EasyRTC server
var easyrtcServer = easyrtc.listen(httpApp, socketServer, null, function (error, pub) {
    if (error) {
        return console.log(error);
    }

    var connect = pub.events.defaultListeners.connection;
    var disconnect = pub.events.defaultListeners.disconnect;
    var roomJoin = pub.events.defaultListeners.roomJoin;
    var roomLeave = pub.events.defaultListeners.roomLeave;

    easyrtc.events.on('connection', function(socket, easyrtcid, next) {
        console.log('Connection from easyrtcid', easyrtcid);
        db.collection('tests').save({test: "test"}, function(err, result) {
            if (err) {
                return console.log(err);
            }
            console.log('Adding entry');
        });
        return connect(socket, easyrtcid, next);
    });

    easyrtc.events.on("easyrtcMsg", updateEasyrtcid);
});

// TODO find a place to call dbClient.close()
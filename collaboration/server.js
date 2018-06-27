// Load required modules
var http = require("http");
var express = require("express");
var serveStatic = require('serve-static');
var easyrtc = require("easyrtc");
var mongodb = require("mongodb");
var actions = require("./actions");
var queries = require("./queries");

// Setup express http application
var httpApp = express();
httpApp.use(serveStatic('static', {'index': ['index.html']}));

var db, dbClient;
var dbUrl = 'mongodb://localhost:27017';

// Connect to MongoDB server
mongodb.connect(dbUrl, function (err, client) {
    if (err) throw err;
    console.log("Successfully connected to MongoDB server");

    dbClient = client;
    db = client.db('sandbox');
});

// Start express server
var webServer = http.createServer(httpApp).listen(3000);

// Load and setup socket.io with express server
var io = require("socket.io").listen(webServer);

// Start EasyRTC server and handle events
var easyrtcServer = easyrtc.listen(httpApp, io, null, function (error, pub) {    // pub is a public app object
    if (error)
        return console.log(error);

    var connect = pub.events.defaultListeners.connection;
    var disconnect = pub.events.defaultListeners.disconnect;
    var roomJoin = pub.events.defaultListeners.roomJoin;
    var roomLeave = pub.events.defaultListeners.roomLeave;
    var easyrtcMsg = pub.events.defaultListeners.easyrtcMsg;

    easyrtc.events.on('connection', function (socket, easyrtcid, next) {
        console.log('Connection from easyrtcid', easyrtcid);
        return connect(socket, easyrtcid, next);
    });

    easyrtc.events.on("easyrtcMsg", function (conObj, msg, socketCallback, next) {
        var roomID, memberID;
        // Upon receiving easyrtcid from client on connect, send back user and room data
        if (msg.msgType === "clientConnection") {
            var username = msg.msgData.username;

            // Contains all processed user IDs
            var userPool = [];

            actions.getUserData(db, username, function (userData, friendIDs, user) {
                actions.getFriendData(db, user, userPool, friendIDs, function (friendData, roomIDs) {
                    actions.getRoomData(db, userData, userPool, roomIDs, function (roomData) {
                        // Create single object to encapsulate all data
                        var data = {
                            userData: userData,
                            friendData: friendData,
                            roomData: roomData
                        };

                        // Finally, the data is sent to the client
                        actions.emitMsgToClient(pub, conObj, "userData", data);
                    });
                });
            });
        } else if (msg.msgType === "chatMessageDB") {
            roomID = msg.msgData.roomID;
            var chatMsg = msg.msgData.chatMsg;

            queries.addChat(db, roomID, chatMsg);
        } else if (msg.msgType === "removeUserDB") {
            roomID = msg.msgData.roomID;
            memberID = msg.msgData.memberID;

            queries.removeMemberFromRoom(db, roomID, memberID);
            queries.removeRoomFromUser(db, roomID, memberID);
        } else if (msg.msgType === "addMemberDB") {
            roomID = msg.msgData.roomID;
            memberID = msg.msgData.memberID;

            queries.addMemberToRoom(db, roomID, memberID);
            queries.addRoomToUser(db, roomID, memberID);
        } else {
            // If the message was not for a clientConnection, just let EastRTC do its thing
            return easyrtcMsg(conObj, msg, socketCallback, next);
        }
    });
});

// TODO find a place to call dbClient.close()
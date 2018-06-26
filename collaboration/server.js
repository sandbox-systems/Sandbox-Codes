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
        // Upon receiving easyrtcid from client on connect, send back user and room data
        if (msg.msgType === "clientConnection") {
            var username = msg.msgData.username;

            // Update easyrtcid entry for this user in the DB
            queries.updateEasyrtcid(db, username, conObj.getEasyrtcid());
            // Get user object with appropriate username
            queries.getUser(db, username, function (user) {
                // Once user is fetched, only the name and room data are sent to the client
                var userData = {};
                userData.id = user._id;
                userData.name = user.name;

                // Room IDs must be cast to ObjectID objects to use in querying
                var roomIDs = [];
                for (var i = 0; i < user.roomIDs.length; i++) {
                    roomIDs.push(mongodb.ObjectID(user.roomIDs[i]));
                }

                // Fetch an array of room objects with appropriate room IDs
                queries.getRooms(db, roomIDs, function (rooms) {
                    // Once the rooms ae fetched, only the id. name, chat entries are sent to the client
                    for (var i = 0; i < rooms.length; i++) {
                        userData.rooms.push({
                            name: rooms[i].name,
                            chat: rooms[i].chatEntries,
                            id: rooms[i]._id
                        });
                    }

                    // Finally, the user data is sent to the client
                    actions.emitMsgToClient(pub, conObj, "userData", userData);
                });
            });
        } else {
            // If the message was not for a clientConnection, just let EastRTC do its thing
            return easyrtcMsg(conObj, msg, socketCallback, next);
        }
    });
});

// TODO find a place to call dbClient.close()
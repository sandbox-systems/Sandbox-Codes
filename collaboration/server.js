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

            // Contains all processed user IDs
            var userPool = [];

            // Get user object with appropriate username
            queries.getUser(db, username, function (user) {
                // Once user is fetched, only the id and name are sent to the client
                var userData = {};
                userData.id = user._id.toString();
                userData.name = user.name;

                // Friend IDs must be cast to ObjectID objects to use in querying
                var friendIDs = [];
                for (var i = 0; i < user.friends.length; i++) {
                    friendIDs.push(mongodb.ObjectID(user.friends[i]));
                }

                // Fetch an array of user objects with appropriate IDs corresponding to user friend IDs
                queries.getUsers(db, friendIDs, function (friends) {
                    // Once friends are fetched, only the id, username, and name are sent to the client
                    var friendData = [];
                    for (var f = 0; f < friends.length; f++) {
                        userPool.push(friends[f]._id.toString());
                        friendData.push({
                            id: friends[f]._id.toString(),
                            uname: friends[f].username,
                            name: friends[f].name
                        });
                    }

                    // Room IDs must be cast to ObjectID objects to use in querying
                    var roomIDs = [];
                    for (var i = 0; i < user.roomIDs.length; i++) {
                        roomIDs.push(mongodb.ObjectID(user.roomIDs[i]));
                    }

                    // Fetch an array of room objects with appropriate room IDs
                    queries.getRooms(db, roomIDs, function (rooms) {
                        var roomData = [];
                        var newMembers = {};

                        // Once the rooms ae fetched, only the id, name, members, and chat entries are sent to the client
                        for (var i = 0; i < rooms.length; i++) {
                            var room = {
                                id: rooms[i]._id.toString(),
                                name: rooms[i].name,
                                members: [],
                                chats: rooms[i].chatEntries
                            };
                            // If the member is also a friend, add the already created friend to members
                            // Otherwise, the other members must be fetched from the DB
                            for (var j = 0; j < rooms[i].members.length; j++) {
                                var member = rooms[i].members[j];
                                if (member !== userData.id) {
                                    if (userPool.includes(member)) {
                                        room.members.push(member);
                                    } else {
                                        newMembers[member] = i;
                                        userPool.push(member);
                                    }
                                }
                            }
                            roomData.push(room);
                        }

                        // New member IDs must be cast to ObjectID objects to use in querying
                        var memberIDs = [];
                        for (var k = 0; k < Object.keys(newMembers).length; k++) {
                            memberIDs.push(mongodb.ObjectID(Object.keys(newMembers)[k]));
                        }

                        // Fetch an array of user objects with appropriate IDs corresponding to room new member IDs
                        queries.getUsers(db, memberIDs, function (members) {
                            // Once new members are fetched, only the id, username, and name are sent to the client
                            for (var i = 0; i < members.length; i++) {
                                var member = {
                                    id: members[i]._id.toString(),
                                    uname: members[i].username,
                                    name: members[i].name
                                };
                                // Room index in roomData was stored so the member can be added to the appropriate room
                                roomData[newMembers[member.id]].members.push(member);
                            }

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

            });
        } else if (msg.msgType === "updateDB") {
            var id = msg.msgData.id;
            var friends = msg.msgData.friends;
            var rooms = msg.msgData.rooms;

            queries.updateFriends(db, id, friends, function () {
                for (var i = 0; i < rooms.length; i++) {
                    queries.updateRoom(db, rooms[i].id, rooms[i], function () {});
                }
            });
        } else {
            // If the message was not for a clientConnection, just let EastRTC do its thing
            return easyrtcMsg(conObj, msg, socketCallback, next);
        }
    });
});

// TODO find a place to call dbClient.close()
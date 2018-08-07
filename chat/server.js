// Load required modules
var https = require("https");
var fs = require("fs");
var express = require("express");
var serveStatic = require('serve-static');
var easyrtc = require("easyrtc");
var mongodb = require("mongodb");
//var Cookies = require("js-cookie");
var actions = require("./actions");
var queries = require("./queries");

// Setup express http application
var httpApp = express();
/*httpApp.get('//', function(req, res) {
    res.sendFile("chat.html", {root: 'static'});
});*/
/*httpApp.get('/chat', function(req, res) {
    res.send(serveStatic('chat/static', {'index': ['chat.html']}));
});*/
httpApp.use('/', serveStatic('static', {'index': ['chat.html']}));

var db, dbClient;
var dbUrl = 'mongodb://sandbox:NhJLmHZb$@localhost:27017/admin';

// Connect to MongoDB server
mongodb.connect(dbUrl, {useNewUrlParser: true}, function (err, client) {
    if (err) throw err;
    console.log("Successfully connected to MongoDB server");

    dbClient = client;
    db = client.db('sandbox');
});

// Start express server
var webServer = https.createServer({
    key: fs.readFileSync("/etc/letsencrypt/live/sandboxcodes.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/sandboxcodes.com/fullchain.pem")
}, httpApp).listen(3000);

// Load and setup socket.io with express server
var io = require("socket.io").listen(webServer);

// Prevent clients from joining default room
easyrtc.setOption("roomDefaultEnable", false);

// Start EasyRTC server and handle events
var easyrtcServer = easyrtc.listen(httpApp, io, null, function (error, pub) {    // pub is a public app object
    if (error){
        return console.log(error);
	}
    var connect = pub.events.defaultListeners.connection;
    var disconnect = pub.events.defaultListeners.disconnect;
    var roomJoin = pub.events.defaultListeners.roomJoin;
    var roomLeave = pub.events.defaultListeners.roomLeave;
    var easyrtcMsg = pub.events.defaultListeners.easyrtcMsg;

    easyrtc.events.on('connection', function (socket, easyrtcid, next) {
        console.log('Connection from easyrtcid', easyrtcid);
        return connect(socket, easyrtcid, next);
    });

    easyrtc.events.on('disconnect', function (conObj, next) {
        console.log(conObj.getUsername() + ' disconnected');
        return disconnect(conObj, next);
    });

    easyrtc.events.on("easyrtcMsg", function (conObj, msg, socketCallback, next) {
        var roomID, memberID;
        // Upon receiving easyrtcid from client on connect, send back user and room data
        if (msg.msgType === "clientConnection") {
            var ecode = msg.msgData.ecode;

            // Contains all processed user IDs
            var userPool = [];

            actions.getUserDataFromEcode(db, ecode, function (userData, friendIDs, user) {
                actions.getFriendData(db, user, userPool, friendIDs, function (friendData, roomIDs) {
                    actions.getRoomData(db, userData, userPool, roomIDs, function (roomData) {
                        actions.getPendingRequestDataFor(db, userData.id, function (requestData) {
                            actions.getProcessedRequestDataFrom(db, userData.id, function (pRequestData) {
                                actions.getNotificationsFor(db, userData.id, function (notifData) {
                                    // Create single object to encapsulate all data
                                    var data = {
                                        userData: userData,
                                        friendData: friendData,
                                        roomData: roomData,
                                        requestData: {
                                            pending: requestData,
                                            processed: pRequestData
                                        },
                                        notifData: notifData
                                    };

                                    // Finally, the data is sent to the client
                                    actions.emitMsgToClient(pub, conObj, "userData", data);
                                });
                            });
                        });
                    });
                });
            });
        } else if (msg.msgType === "chatMessageDB") {
            roomID = msg.msgData.roomID;
            var chatMsg = msg.msgData.chatMsg;

            queries.addChat(db, roomID, chatMsg);
        } else if (msg.msgType === "fileMsgDB") {
            roomID = msg.msgData.roomID;
            var file = msg.msgData.file;
            file.blob = Buffer.from(file.blob).toString('base64');

            queries.addChat(db, roomID, file);
        } else if (msg.msgType === "removeUserDB") {
            roomID = msg.msgData.roomID;
            memberID = msg.msgData.memberID;

            queries.removeMemberFromRoom(db, roomID, memberID);
            queries.removeRoomFromUser(db, roomID, memberID);
        } else if (msg.msgType === "removeRoomDB") {
            roomID = msg.msgData.roomID;
            queries.deleteRoom(db, roomID);
        } else if (msg.msgType === "addMemberDB") {
            roomID = msg.msgData.roomID;
            memberID = msg.msgData.memberID;

            queries.addMemberToRoom(db, roomID, memberID);
            queries.addRoomToUser(db, roomID, memberID);
        } else if (msg.msgType === "createRoom") {
            queries.createRoom(db, msg.msgData, function (roomID) {
                for (var i = 0; i < msg.msgData.members.length; i++) {
                    queries.addRoomToUser(db, roomID.toString(), msg.msgData.members[i]);
                }
                var newRoomData = {
                    id: roomID,
                    name: msg.msgData.name,
                    members: msg.msgData.members
                };
                actions.emitMsgToClient(pub, conObj, "newRoomData", newRoomData);
            });
        } else if (msg.msgType === "friendRequestDB") {
            queries.addRequest(db, "friend", msg.msgData.from, msg.msgData.toID);
        } else if (msg.msgType === "approveFriendRequest") {
            queries.updateRequestStatus(db, msg.msgData.id, true);
            queries.addToUserDataToRequest(db, msg.msgData.id, msg.msgData.user);
        } else if (msg.msgType === "denyFriendRequest") {
            queries.updateRequestStatus(db, msg.msgData.id, false);
            queries.addToUserDataToRequest(db, msg.msgData.id, msg.msgData.user_name);
        } else if (msg.msgType === "setupFriendship") {
            queries.addFriend(db, msg.msgData.fID1, msg.msgData.fID2);
        } else if (msg.msgType === "unfriendDB") {
            queries.removeFriend(db, msg.msgData.from, msg.msgData.friend);
            queries.removeFriend(db, msg.msgData.friend, msg.msgData.from);
        } else if (msg.msgType === "deleteRequest") {
            queries.deleteRequest(db, msg.msgData.id);
        } else if (msg.msgType === "resetUnread") {
            queries.resetUnread(db, msg.msgData.roomID, msg.msgData.memberID);
        } else if (msg.msgType === "incUnread") {
            queries.incUnread(db, msg.msgData.roomID, msg.msgData.memberID);
        } else {
            // If the message was not for a clientConnection, just let EastRTC do its thing
            return easyrtcMsg(conObj, msg, socketCallback, next);
        }
    });
});

// TODO find a place to call dbClient.close()

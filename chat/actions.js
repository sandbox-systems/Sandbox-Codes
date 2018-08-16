var mongodb = require('mongodb');
var queries = require("./queries");

module.exports = {
    callback: function (pub, easyrtcid, err, successMsg) {
        // General purpose callback for displaying success or failure of an action
        if (err) {
            pub.util.logError("[" + easyrtcid + "] Unhandled easyrtcMsg listener error.", err);
        } else {
            console.log(successMsg);
        }
    },
    emitMsgToClient: function (pub, conObj, msgType, msgObj) {
        var socketCb;

        conObj.socket.on("emitEasyrtcMsg", function (msg, socketCallback) {
            socketCb = socketCallback;
        });

        var msg = {
            "msgData": msgObj
        };

        pub.events.emit("emitEasyrtcMsg", conObj, msgType, msg, socketCb, function (err) {
            module.exports.callback(pub, conObj.getEasyrtcid(), err, "Successfully sent data to client");
        });
    },
    getObjectIDList: function(ids) {
        var idObjs = [];

        for (var i = 0; i < ids.length; i++) {
            idObjs.push(mongodb.ObjectID(ids[i]));
        }

        return idObjs;
    },
    // callback = function (userData, friendIDs, user)
    getUserDataFromEcode: function (db, ecode, callback) {
        // Get user object with appropriate username
        queries.getUserFromEcode(db, ecode, function (user) {
            // Once user is fetched, only the id and name are sent to the client
            var userData = {};
            userData.id = user._id.toString();
            userData.name = user.name;
            userData.username = user.username;
            userData.profilepic = user.profilepic;
            userData.ecode = user.ecode.toString();

            // Friend IDs must be cast to ObjectID objects to use in querying
            var friendIDs = module.exports.getObjectIDList(user.friends);

            callback(userData, friendIDs, user);
        });
    },
    // callback = function (userData)
    getUserDataFromID: function (db, userID, callback) {
        // Get user object with appropriate ID
        queries.getUserFromID(db, userID, function (user) {
            // Once user is fetched, only the id and name are sent to the client
            var userData = {};
            userData.username = user.username;
            userData.name = user.name;

            // Friend IDs must be cast to ObjectID objects to use in querying
            var friendIDs = module.exports.getObjectIDList(user.friends);

            callback(userData, friendIDs, user);
        });
    },
    // callback = function (friendData, roomIDs)
    getFriendData: function (db, user, userPool, friendIDs, callback) {
        // Fetch an array of user objects with appropriate IDs corresponding to user friend IDs
        queries.getUsers(db, friendIDs, function (friends) {
            // Once friends are fetched, only the id, username, and name are sent to the client
            var friendData = [];

            for (var f = 0; f < friends.length; f++) {
                userPool.push(friends[f]._id.toString());
                friendData.push({
                    id: friends[f]._id.toString(),
                    uname: friends[f].username,
                    name: friends[f].name,
                    profilepic: friends[f].profilepic
                });
            }

            // Room IDs must be cast to ObjectID objects to use in querying
            var roomIDs = module.exports.getObjectIDList(user.roomIDs);

            callback(friendData, roomIDs);
        });
    },
    // callback = function (roomData)
    getRoomData: function (db, userData, userPool, roomIDs, callback) {
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
                var memberIDs = Object.keys(rooms[i].members);
                for (var j = 0; j < memberIDs.length; j++) {
                    var member = memberIDs[j];
                    if (member !== userData.id) {
                        if (userPool.includes(member)) {
                            room.members.push(member);
                        } else {
                            newMembers[member] = i;
                            userPool.push(member);
                        }
                    } else {
                        room.unread = rooms[i].members[member];
                    }
                }
                roomData.push(room);
            }

            // New member IDs must be cast to ObjectID objects to use in querying
            var newMemberIDs = module.exports.getObjectIDList(Object.keys(newMembers));

            // Fetch an array of user objects with appropriate IDs corresponding to room new member IDs
            queries.getUsers(db, newMemberIDs, function (members) {
                // Once new members are fetched, only the id, username, and name are sent to the client
                for (var i = 0; i < members.length; i++) {
                    var member = {
                        id: members[i]._id.toString(),
                        uname: members[i].username,
                        name: members[i].name,
                        profilepic: members[i].profilepic
                    };
                    // Room index in roomData was stored so the member can be added to the appropriate room
                    roomData[newMembers[member.id]].members.push(member);
                }

                callback(roomData);
            });
        });
    },
    // callback = function (requestData)
    getPendingRequestDataFor: function (db, userID, callback) {
        var requestData = [];

        queries.getRequestsFor(db, userID, function(request) {
            if (request.accepted === null) {
                var datum = {
                    id: request._id.toString(),
                    type: request.type,
                    from: request.from
                };
                requestData.push(datum);
            }
        }, function () {
            callback(requestData);
        });
    },
    // callback = function (pRequestData)
    getProcessedRequestDataFrom: function (db, userID, callback) {
        var requestData = [];

        queries.getRequestsFrom(db, userID, function(request) {
            if (request.accepted !== null) {
                var datum = {
                    type: request.type,
                    accepted: request.accepted,
                    to: request.toData
                };
                requestData.push(datum);
                queries.deleteRequest(db, request._id.toString());
            }
        }, function () {
            callback(requestData);
        });
    },
    // callback = function (notifData)
    getNotificationsFor: function (db, userID, callback) {
        queries.getNotificationsFor(db, userID, function (notifications) {
            callback(notifications);
        });
    }
};

var mongodb = require('mongodb');

module.exports = {
    // successCB = function()
    updateFriends: function (db, id, friends, successCB) {
        var query = {_id: mongodb.ObjectID(id)};
        var newID = {$set: {friends: friends}};
        // Update the friends key of the user with _id id
        db.collection("users").updateOne(query, newID, function (err, res) {
            if (err) throw err;
            console.log("Successfully updated friends");
            successCB();
        });
    },
    // successCB = function()
    updateRoom: function (db, id, roomData, successCB) {
        var query = {_id: mongodb.ObjectID(id)};
        var newData = {$set: {
            name: roomData.name,
            chatEntries: roomData.chat,
            members: roomData.members
        }};
        // Update the friends key of the user with _id id
        db.collection("rooms").updateOne(query, newData, function (err, res) {
            if (err) throw err;
            console.log("Successfully updated room");
            successCB();
        });
    },
    addChat: function (db, roomID, msg) {
        var query = {_id: mongodb.ObjectID(roomID)};
        var push = {$push: {chatEntries: msg}};
        db.collection("rooms").updateOne(query, push, function (err, res) {
            if (err) throw err;
            console.log("Successfully updated room");
        });
    },
    removeMemberFromRoom: function (db, roomID, memberID) {
        var query = {_id: mongodb.ObjectID(roomID)};
        var assignment = {};
        assignment["members." + memberID] = "";
        var unset = {$unset: assignment};

        db.collection("rooms").update(query, unset, function (err, res) {
            if (err) throw err;
            console.log("Successfully removed member from room");
        });
    },
    removeRoomFromUser: function (db, roomID, userID) {
        var query = {_id: mongodb.ObjectID(userID)};
        var pull = {$pull: {roomIDs: roomID}};
        db.collection("users").update(query, pull, function (err, res) {
            if (err) throw err;
            console.log("Successfully removed room from user");
        });
    },
    deleteRoom: function (db, roomID) {
        var query = {_id: mongodb.ObjectID(roomID)};
        db.collection("rooms").remove(query, function (err, res) {
            if (err) throw err;
            console.log("Successfully deleted room");
        });
    },
    addMemberToRoom: function (db, roomID, memberID) {
        var query = {_id: mongodb.ObjectID(roomID)};
        var assignment = {};
        assignment["members." + memberID] = 0;
        var set = {$set: assignment};

        db.collection("rooms").update(query, set, function (err, res) {
            if (err) throw err;
            console.log("Successfully added member to room");
        });
    },
    addFriend: function (db, userID, friendID) {
        var query = {_id: mongodb.ObjectID(userID)};
        var push = {$push: {friends: friendID}};
        db.collection("users").update(query, push, function (err, res) {
            if (err) throw err;
            console.log("Successfully added friend to user " + userID);
        });
    },
    removeFriend: function (db, userID, friendID) {
        var query = {_id: mongodb.ObjectID(userID)};
        var push = {$pull: {friends: friendID}};
        db.collection("users").update(query, push, function (err, res) {
            if (err) throw err;
            console.log("Successfully removed friend from user " + userID);
        });
    },
    addRoomToUser: function (db, roomID, userID) {
        var query = {_id: mongodb.ObjectID(userID)};
        var push = {$push: {roomIDs: roomID}};
        db.collection("users").update(query, push, function (err, res) {
            if (err) throw err;
            console.log("Successfully added room to user");
        });
    },
    addRequest: function (db, type, from, toID) {
        var document = {
            type: type,
            from: from,
            fromID: from.id,
            to: toID,
            accepted: null
        };
        db.collection("requests").insert(document, function(err, res){
            if (err) throw err;
            console.log("Successfully added request");
        });
    },
    updateRequestStatus: function (db, reqID, isAccepted) {
        var query = {_id: mongodb.ObjectID(reqID)};
        var set = {$set: {accepted: isAccepted}};
        db.collection("requests").update(query, set, function (err, res) {
            if (err) throw err;
            console.log("Successfully updated request status");
        });
    },
    // forEachCB = function (request)
    // successCB = function ()
    getRequestsFor: function (db, toID, forEachCB, successCB) {
        // Matches every document with to = toID
        var query = {to: toID};

        db.collection('requests').find(query).forEach(function (req) {
            forEachCB(req);
        }, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully fetched all requests for " + toID);
                successCB();
            }
        });
    },
    // forEachCB = function (request)
    // successCB = function ()
    getRequestsFrom: function (db, fromID, forEachCB, successCB) {
        // Matches every document with appropriate fromID
        var query = {fromID: fromID};

        db.collection('requests').find(query).forEach(function (req) {
            forEachCB(req);
        }, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully fetched all requests from " + fromID);
                successCB();
            }
        });
    },
    getNotificationsFor: function (db, userID, successCB) {
        var query = {recipientID: userID};
        var notifications = [];

        db.collection('notifications').find(query).forEach(function (doc) {
            notifications.push({
                type: doc.type,
                message: doc.message
            });
        }, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully fetched all notifications for " + userID);
                successCB(notifications);
            }
        });
    },
    addToUserDataToRequest: function (db, reqID, toUserData) {
        var query = {_id: mongodb.ObjectID(reqID)};
        var set = {$set: {toData: toUserData}};
        db.collection("requests").update(query, set, function (err, res) {
            if (err) throw err;
            console.log("Successfully added to user data to request");
        });
    },
    deleteRequest: function (db, reqID) {
        var query = {_id: mongodb.ObjectID(reqID)};
        db.collection("requests").remove(query, function (err, res) {
            if (err) throw err;
            console.log("Successfully removed request");
        });
    },
    // successCB = function (roomID)
    createRoom: function (db, roomData, successCB) {
        var document = {
            name: roomData.name,
            chatEntries: [],
            members: {}
        };
        for (var i = 0; i < roomData.members.length; i++) {
            document.members[roomData.members[i]] = 0;
        }
        db.collection("rooms").insert(document, function(err, res){
            if (err) throw err;
            console.log("Successfully added room");
            successCB(res.insertedIds[0]);
        });
    },
    // successCB = function (user)
    getUserFromEcode: function (db, ecode, successCB) {
        var query = {ecode: mongodb.Binary(ecode)}, user;

        db.collection("users").find(query).forEach(function (doc) {
            user = doc;
        }, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully fetched user data and converted cursor to object")
                successCB(user);
            }
        });
    },
    // successCB = function (user)
    getUserFromID: function (db, userID, successCB) {
        var query = {_id: mongodb.ObjectID(userID)}, user;

        db.collection("users").find(query).forEach(function (doc) {
            user = doc;
        }, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully fetched user data and converted cursor to object")
                successCB(user);
            }
        });
    },
    // successCB = function (documents)
    getDocumentsFromList: function (db, collection, list, successMsg, successCB) {
        // Matches every document with _id in the list
        var query = {_id: {$in: list}};
        var documents = [];

        db.collection(collection).find(query).forEach(function (doc) {
            documents.push(doc);
        }, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log(successMsg);
                successCB(documents);
            }
        });
    },
    // successCB = function (rooms)
    getRooms: function (db, roomIDs, successCB) {
        return module.exports.getDocumentsFromList(db, 'rooms', roomIDs,
            "Successfully fetched all room data and converted cursors to objects", successCB);
    },
    resetUnread: function (db, roomID, memberID) {
        var query = {_id: mongodb.ObjectID(roomID)};
        var assignment = {};
        assignment["members." + memberID] = 0;
        var set = {$set: assignment};

        db.collection("rooms").update(query, set, function (err, res) {
            if (err) throw err;
            console.log("Successfully reset room unread status for room " + roomID + ", member " + memberID);
        });
    },
    incUnread: function (db, roomID, memberID) {
        var query = {_id: mongodb.ObjectID(roomID)};
        var incrementation = {};
        incrementation["members." + memberID] = 1;
        var set = {$inc: incrementation};

        db.collection("rooms").update(query, set, function (err, res) {
            if (err) throw err;
            console.log("Successfully incremented unread for room " + roomID + ", member " + memberID);
        });
    },
    // successCB = function (users)
    getUsers: function (db, userIDs, successCB) {
        return module.exports.getDocumentsFromList(db, 'users', userIDs,
            "Successfully fetched all user data and converted cursors to objects", successCB);
    }
};

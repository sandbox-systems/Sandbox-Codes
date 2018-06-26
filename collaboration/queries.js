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
    // successCB = function (user)
    getUser: function (db, uname, successCB) {
        var query = {username: uname}, user;

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
    // successCB = function (users)
    getUsers: function (db, userIDs, successCB) {
        return module.exports.getDocumentsFromList(db, 'users', userIDs,
            "Successfully fetched all user data and converted cursors to objects", successCB);
    }
};
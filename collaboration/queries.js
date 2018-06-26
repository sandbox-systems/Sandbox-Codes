module.exports = {
    updateEasyrtcid: function (db, uname, easyrtcid) {
        var query = {username: uname};
        var newID = {$set: {easyrtcid: easyrtcid}};
        // Update the easyrtcid of the user with username uname
        db.collection("users").updateOne(query, newID, function (err, res) {
            if (err) throw err;
            console.log("Successfully updated easyrtcid");
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
    // successCB = function (friends)
    getFriends: function (db, friendIDs, successCB) {
        return module.exports.getDocumentsFromList(db, 'users', friendIDs,
            "Successfully fetched all friend data and converted cursors to objects", successCB);
    }
};
Object.prototype.includesKey = function (key) {
    return Object.keys(this).includes(key);
};

var chatClient = (function () {
    var searchParams = new URLSearchParams(window.location.search);
    var easyrtcid = "";
    var username = searchParams.get('username');
    var user = new User("", username, "");
    var userPool = {};
    var fileSenders = {};
    var fileSenderPool = {toRemove: {}};
    var friends = [];
    var rooms = [];

    var connect = function () {
        easyrtc.setUsername(username);
        easyrtc.connect('sandbox-chat', function (eid) {
            easyrtcid = eid;
            callbacks.connectSuccess(eid);
        }, callbacks.failure);

        easyrtc.setPeerListener(peerListener);
        easyrtc.addEventListener("roomOccupant", roomOccupantListener);

        easyrtc.sendServerMessage('clientConnection', {username: username}, callbacks.sendServerMsgSuccess, callbacks.failure);
        easyrtc.setServerListener(serverListener);

        // .get(0) converts jQuerySelector to DOMString
        easyrtc_ft.buildDragNDropRegion(getDropper()[0], fileCollectionHandler);
        easyrtc_ft.buildFileReceiver(callbacks.fileReceiveAcceptReject, fileReceiveHandler, function (sender, status) {
        });
    };

    var fileReceiveHandler = function (from, blob, filename, clientData) {
        console.log("FROM HERE: " + JSON.stringify(clientData));
        var imageUrl = window.URL.createObjectURL(blob);
        var img = $('#photo');
        img.attr('src', imageUrl);
    };

    var fileCollectionHandler = function (files) {
        console.log(files);
        var keys = Object.keys(fileSenders);
        for (var i = 0; i < keys.length; i++) {
            fileSenders[keys[i]].sendFiles(files);
        }
    };

    var serverListener = function (msgType, msgData, targeting) {
        if (msgType === "userData") {
            fillData(msgType, msgData, targeting);
        } else if (msgType === "newRoomData") {
            var newRoom = new Room(msgData.id, msgData.name, []);
            for (var i = 0; i < msgData.members.length; i++) {
                if (msgData.members[i] !== user.id)
                    newRoom.members.push(userPool[msgData.members[i]]);
            }
            rooms.push(newRoom);
            for (var f = 0; f < friends.length; f++) {
                var eidObj = easyrtc.usernameToIds(friends[f].uname)[0];
                if (eidObj !== undefined) {
                    var room = new Room(newRoom.id, newRoom.name, newRoom.chats);
                    for (var j = 0; j < newRoom.members.length; j++) {
                        if (newRoom.members[j].id !== friends[f].id)
                            room.addMember(newRoom.members[j]);
                    }
                    room.addMember(chatClient.getClientUser());
                    easyrtc.sendDataWS(eidObj.easyrtcid, "addRoom", {room: room}, null);
                }
            }
            easyrtc.joinRoom(newRoom.id, null, callbacks.joinRoomSuccess, callbacks.roomFailure);
            onRoomCreated();
        }
    };

    var fillData = function (msgType, msgData, targeting) {
        fillUser(msgData.userData);
        fillFriends(msgData.friendData);
        fillRooms(msgData.roomData);
        handleRequests(msgData.requestData);
        onConnect();
    };

    var fillUser = function (userData) {
        user.id = userData.id;
        user.name = userData.name;
    };

    var fillFriends = function (friendData) {
        for (var i = 0; i < friendData.length; i++) {
            var datum = friendData[i];
            addFriend(new User(datum.id, datum.uname, datum.name));
        }
    };

    var fillRooms = function (roomData) {
        for (var i = 0; i < roomData.length; i++) {
            var datum = roomData[i];
            var room = new Room(datum.id, datum.name, datum.chats);

            for (var j = 0; j < datum.members.length; j++) {
                var member = datum.members[j];
                if (typeof member === "string") {
                    room.addMember(userPool[member]);
                } else if (typeof member === "object") {
                    var user = new User(member.id, member.uname, member.name);
                    userPool[member.id] = user;
                    room.addMember(user);
                }
            }

            rooms.push(room);
            easyrtc.joinRoom(datum.id, null, callbacks.joinRoomSuccess, callbacks.roomFailure);
        }
    };

    var handleRequests = function (requestData) {
        for (var i = 0; i < requestData.pending.length; i++) {
            var eidObj = easyrtc.usernameToIds(requestData.pending[i].from.uname)[0];
            if (requestData.pending[i].type === "friend") {
                if (confirm("Do you want to accept a friend request from " + requestData.pending[i].from.name + "?")) {
                    createAndAddFriend(requestData.pending[i].from);
                    if (eidObj !== undefined) {
                        easyrtc.sendDataWS(eidObj.easyrtcid, "friendRequestAccepted", user, null);
                        easyrtc.sendServerMessage('deleteRequest', {id: requestData.pending[i].id}, callbacks.sendServerMsgSuccess, callbacks.failure);
                    } else {
                        easyrtc.sendServerMessage('approveFriendRequest', {
                            id: requestData.pending[i].id,
                            user: {id: user.id, name: user.name, uname: user.uname}
                        }, callbacks.sendServerMsgSuccess, callbacks.failure);
                    }
                } else {
                    if (eidObj !== undefined) {
                        easyrtc.sendDataWS(eidObj.easyrtcid, "friendRequestDenied", {name: user.name}, null);
                        easyrtc.sendServerMessage('deleteRequest', {id: requestData.pending[i].id}, callbacks.sendServerMsgSuccess, callbacks.failure);
                    } else {
                        easyrtc.sendServerMessage('denyFriendRequest', {
                            id: requestData.pending[i].id,
                            user_name: user.name
                        }, callbacks.sendServerMsgSuccess, callbacks.failure);
                    }
                }
            }
        }
        for (var j = 0; j < requestData.processed.length; j++) {
            if (requestData.processed[i].type === "friend") {
                if (requestData.processed[i].accepted) {
                    createAndAddFriend(requestData.processed[i].to);
                } else {
                    alert("Your friend request to " + requestData.processed[i].to + " was denied");
                }
            }
        }
    };

    var peerListener = function (sender, msgType, msgData) {
        if (msgType === "chatMessage") {
            chatRoom.handleChat(sender, msgType, msgData);
        } else if (msgType === "removeUser") {
            removeMemberFromRoom(msgData.roomID, msgData.msg.memberID);
        } else if (msgType === "addFriendAsMember") {
            getRoomByID(msgData.roomID).addMember(msgData.msg.friend);
        } else if (msgType === "addRoom") {
            easyrtc.joinRoom(msgData.room.id, null, callbacks.joinRoomSuccess, callbacks.roomFailure);
            var newRoom = new Room(msgData.room.id, msgData.room.name, msgData.room.chats);
            newRoom.members = msgData.room.members;
            rooms.push(newRoom);
        } else if (msgType === "friendRequest") {
            if (confirm("Do you want to accept a friend request from " + msgData.name + "?")) {
                createAndAddFriend(msgData);
                easyrtc.sendDataWS(sender, "friendRequestAccepted", user, null);
            } else {
                easyrtc.sendDataWS(sender, "friendRequestDenied", {name: user.name}, null);
            }
        } else if (msgType === "friendRequestAccepted") {
            createAndAddFriend(msgData);
        } else if (msgType === "friendRequestDenied") {
            alert("Your friend request to " + msgData.name + " was denied");
        } else if (msgType === "unfriend") {
            alert("You were unfriended by " + msgData.name + ".");
            removeFriend(msgData.id);
        } else if (msgType === "leavingRoom") {
            var room = getRoomByID(msgData.room);
            room.removeMember(msgData.user);
        }
        onDataInterception();
    };

    var roomOccupantListener = function (eName, eData) {
        // Update peer online statuses and file senders
        removeInactiveFileSenders();
        resetOnlineStatuses();
        var roomKeys = Object.keys(eData);
        for (var i = 0; i < roomKeys.length; i++) {
            var room = eData[roomKeys[i]];
            var occKeys = Object.keys(room);
            for (var j = 0; j < occKeys.length; j++) {
                var occupant = room[occKeys[j]];
                if (occupant.username !== user.uname) {
                    setOnline(occupant.username);
                    updateFileSender(occupant.easyrtcid);
                }
            }
        }

        onRoomOccupantChange();
    };

    var updateFileSender = function (easyrtcid) {
        if (!(easyrtcid in fileSenders)) {
            fileSenders[easyrtcid] = new FileSender(easyrtcid);
        }
    };

    var removeInactiveFileSenders = function () {

    };

    var setOnline = function (uname) {
        var poolKeys = Object.keys(userPool);
        for (var i = 0; i < poolKeys.length; i++) {
            var user = userPool[poolKeys[i]];
            if (user.uname === uname)
                user.isOnline = true;
        }
    };

    var resetOnlineStatuses = function () {
        var poolKeys = Object.keys(userPool);
        for (var i = 0; i < poolKeys.length; i++) {
            var id = poolKeys[i];
            userPool[id].isOnline = false;
        }
    };

    var createAndAddFriend = function (friendData) {
        var newFriend = new User(friendData.id, friendData.uname, friendData.name);
        newFriend.isOnline = true;
        addFriend(newFriend);
        easyrtc.sendServerMessage('setupFriendship', {
            fID1: user.id,
            fID2: friendData.id
        }, callbacks.sendServerMsgSuccess, callbacks.failure);
    };

    var removeFriend = function (friendID) {
        var toRemoveInd;
        for (var i = 0; i < friends.length; i++) {
            if (friends[i].id === friendID) {
                toRemoveInd = i;
                break;
            }
        }
        friends.splice(toRemoveInd, 1);
    };

    var addFriend = function (friendObj) {
        userPool[friendObj.id] = friendObj;
        friends.push(friendObj);
    };

    var sendFriendRequest = function (userObj) {
        var eidObj = easyrtc.usernameToIds(userObj.uname)[0];
        if (eidObj !== undefined) {
            easyrtc.sendDataWS(eidObj.easyrtcid, "friendRequest", user, null);
        } else {
            var from = Object.assign({}, user);
            delete from.isOnline;
            easyrtc.sendServerMessage('friendRequestDB', {
                from: from,
                toID: userObj.id
            }, callbacks.sendServerMsgSuccess, callbacks.failure);
        }
    };

    var unfriend = function (friendObj) {
        var eidObj = easyrtc.usernameToIds(friendObj.uname)[0];
        if (eidObj !== undefined) {
            easyrtc.sendDataWS(eidObj.easyrtcid, "unfriend", user, null);
        }
        removeFriend(friendObj.id);
        easyrtc.sendServerMessage('unfriendDB', {
            from: user.id,
            friend: friendObj.id
        }, callbacks.sendServerMsgSuccess, callbacks.failure);
        onUnfriend();
    };

    var leaveRoomInSession = function (roomID) {
        var toRemoveRoomInd = getIndexOfRoom(roomID);
        if (chatRoom.isRoomSelected()) {
            if (chatRoom.getSelectedRoom().id === roomID) {
                chatRoom.changeRoom(-1);
            } else if (chatRoom.getSelectedRoom().id > roomID) {
                chatRoom.changeRoom(chatRoom.getSelRoomIndex() - 1);
            }
        }
        easyrtc.leaveRoom(roomID, callbacks.leaveRoomSuccess, callbacks.roomFailure);
        rooms.splice(toRemoveRoomInd, 1);
    };

    var leaveRoom = function (roomObj) {
        roomObj.members.forEach(function (member) {
            var eidObj = easyrtc.usernameToIds(member.uname)[0];
            if (eidObj !== undefined) {
                easyrtc.sendDataWS(eidObj.easyrtcid, "leavingRoom", {room: roomObj.id, user: user.id}, null);
            }
        });
        leaveRoomInSession(roomObj.id);
        if (roomObj.members.length === 0) {
            easyrtc.sendServerMessage('removeRoomDB', {roomID: roomObj.id}, callbacks.sendServerMsgSuccess, callbacks.failure);
        } else {
            easyrtc.sendServerMessage('removeUserDB', {
                roomID: roomObj.id,
                memberID: user.id
            }, callbacks.sendServerMsgSuccess, callbacks.failure);
        }
        onRoomLeave();
    };

    var discFromAllRooms = function () {
        for (var i = 0; i < rooms.length; i++) {
            easyrtc.leaveRoom(rooms[i].id, callbacks.leaveRoomSuccess, callbacks.roomFailure);
        }
    };

    var createRoom = function (name, members) {
        var memberIDs = [user.id];
        for (var i = 0; i < members.length; i++) {
            memberIDs.push(members[i].id);
        }
        var roomData = {
            name: name,
            members: memberIDs
        };
        easyrtc.sendServerMessage('createRoom', roomData, callbacks.sendServerMsgSuccess, callbacks.failure);
    };

    var addRoom = function (roomObj) {
        rooms.push(roomObj);
    };

    var addChatToRoomByIndex = function (roomIndex, chat) {
        rooms[roomIndex].addChat(chat);
    };

    var addChatToRoomByID = function (roomID, chat) {
        getRoomByID(roomID).addChat(chat);
    };

    var removeMemberFromRoom = function (roomID, memberID) {
        var toRemoveRoomInd = -1;
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].id === roomID) {
                rooms[i].removeMember(memberID);
                toRemoveRoomInd = i;
                break;
            }
        }
        if (user.id === memberID) {
            leaveRoomInSession(roomID);
        }
    };

    var getClientUser = function () {
        return user;
    };

    var getPeer = function (userID) {
        return userPool[userID];
    };

    var getRoomByIndex = function (roomIndex) {
        return rooms[roomIndex];
    };

    var getIndexOfRoom = function (roomID) {
        var roomInd = -1;
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].id === roomID) {
                roomInd = i;
                break;
            }
        }
        return roomInd;
    };

    var getRoomByID = function (roomID) {
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].id === roomID)
                return rooms[i];
        }
        console.log("Could not find room with ID " + roomID);
    };

    var getRooms = function () {
        return rooms;
    };

    var getFriends = function () {
        return friends;
    };

    var hasFriend = function (friendObj) {
        for (var i = 0; i < getFriends().length; i++) {
            if (getFriends()[i].id === friendObj.id)
                return true;
        }
        return false;
    };

    var getEasyrtcid = function () {
        return easyrtcid;
    };

    var disconnect = function () {
        discFromAllRooms();
        onDisconnect();
    };

    return {
        connect: connect,
        createRoom: createRoom,
        leaveRoom: leaveRoom,
        addChatToRoomByIndex: addChatToRoomByIndex,
        addChatToRoomByID: addChatToRoomByID,
        addFriend: addFriend,
        sendFriendRequest: sendFriendRequest,
        unfriend: unfriend,
        disconnect: disconnect,
        addRoom: addRoom,
        getClientUser: getClientUser,
        getPeer: getPeer,
        getRoomByIndex: getRoomByIndex,
        getRoomByID: getRoomByID,
        getRooms: getRooms,
        getFriends: getFriends,
        hasFriend: hasFriend,
        getEasyrtcid: getEasyrtcid
    }
})();

var chatRoom = (function () {
    var selRoomIndex = -1;

    var addChatToCurRoom = function (uname, name, msg) {
        chatClient.addChatToRoomByIndex(selRoomIndex, uname + " " + name + ": " + msg);
    };

    var addChatByID = function (roomID, uname, name, msg) {
        chatClient.addChatToRoomByID(roomID, uname + " " + name + ": " + msg);
    };

    var handleChat = function (sender, msgType, msgData) {
        addChatByID(msgData.roomID, msgData.senderUname, msgData.senderName, msgData.msg);
    };

    var sendChat = function (msg) {
        var uname = chatClient.getClientUser().uname;
        var name = chatClient.getClientUser().name;
        addChatToCurRoom(uname, name, msg);
        easyrtc.sendServerMessage('chatMessageDB', {
            roomID: getSelectedRoom().id,
            chatMsg: uname + " " + name + ": " + msg
        }, callbacks.sendServerMsgSuccess, callbacks.failure);
        sendData("chatMessage", msg);
    };

    var removeUser = function (memberID) {
        getSelectedRoom().removeMember(memberID);
        easyrtc.sendServerMessage('removeUserDB', {
            roomID: getSelectedRoom().id,
            memberID: memberID
        }, callbacks.sendServerMsgSuccess, callbacks.failure);
        sendData("removeUser", {memberID: memberID});
    };

    var addFriendAsMember = function (friendID) {
        var friend = null;
        for (var i = 0; i < chatClient.getFriends().length; i++) {
            if (chatClient.getFriends()[i].id === friendID) {
                friend = chatClient.getFriends()[i];
                getSelectedRoom().addMember(chatClient.getFriends()[i]);
                break;
            }
        }
        easyrtc.sendServerMessage('addMemberDB', {
            roomID: getSelectedRoom().id,
            memberID: friendID
        }, callbacks.sendServerMsgSuccess, callbacks.failure);
        sendData("addFriendAsMember", {friend: friend});

        var eidObj = easyrtc.usernameToIds(friend.uname)[0];
        if (eidObj !== undefined) {
            var room = new Room(getSelectedRoom().id, getSelectedRoom().name, getSelectedRoom().chats);
            for (var j = 0; j < getSelectedRoom().members.length; j++) {
                if (getSelectedRoom().members[j].id !== friend.id)
                    room.addMember(getSelectedRoom().members[j]);
            }
            room.addMember(chatClient.getClientUser());
            easyrtc.sendDataWS(eidObj.easyrtcid, "addRoom", {room: room}, null);
        }
    };

    var sendData = function (msgType, data) {
        var uname = chatClient.getClientUser().uname;
        var name = chatClient.getClientUser().name;
        var curRoomID = getSelectedRoom().id;
        var roomOcc = easyrtc.getRoomOccupantsAsArray(curRoomID);
        var msgData = {
            roomID: getSelectedRoom().id,
            msg: data,
            senderUname: uname,
            senderName: name
        };

        for (var i = 0; i < roomOcc.length; i++) {
            if (roomOcc[i] !== chatClient.getEasyrtcid()) {
                easyrtc.sendDataWS(roomOcc[i], msgType, msgData, null);
            }
        }

        onDataSend();
    };

    var getSelectedRoom = function () {
        if (selRoomIndex === -1)
            return null;
        else
            return chatClient.getRoomByIndex(selRoomIndex);
    };

    var isRoomSelected = function () {
        return selRoomIndex !== -1;
    };

    var getSelRoomIndex = function () {
        return selRoomIndex;
    };

    var changeRoom = function (newInd) {
        selRoomIndex = newInd;
        onRoomChange();
    };

    // * DOES NOT INCLUDE CLIENT *
    var getMembers = function () {
        return getSelectedRoom().members;
    };

    var hasMember = function (memberObj) {
        for (var i = 0; i < getMembers().length; i++) {
            if (getMembers()[i].id === memberObj.id)
                return true;
        }
        return false;
    };

    return {
        handleChat: handleChat,
        sendChat: sendChat,
        getSelectedRoom: getSelectedRoom,
        getSelRoomIndex: getSelRoomIndex,
        isRoomSelected: isRoomSelected,
        changeRoom: changeRoom,
        removeUser: removeUser,
        addFriendAsMember: addFriendAsMember,
        getMembers: getMembers,
        hasMember: hasMember
    }
})();

var callbacks = (function () {
    var connectSuccess = function (easyrtcid) {
        console.log("User " + easyrtcid + " connected successfully")
    };

    var sendServerMsgSuccess = function (msgType, msgData) {
        console.log("Successfully sent msg to server")
    };

    var joinRoomSuccess = function (roomName) {
        console.log("Successfully joined " + roomName);
    };

    var leaveRoomSuccess = function (roomName) {
        console.log("Successfully left " + roomName);
    };

    var leaveRoomFailure = function (errorCode, errorText, roomName) {
        easyrtc.showError(errorCode, errorText);
    };

    var failure = function (errorCode, errorText) {
        easyrtc.showError(errorCode, errorText);
    };

    var fileReceiveAcceptReject = function (sender, filenamelist, wasAccepted) {
        wasAccepted(true);
    };

    return {
        connectSuccess: connectSuccess,
        sendServerMsgSuccess: sendServerMsgSuccess,
        joinRoomSuccess: joinRoomSuccess,
        leaveRoomSuccess: leaveRoomSuccess,
        roomFailure: leaveRoomFailure,
        failure: failure,
        fileReceiveAcceptReject: fileReceiveAcceptReject
    }
})();
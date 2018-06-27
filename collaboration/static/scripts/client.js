var chatClient = (function () {
    var searchParams = new URLSearchParams(window.location.search);
    var easyrtcid = "";
    var username = searchParams.get('username');
    var user = new User("", username, "");
    var userPool = {};
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
    };

    var serverListener = function (msgType, msgData, targeting) {
        if (msgType === "userData") {
            fillData(msgType, msgData, targeting);
        }
    };

    var fillData = function (msgType, msgData, targeting) {
        fillUser(msgData.userData);
        fillFriends(msgData.friendData);
        fillRooms(msgData.roomData);
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

    var peerListener = function (sender, msgType, msgData) {
        if (msgType === "chatMessage") {
            chatRoom.handleChat(sender, msgType, msgData);
        } else if (msgType === "removeUser") {
            removeMemberFromRoom(msgData.roomID, msgData.msg.memberID);
        } else if (msgType === "addFriendAsMember") {
            addFriendAsMember(msgData.roomID, msgData.msg.friendID);
        }
        onDataInterception();
    };

    var roomOccupantListener = function (eName, eData) {
        updatePeerOnlineStatuses(eData.default);
        onRoomOccupantChange();
    };

    var updatePeerOnlineStatuses = function (occupants) {
        var poolKeys = Object.keys(userPool);
        for (var i = 0; i < poolKeys.length; i++) {
            var id = poolKeys[i];
            var user = userPool[id];
            user.isOnline = false;
            var occKeys = Object.keys(occupants);

            for (var j = 0; j < occKeys.length; j++) {
                var eid = occKeys[j];
                var occupant = occupants[eid];

                if (user.uname === occupant.username) {
                    user.isOnline = true;
                    break;
                }
            }
        }
    };

    var addFriend = function (friendObj) {
        userPool[friendObj.id] = friendObj;
        friends.push(friendObj);
    };

    var leaveRooms = function () {
        for (var i = 0; i < rooms.length; i++) {
            easyrtc.leaveRoom(rooms[i].id, callbacks.leaveRoomSuccess, callbacks.roomFailure);
        }
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
            if (chatRoom.getSelectedRoom().id === roomID) {
                chatRoom.changeRoom(-1);
            } else if (chatRoom.getSelectedRoom().id > roomID) {
                chatRoom.changeRoom(chatRoom.getSelRoomIndex() - 1);
            }
            easyrtc.leaveRoom(roomID, callbacks.leaveRoomSuccess, callbacks.roomFailure);
            rooms.splice(toRemoveRoomInd, 1);
        }
    };

    var addFriendAsMember = function (roomID, friendID) {
        for (var i = 0; i < friends.length; i++) {
            if (friends[i].id === friendID) {
                getRoomByID(roomID).addMember(friends[i]);
                break;
            }
        }
        if (user.id === friendID) {
            // easyrtc.joinRoom(roomID, null, callbacks.joinRoomSuccess, callbacks.roomFailure);
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

    var getEasyrtcid = function () {
        return easyrtcid;
    };

    var disconnect = function () {
        leaveRooms();
        onDisconnect();
    };

    return {
        connect: connect,
        addChatToRoomByIndex: addChatToRoomByIndex,
        addChatToRoomByID: addChatToRoomByID,
        addFriend: addFriend,
        disconnect: disconnect,
        addRoom: addRoom,
        getClientUser: getClientUser,
        getPeer: getPeer,
        getRoomByIndex: getRoomByIndex,
        getRoomByID: getRoomByID,
        getRooms: getRooms,
        getFriends: getFriends,
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
        easyrtc.sendServerMessage('removeUserDB', {roomID: getSelectedRoom().id, memberID: memberID}, callbacks.sendServerMsgSuccess, callbacks.failure);
        sendData("removeUser", {memberID: memberID});
    };

    var addFriendAsMember = function (friendID) {
        for (var i = 0; i < chatClient.getFriends().length; i++) {
            if (chatClient.getFriends()[i].id === friendID) {
                getSelectedRoom().addMember(chatClient.getFriends()[i]);
                break;
            }
        }
        easyrtc.sendServerMessage('addMemberDB', {roomID: getSelectedRoom().id, memberID: friendID}, callbacks.sendServerMsgSuccess, callbacks.failure);
        sendData("addFriendAsMember", {friendID: friendID});
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
        return getMembers().includes(memberObj);
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

    return {
        connectSuccess: connectSuccess,
        sendServerMsgSuccess: sendServerMsgSuccess,
        joinRoomSuccess: joinRoomSuccess,
        leaveRoomSuccess: leaveRoomSuccess,
        roomFailure: leaveRoomFailure,
        failure: failure
    }
})();
var chatClient = (function () {
    var searchParams = new URLSearchParams(window.location.search);
    var username = searchParams.get('username');
    var user = new User("", username, "");
    var userPool = {};
    var friends = [];
    var rooms = [];

    var connect = function () {
        easyrtc.setUsername(username);
        easyrtc.connect('sandbox-chat', callbacks.connectSuccess, callbacks.failure);

        easyrtc.setPeerListener(chatRoom.handleChat);
        easyrtc.addEventListener("roomOccupant", roomOccupantListener);

        easyrtc.sendServerMessage('clientConnection', {username: username}, callbacks.sendServerMsgSuccess, callbacks.failure);
        easyrtc.setServerListener(fillData);
    };

    var fillData = function (msgType, msgData, targeting) {
        fillUser(msgData.userData);
        fillFriends(msgData.friendData);
        fillRooms(msgData.roomData);
        // console.log(userPool);
        // console.log(friends);
        console.log(rooms);
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

    var roomOccupantListener = function (eName, eData) {
        updatePeerOnlineStatuses(eData.default);
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

        setRoomInfo();
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

    return {
        connect: connect,
        addChatToRoomByIndex: addChatToRoomByIndex,
        addChatToRoomByID: addChatToRoomByID,
        addFriend: addFriend,
        leaveRooms: leaveRooms,
        addRoom: addRoom,
        getClientUser: getClientUser,
        getPeer: getPeer,
        getRoomByIndex: getRoomByIndex,
        getRoomByID: getRoomByID,
        getRooms: getRooms
    }
})();

var chatRoom = (function () {
    var selRoomIndex = -1;

    var addChatToCurRoom = function (uname, name, msg) {
        chatClient.addChatToRoomByIndex(selRoomIndex, uname + " " + name + ": " + msg);
        updateChat();
    };

    var addChatByID = function (roomID, uname, name, msg) {
        chatClient.addChatToRoomByID(roomID, uname + " " + name + ": " + msg);
        updateChat();
    };

    var handleChat = function (sender, msgType, msgData) {
        addChatByID(msgData.roomID, msgData.senderName, msgData.senderName, msgData.msg);
    };

    var sendChat = function (msg) {
        var uname = chatClient.getClientUser().uname;
        var name = chatClient.getClientUser().name;
        var curRoomID = getSelectedRoom().id;
        var roomOcc = easyrtc.getRoomOccupantsAsArray(curRoomID);
        var msgData = {
            roomID: getSelectedRoom().id,
            msg: msg,
            senderUname: uname,
            senderName: name
        };

        addChatToCurRoom(uname, name, msg);
        for (var i = 0; i < roomOcc.length; i++) {
            console.log(roomOcc[i]);
            easyrtc.sendDataWS(roomOcc[i], "chatMessage", msgData);
        }
    };

    var getSelectedRoom = function () {
        if (selRoomIndex === -1)
            return null;
        else
            return chatClient.getRoomByIndex(selRoomIndex);
    };

    var changeRoom = function (newInd) {
        selRoomIndex = newInd;
    };

    return {
        handleChat: handleChat,
        sendChat: sendChat,
        getSelectedRoom: getSelectedRoom,
        changeRoom: changeRoom
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
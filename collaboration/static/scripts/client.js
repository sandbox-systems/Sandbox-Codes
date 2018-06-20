// TODO Move to DB
var users = {
    's': {  // Key is username here, but in the DB should be user id
        id: "1",
        easyrtcid: "",  // Session ID given by EasyRTC
        roomIDs: ["1"]    // For now, only assuming 1 room
    }
};
var rooms = {
    'apple': {
        id: "1",
        users: ["1"]
    },
    'microsoft': {
        id: "2",
        users: ["1"]
    }
};

var chatClient = (function () {
    // TODO Fetch username from something more secure than URL params e.g. DB
    var searchParams = new URLSearchParams(window.location.search);
    var username = searchParams.get('username');
    var user = users[username];
    if (typeof user === "undefined") {
        alert("Username in query parameters invalid");
    }

    var connect = function() {
        var roomNames = Object.keys(rooms);
        for (var i = 0; i < roomNames.length; i++) {
            lobby.addRoom(roomNames[i]);
        }

        easyrtc.setUsername(username);
        easyrtc.setPeerListener(chatLog.addMsg);
        easyrtc.setRoomOccupantListener(room.updateUsers);
        easyrtc.connect('sandbox-collab', onLoginSuccess, onLoginFailure);
    };
    $(document).ready(connect);

    var joinRoom = function (roomID) {
        easyrtc.joinRoom(roomID, null, onRoomJoinSuccess, onRoomJoinFailure);
    };

    var changeRoom = function (roomID) {
        var curID = Object.keys(easyrtc.getRoomsJoined())[0];
        easyrtc.leaveRoom(curID, null, null);
        joinRoom(roomID);
    };

    var onLoginSuccess = function(easyrtcid) {
        user.easyrtcid = easyrtcid;
    };

    var onLoginFailure = function(errorCode, message) {
        easyrtc.showError(errorCode, message);
    };

    var onRoomJoinSuccess = function (roomName) {
        console.log("JOINED " + roomName);
    };

    var onRoomJoinFailure = function (errorCode, errorText, roomName) {
        easyrtc.showError(errorCode, errorText);
    };

    return {
        connect: connect,
        joinRoom: joinRoom,
        changeRoom: changeRoom
    }
})();

var room = (function () {
    var users = [];

    var getUsers = function () {
        return users;
    };

    var updateUsers = function (roomName, occupants, isPrimary) {
        users = occupants;
    };

    return {
        getUsers: getUsers,
        updateUsers: updateUsers
    }
})();

var chatLog = (function () {
    var log = $('#list');
    var msgs = [];

    var addMsg = function (sender, msgType, message) {
        console.log(sender);
        msgs.push(message);
        addMsgToList(sender,  message);
    };

    var addMsgToList = function (sender, message) {
        var item = $('<li/>').attr('role', 'menuitem');
        var senderTxt = $('<span/>').text(sender + ": ").css('font-weight', 'Bold');
        var msgTxt = $('<span/>').text(message);
        senderTxt.appendTo(item);
        msgTxt.appendTo(item);
        item.appendTo(log);
    };

    return {
        addMsg: addMsg
    }
})();

var chatBox = (function () {
    var inputBox = $('#inputBox');
    var button = $('#sendBtn');

    var send = function () {
        var message = inputBox.val();
        chatLog.addMsg("Me", "string", message);
        for (var user in room.getUsers()) {
            easyrtc.sendDataWS(user, "string", message);
        }
        inputBox.val("");
    };

    return {
        send: send
    }
})();

var lobby = (function () {
    var roomsList = $('#rooms').find('ul');

    var addRoom = function (room) {
        var li = $('<li/>');
        li.click(function () {
            chatClient.changeRoom(rooms[room].id);
        });
        li.text(room).appendTo(roomsList)
    };

    return {
        addRoom: addRoom
    }
})();
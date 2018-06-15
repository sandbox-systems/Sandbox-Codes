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
    }
};

var chatClient = (function () {
    // TODO Fetch username from something more secure than URL params e.g. DB
    var searchParams = new URLSearchParams(window.location.search);
    var username = searchParams.get('username');
    var user = users[username];

    var connect = function() {
        easyrtc.setPeerListener(chatLog.addMsg);
        easyrtc.setRoomOccupantListener(room.updateUsers);
        easyrtc.connect('sandbox-collab', onLoginSuccess, onLoginFailure);
    };
    $(document).ready(connect);

    var joinRoom = function (roomID) {
        console.log("BEFORE");
        easyrtc.joinRoom(roomID, null, onRoomJoinSuccess, onRoomJoinFailure);
        console.log("AFTER");
        console.log(easyrtc.getRoomsJoined());
    };

    var onLoginSuccess = function(easyrtcid) {
        user.easyrtcid = easyrtcid;
    };

    var onLoginFailure = function(errorCode, message) {
        easyrtc.showError(errorCode, message);
    };

    var onRoomJoinSuccess = function (roomName) {
        console.log("SUCCESS");
        console.log("JOINED " + roomName);
    };

    var onRoomJoinFailure = function (errorCode, errorText, roomName) {
        console.log("FAILURE");
        easyrtc.showError(errorCode, errorText);
    };

    return {
        connect: connect,
        joinRoom: joinRoom
    }
})();
chatClient.joinRoom(rooms['apple'].id); // TODO move to room picking button onclick listener (for multiple rooms)

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
        msgs.push(message);
        updateLog();
    };

    var updateLog = function () {
        log.empty();
        $.each(msgs, addItemToList);
    };

    var addItemToList = function (i) {
        return $('<li/>').attr('role', 'menuitem').text(msgs[i]).appendTo(log);
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
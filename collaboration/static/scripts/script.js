$(document).ready(chatClient.connect);

// Event handlers called by client
var onConnect = function () {
    setRoomBtns();
    setRoomInfo();
};

var onRoomOccupantChange = function () {
    setRoomInfo();
    setFriendBtns();
};

var onDataInterception = function () {
    setRoomBtns();
    setFriendBtns();
    setRoomInfo();
    updateChat();
};

var onDataSend = function () {
    setRoomInfo();
    setFriendBtns();
    updateChat();
};

var onRoomChange = function () {
    setRoomInfo();
    setFriendBtns();
    updateChat();
};

var onDisconnect = function () {
};

// UI side magic
var setRoomBtns = function () {
    $('#roomList').empty();
    $(chatClient.getRooms()).each(function (i) {
        var li = $('<li/>');
        li.click(function () {
            chatRoom.changeRoom(i);
        });
        li.text(chatClient.getRoomByIndex(i).name).appendTo($('#roomList'));
    });
};

var setFriendBtns = function () {
    var list = $('#friendsList');
    list.empty();
    if (chatRoom.isRoomSelected()) {
        $(chatRoom.getMembers()).each(function (i) {
            var li = $('<li/>');
            li.text(chatRoom.getMembers()[i].name)
                .css('color', chatRoom.getMembers()[i].isOnline ? 'green' : 'red')
                .appendTo(list);

            var removeBtn = $('<input/>');
            removeBtn.attr('id', 'removeBtn')
                .attr('type', 'submit')
                .attr('value', 'Remove')
                .click(function () {
                    chatRoom.removeUser(chatRoom.getMembers()[i].id);
                })
                .appendTo(list);
        });
        $(chatClient.getFriends()).each(function (i) {
            if (!chatRoom.hasMember(chatClient.getFriends()[i])) {
                var li = $('<li/>');
                li.text(chatClient.getFriends()[i].name).appendTo(list);

                var removeBtn = $('<input/>');
                removeBtn.attr('id', 'addBtn')
                    .attr('type', 'submit')
                    .attr('value', 'Add')
                    .click(function () {
                        chatRoom.addFriendAsMember(chatClient.getFriends()[i].id);
                    })
                    .appendTo(list);
            }
        });
    }
};

var setRoomInfo = function () {
    if (!chatRoom.isRoomSelected()) {
        $('#roomName').text("No room selected");
    } else {
        $('#roomName').text(chatRoom.getSelectedRoom().name);
    }
};

var updateChat = function () {
    $('#list').empty();
    if (chatRoom.isRoomSelected()) {
        $(chatRoom.getSelectedRoom().chats).each(function (i) {
            $('<li/>')
                .text(chatRoom.getSelectedRoom().chats[i])
                .appendTo($('#list'));
        });
    }
};

$('#sendBtn').click(function () {
    chatRoom.sendChat($('#inputBox').val());
});

// Called when user leaves page
$(window).bind('beforeunload', function () {
    chatClient.disconnect();
});
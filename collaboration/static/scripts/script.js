$(document).ready(chatClient.connect);

// Event handlers called by client
var onConnect = function() {
    initRoomBtns();
    setRoomInfo();
};

var onRoomOccupantChange = function () {
    setRoomInfo();
};

var onDataInterception = function () {
    initRoomBtns();
    setRoomInfo();
    updateChat();
};

var onDataSend = function () {
    setRoomInfo();
    updateChat();
};

var onDisconnect = function () {
};

// UI side magic
var initRoomBtns = function () {
    $('#roomList').empty();
    $(chatClient.getRooms()).each(function (i) {
        var li = $('<li/>');
        li.click(function () {
            chatRoom.changeRoom(i);
            setRoomInfo();
            updateChat();
        });
        li.text(chatClient.getRoomByIndex(i).name).appendTo($('#roomList'));
    });
};

var setRoomInfo = function () {
    if (chatRoom.getSelectedRoom() == null) {
        $('#roomName').text("No room selected");
        $('#members').text("");
    } else {
        $('#roomName').text(chatRoom.getSelectedRoom().name);
        $('#members').empty();
        $(chatRoom.getSelectedRoom().members).each(function (i) {
            $('<span/>')
                .click(function () {
                    chatRoom.removeUser(chatRoom.getSelectedRoom().members[i].id);
                })
                .text(chatRoom.getSelectedRoom().members[i].name + "  ")
                .css('color', chatRoom.getSelectedRoom().members[i].isOnline ? 'green' : 'red')
                .appendTo($('#members'));
        });
    }
};

var updateChat = function () {
    $('#list').empty();
    $(chatRoom.getSelectedRoom().chats).each(function (i) {
        $('<li/>')
            .text(chatRoom.getSelectedRoom().chats[i])
            .appendTo($('#list'));
    });
};

$('#sendBtn').click(function () {
    chatRoom.sendChat($('#inputBox').val());
});

// Called when user leaves page
$(window).bind('beforeunload', function () {
    chatClient.disconnect();
});
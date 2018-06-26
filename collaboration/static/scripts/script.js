$(document).ready(chatClient.connect);

var initRoomBtns = function () {
    console.log(chatClient.getRooms());
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

setTimeout(function () {
    initRoomBtns();
    setRoomInfo();
}, 200);

$('#sendBtn').click(function () {
    chatRoom.sendChat($('#inputBox').val());
});

$(window).bind('beforeunload', function () {
    chatClient.leaveRooms();
});
$(document).ready(chatClient.connect);

// Event handlers called by client
var onConnect = function () {
    setRoomBtns();
    setRoomInfo();
    setupCreateRoomForm();
};

var onRoomOccupantChange = function () {
    setRoomInfo();
    setFriendBtns();
};

var onRoomCreated = function () {
    setRoomBtns();
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
var createRoomFormMemberNames = [];
var createRoomFormMembers = [];

var setupCreateRoomForm = function () {
    var friendList = $('#createRoomFriends');
    friendList.empty();
    $(chatClient.getFriends()).each(function (i) {
        if (!createRoomFormMemberNames.includes(chatClient.getFriends()[i].name)) {
            $('<li/>').text(chatClient.getFriends()[i].name)
                .css('cursor', 'pointer')
                .click(function () {
                    createRoomFormMemberNames.push(chatClient.getFriends()[i].name);
                    createRoomFormMembers.push(chatClient.getFriends()[i]);
                    $('#createRoomMembers').text(createRoomFormMemberNames.toString());
                    setupCreateRoomForm();
                })
                .appendTo(friendList);
        }
    });
};

var createRoom = function () {
    chatClient.createRoom($('#createRoomName').val(), createRoomFormMembers);
    closeCreateRoomForm();
};

var setRoomBtns = function () {
    var list = $('#roomList');
    list.empty();
    var item = $('<li/>');
    $('<input/>').css('background', 'green').css('border', 'none').css('color', 'white').css('cursor', 'pointer')
        .attr('type', 'submit')
        .attr('value', '+')
        .click(function () {
            $('#createRoomForm').css('display', 'block');
            setupCreateRoomForm();
        }).appendTo(item);
    item.appendTo(list);
    $(chatClient.getRooms()).each(function (i) {
        var li = $('<li/>');
        li.click(function () {
            chatRoom.changeRoom(i);
        });
        li.text(chatClient.getRoomByIndex(i).name).appendTo(list);
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
            removeBtn.addClass('redBtn')
                .attr('type', 'submit')
                .attr('value', 'Remove')
                .click(function () {
                    chatRoom.removeUser(chatRoom.getMembers()[i].id);
                })
                .appendTo(list);

            if (!chatClient.hasFriend(chatRoom.getMembers()[i])) {
                $('<br/>').appendTo(list);
                var addFriendBtn = $('<input/>');
                addFriendBtn.addClass('blueBtn')
                    .attr('type', 'submit')
                    .attr('value', 'Add Friend')
                    .click(function () {
                        chatClient.sendFriendRequest(chatRoom.getMembers()[i]);
                    })
                    .appendTo(list);
            }
        });
        $(chatClient.getFriends()).each(function (i) {
            if (!chatRoom.hasMember(chatClient.getFriends()[i])) {
                var li = $('<li/>');
                li.text(chatClient.getFriends()[i].name).appendTo(list);

                var addBtn = $('<input/>');
                addBtn.addClass('greenBtn')
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

var closeCreateRoomForm = function() {
    createRoomFormMemberNames.splice(0, createRoomFormMemberNames.length);
    createRoomFormMembers.splice(0, createRoomFormMembers.length);
    $('#createRoomMembers').empty();
    $('#createRoomName').val('');
    $('#createRoomForm').css('display', 'none');
};

$('#sendBtn').click(function () {
    chatRoom.sendChat($('#inputBox').val());
});

// Called when user leaves page
$(window).bind('beforeunload', function () {
    chatClient.disconnect();
});
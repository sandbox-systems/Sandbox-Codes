$(document).ready(chatClient.connect);

// Assumes return jQuerySelector
var getDropper = function () {
    return $('#attachForm');
};

// Event handlers called by client
var onConnect = function () {
    setRoomBtns();
    setRoomInfo();
    setupCreateRoomForm();
    setupAttachmentsForm();
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

var onFileInterception = function () {
    updateChat();
};

var onFileCollection = function () {
    setAttachmentsList();
};

var onFilesSent = function () {
    updateChat();
    closeAttachForm();
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
    $('#input').css('display', 'block');
};

var onUnfriend = function () {
    setFriendBtns();
};

var onRoomLeave = function () {
    setRoomBtns();
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

var setupAttachmentsForm = function () {
    $('#attachBtn').click(function () {
        $('#attachForm').css('display', 'block');
    });
    $('#attachCancelBtn').click(function () {
        closeAttachForm();
    });
    $('#attachSendBtn').click(function () {
        chatClient.sendCollectedFiles();
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
    if (chatRoom.isARoomSelected()) {
        $(chatRoom.getMembers()).each(function (i) {
            var li = $('<li/>');
            li.text(chatRoom.getMembers()[i].name)
                .css('color', chatRoom.getMembers()[i].isOnline ? 'green' : 'red')
                .appendTo(list);

            var removeBtn = $('<input/>');
            removeBtn.addClass('redBtn')
                .attr('type', 'submit')
                .attr('value', 'Remove From Room')
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
            } else {
                $('<br/>').appendTo(list);
                var remFriendBtn = $('<input/>');
                remFriendBtn.addClass('yellowBtn')
                    .attr('type', 'submit')
                    .attr('value', 'Remove Friend')
                    .click(function () {
                        chatClient.unfriend(chatRoom.getMembers()[i]);
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
                    .attr('value', 'Add To Room')
                    .click(function () {
                        chatRoom.addFriendAsMember(chatClient.getFriends()[i].id);
                    })
                    .appendTo(list);

                $('<br/>').appendTo(list);
                var remFriendBtn = $('<input/>');
                remFriendBtn.addClass('yellowBtn')
                    .attr('type', 'submit')
                    .attr('value', 'Remove Friend')
                    .click(function () {
                        chatClient.unfriend(chatClient.getFriends()[i]);
                    })
                    .appendTo(list);
            }
        });
    }
};

var setAttachmentsList = function () {
    var list = $('#attachments');
    list.empty();
    chatClient.getFilesToSend().forEach(function (file) {
        $('<li/>').text(file.name).appendTo(list);
    });
};

var setRoomInfo = function () {
    var info = $('#info');
    info.find('input').remove();
    if (!chatRoom.isARoomSelected()) {
        $('#roomName').text("No room selected");
    } else {
        $('#roomName').text(chatRoom.getSelectedRoom().name);
        var temp = $('<button/>').addClass('redBtn')
            .click(function () {
                if (confirm("Are you sure you want to leave this group?")) {
                    chatClient.leaveRoom(chatRoom.getSelectedRoom());
                }
            })
            .appendTo(info);
		$('<i/>').addClass('fas fa-sign-out-alt').attr('style','color:white;').appendTo(temp);
		
    }
};

var updateChat = function () {
    var list = $('#list');
    list.empty();
    if (chatRoom.isARoomSelected()) {
        chatRoom.getSelectedRoom().chats.forEach(function (content) {
			var you = "";
			var name = chatClient.getClientUser().uname;
            if (typeof content === "string") {
                $('<li/>')
                    .text(content)
                    .appendTo(list);
            } else if (typeof content === "object") {
                $('<li/>').text(content.fromUname + " " + content.fromName)
                    .appendTo(list);
                if (content.type.includes("image")) {   // MIME Type
                    var img = $('<img src=""/>');
                    content.parseAsImage(img);
                    img.appendTo(list);
                } else {
                    $('<li/>').text(content.name)
                        .appendTo(list);
                }
                /*$('<input/>').addClass('greenBtn')
                    .attr('type', 'submit')
                    .attr('value', 'Download')
                    .click(function () {
                        content.download();
                    })
                    .appendTo(list);*/
            }
        });
    }
};


var closeCreateRoomForm = function () {
    createRoomFormMemberNames.splice(0, createRoomFormMemberNames.length);
    createRoomFormMembers.splice(0, createRoomFormMembers.length);
    $('#createRoomMembers').empty();
    $('#createRoomName').val('');
    $('#createRoomForm').css('display', 'none');
};

var closeAttachForm = function () {
    $('#attachForm').css('display', 'none');
    setAttachmentsList();
};

$('#sendBtn').click(function () {
    chatRoom.sendChat($('#inputBox').val());
});

// Called when user leaves page
$(window).bind('beforeunload', function () {
    chatClient.disconnect();
});
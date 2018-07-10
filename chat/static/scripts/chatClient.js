angular.module("chat", [])

.controller("chatCtrl", function ($scope) {
    $scope.user = new User("", "", "");
    $scope.rooms = [];
    $scope.friends = [];
    $scope.filesToSend = [];
    $scope.selRoomIndex = -1;
    $scope.createRoomFormMemberNames = [];
    $scope.createRoomFormMembers = [];

    $scope.typeof = function (variable) {
        return typeof variable;
    };

    $scope.addCreateRoomFormMember = function (member) {
        $scope.createRoomFormMembers.push(member);
        $scope.createRoomFormMemberNames.push(member.name);
    };

    $scope.removeCreateRoomFormMember = function (member) {
        $scope.createRoomFormMembers.splice($scope.createRoomFormMembers.indexOf(member), 1);
        $scope.createRoomFormMemberNames.splice($scope.createRoomFormMemberNames.indexOf(member.name), 1);
    };

    $scope.chatClient = (function () {
        var searchParams = new URLSearchParams(window.location.search);
        var easyrtcid = "";
        var username = searchParams.get('username');
        var userPool = {};
        var fileSenders = {};
        var fileSenderPool = {toRemove: {}};
        var typingTimer = null;

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

            // [0] converts jQuerySelector to DOMString
            easyrtc_ft.buildDragNDropRegion($('#attachForm')[0], fileCollectionHandler);
            easyrtc_ft.buildFileReceiver(callbacks.fileReceiveAcceptReject, fileReceiveHandler, function (sender, status) {
            });
        };

        var fileReceiveHandler = function (from, blob, filename, clientData) {
            addChatToRoomByID(clientData.room, new SentFile(clientData.fromName, clientData.fromUname, filename, blob));
        };

        var fileCollectionHandler = function (files) {
            for (var i = 0; i < files.length; i++) {
                $scope.$apply(function () {
                    $scope.filesToSend.push(files[i]);
                });
            }
        };

        var sendCollectedFiles = function () {
            var roomID = $scope.chatRoom.getSelectedRoom().id;
            var keys = Object.keys(fileSenders[roomID]);
            for (var i = 0; i < keys.length; i++) {
                fileSenders[roomID][keys[i]].sendFiles($scope.filesToSend, $scope.user, roomID);
            }
            Object.keys($scope.filesToSend).forEach(function (key) {
                var file = $scope.filesToSend[key];
                var blob = file.slice();
                var sentFile = new SentFile($scope.user.name, $scope.user.uname, file.name, blob, file.type);
                addChatToRoomByID(roomID, sentFile);
                easyrtc.sendServerMessage('fileMsgDB', {
                    roomID: roomID,
                    file: sentFile
                }, callbacks.sendServerMsgSuccess, callbacks.failure);
            });
            $scope.filesToSend = [];
        };

        var getFilesToSend = function () {
            return $scope.filesToSend;
        };

        var serverListener = function (msgType, msgData, targeting) {
            if (msgType === "userData") {
                fillData(msgType, msgData, targeting);
            } else if (msgType === "newRoomData") {
                var newRoom = new Room(msgData.id, msgData.name, []);
                for (var i = 0; i < msgData.members.length; i++) {
                    if (msgData.members[i] !== $scope.user.id)
                        newRoom.members.push(userPool[msgData.members[i]]);
                }
                $scope.$apply(function () {
                    $scope.rooms.push(newRoom);
                });
                for (var f = 0; f < $scope.friends.length; f++) {
                    var eidObj = easyrtc.usernameToIds($scope.friends[f].uname)[0];
                    if (eidObj !== undefined) {
                        var room = new Room(newRoom.id, newRoom.name, newRoom.chats);
                        for (var j = 0; j < newRoom.members.length; j++) {
                            if (newRoom.members[j].id !== $scope.friends[f].id)
                                room.addMember(newRoom.members[j]);
                        }
                        room.addMember($scope.chatClient.getClientUser());
                        easyrtc.sendDataWS(eidObj.easyrtcid, "addRoom", {room: room}, null);
                    }
                }
                easyrtc.joinRoom(newRoom.id, null, callbacks.joinRoomSuccess, callbacks.roomFailure);
            }
        };

        var fillData = function (msgType, msgData, targeting) {
            fillUser(msgData.userData);
            fillFriends(msgData.friendData);
            fillRooms(msgData.roomData);
            handleRequests(msgData.requestData);
            handleNotifications(msgData.notifData);
        };

        var fillUser = function (userData) {
            $scope.$apply(function () {
                $scope.user.id = userData.id;
                $scope.user.uname = username;
                $scope.user.name = userData.name;
            });
        };

        var fillFriends = function (friendData) {
            for (var i = 0; i < friendData.length; i++) {
                var datum = friendData[i];
                addFriend(new User(datum.id, datum.uname, datum.name));
            }
        };

        function base64_to_blob(s) {
            var byteChars = atob(s);
            var l = byteChars.length;
            var byteNumbers = new Array(l);
            for (var i = 0; i < l; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
            }
            return new Blob([new Uint8Array(byteNumbers)]);
        }

        var fillRooms = function (roomData) {
            for (var i = 0; i < roomData.length; i++) {
                var datum = roomData[i];
                for (var c = 0; c < datum.chats.length; c++) {
                    if (typeof datum.chats[c] === "object") {
                        datum.chats[c].blob = base64_to_blob(datum.chats[c].blob);
                        datum.chats[c] = new SentFile(datum.chats[c].fromName, datum.chats[c].fromUname,
                            datum.chats[c].name, datum.chats[c].blob, datum.chats[c].type);
                    }
                }
                var room = new Room(datum.id, datum.name, datum.chats);
                room.unread = datum.unread;

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
                $scope.$apply(function () {
                    $scope.rooms.push(room);
                });
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
                            easyrtc.sendDataWS(eidObj.easyrtcid, "friendRequestAccepted", $scope.user, null);
                            easyrtc.sendServerMessage('deleteRequest', {id: requestData.pending[i].id}, callbacks.sendServerMsgSuccess, callbacks.failure);
                        } else {
                            easyrtc.sendServerMessage('approveFriendRequest', {
                                id: requestData.pending[i].id,
                                user: {id: $scope.user.id, name: $scope.user.name, uname: $scope.user.uname}
                            }, callbacks.sendServerMsgSuccess, callbacks.failure);
                        }
                    } else {
                        if (eidObj !== undefined) {
                            easyrtc.sendDataWS(eidObj.easyrtcid, "friendRequestDenied", {name: $scope.user.name}, null);
                            easyrtc.sendServerMessage('deleteRequest', {id: requestData.pending[i].id}, callbacks.sendServerMsgSuccess, callbacks.failure);
                        } else {
                            easyrtc.sendServerMessage('denyFriendRequest', {
                                id: requestData.pending[i].id,
                                user_name: $scope.user.name
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

        var handleNotifications = function (notifData) {
            notifData.forEach(notification => {
                alert(notification.message)
            });
        };

        var peerListener = function (sender, msgType, msgData) {
            if (msgType === "chatMessage") {
                $scope.chatRoom.handleChat(sender, msgType, msgData);
            } else if (msgType === "removeUser") {
                removeMemberFromRoom(msgData.roomID, msgData.msg.memberID);
            } else if (msgType === "addFriendAsMember") {
                getRoomByID(msgData.roomID).addMember(msgData.msg.friend);
            } else if (msgType === "addRoom") {
                easyrtc.joinRoom(msgData.room.id, null, callbacks.joinRoomSuccess, callbacks.roomFailure);
                var newRoom = new Room(msgData.room.id, msgData.room.name, msgData.room.chats);
                newRoom.members = msgData.room.members;
                $scope.$apply(function () {
                    $scope.rooms.push(newRoom);
                });
            } else if (msgType === "friendRequest") {
                if (confirm("Do you want to accept a friend request from " + msgData.name + "?")) {
                    createAndAddFriend(msgData);
                    easyrtc.sendDataWS(sender, "friendRequestAccepted", $scope.user, null);
                } else {
                    easyrtc.sendDataWS(sender, "friendRequestDenied", {name: $scope.user.name}, null);
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
            } else if (msgType === "typingStatus") {
                $scope.$apply(function () {
                    userPool[msgData.id].isTyping = msgData.isTyping ? msgData.room : false;
                });
            }
        };

        var roomOccupantListener = function (eName, eData) {
            // Update peer online statuses and file senders
            var newToRemove = {};
            enableActiveUsers(eData, newToRemove);
            disableInactiveUsers();
            fileSenderPool.toRemove = Object.assign({}, newToRemove);
        };

        var enableActiveUsers = function (eData, newToRemove) {
            Object.keys(eData).forEach(function (roomID) {
                fileSenders[roomID] = {};
                Object.keys(eData[roomID]).forEach(function (eid) {
                    if (eData[roomID][eid].username !== $scope.user.uname) {
                        if (Object.keys(fileSenderPool.toRemove).includes(eid)) {
                            delete fileSenderPool.toRemove[eid];
                        }
                        if (!Object.keys(fileSenderPool).includes(eid)) {
                            fileSenderPool[eid] = new FileSender(eid, eData[roomID][eid].username);
                        }
                        fileSenders[roomID][eid] = fileSenderPool[eid];
                        if (!Object.keys(newToRemove).includes(eid)) {
                            newToRemove[eid] = [];
                        }
                        newToRemove[eid].push(roomID);
                        setOnlineStatus(eData[roomID][eid].username, true);
                    }
                });
            });
        };

        var disableInactiveUsers = function () {
            if (Object.keys(fileSenderPool.toRemove).length !== 0) {
                Object.keys(fileSenderPool.toRemove).forEach(function (eid) {
                    fileSenderPool.toRemove[eid].forEach(function (roomID) {
                        delete fileSenders[roomID][eid];
                    });
                    setOnlineStatus(fileSenderPool[eid].uname, false);
                    delete fileSenderPool[eid];
                });
            }
        };

        var setOnlineStatus = function (uname, isOnline) {
            var poolKeys = Object.keys(userPool);
            for (var i = 0; i < poolKeys.length; i++) {
                var user = userPool[poolKeys[i]];
                if (user.uname === uname) {
                    $scope.$apply(function () {
                        user.isOnline = isOnline;
                    });
                    break;
                }
            }
        };

        var createAndAddFriend = function (friendData) {
            var newFriend = new User(friendData.id, friendData.uname, friendData.name);
            newFriend.isOnline = true;
            addFriend(newFriend);
            easyrtc.sendServerMessage('setupFriendship', {
                fID1: $scope.user.id,
                fID2: friendData.id
            }, callbacks.sendServerMsgSuccess, callbacks.failure);
        };

        var removeFriend = function (friendID) {
            var toRemoveInd;
            for (var i = 0; i < $scope.friends.length; i++) {
                if ($scope.friends[i].id === friendID) {
                    toRemoveInd = i;
                    break;
                }
            }
            $scope.$apply(function () {
                $scope.friends.splice(toRemoveInd, 1);
            });
        };

        var addFriend = function (friendObj) {
            userPool[friendObj.id] = friendObj;
            $scope.$apply(function () {
                $scope.friends.push(friendObj);
            });
        };

        var sendFriendRequest = function (userObj) {
            var eidObj = easyrtc.usernameToIds(userObj.uname)[0];
            if (eidObj !== undefined) {
                easyrtc.sendDataWS(eidObj.easyrtcid, "friendRequest", $scope.user, null);
            } else {
                var from = Object.assign({}, $scope.user);
                delete from.isOnline;
                delete from.isTyping;
                easyrtc.sendServerMessage('friendRequestDB', {
                    from: from,
                    toID: userObj.id
                }, callbacks.sendServerMsgSuccess, callbacks.failure);
            }
        };

        var unfriend = function (friendObj) {
            var eidObj = easyrtc.usernameToIds(friendObj.uname)[0];
            if (eidObj !== undefined) {
                easyrtc.sendDataWS(eidObj.easyrtcid, "unfriend", $scope.user, null);
            }
            removeFriend(friendObj.id);
            easyrtc.sendServerMessage('unfriendDB', {
                from: $scope.user.id,
                friend: friendObj.id
            }, callbacks.sendServerMsgSuccess, callbacks.failure);
        };

        var leaveRoomInSession = function (roomID) {
            var toRemoveRoomInd = getIndexOfRoom(roomID);
            if ($scope.chatRoom.isARoomSelected()) {
                if ($scope.chatRoom.getSelectedRoom().id === roomID) {
                    $scope.chatRoom.changeRoom(-1);
                } else if ($scope.chatRoom.getSelectedRoom().id > roomID) {
                    $scope.chatRoom.changeRoom($scope.chatRoom.getSelRoomIndex() - 1);
                }
            }
            easyrtc.leaveRoom(roomID, callbacks.leaveRoomSuccess, callbacks.roomFailure);
            $scope.$apply(function () {
                $scope.rooms.splice(toRemoveRoomInd, 1);
            });
        };

        var leaveRoom = function (roomObj) {
            roomObj.members.forEach(function (member) {
                var eidObj = easyrtc.usernameToIds(member.uname)[0];
                if (eidObj !== undefined) {
                    easyrtc.sendDataWS(eidObj.easyrtcid, "leavingRoom", {
                        room: roomObj.id,
                        user: $scope.user.id
                    }, null);
                }
            });
            leaveRoomInSession(roomObj.id);
            if (roomObj.members.length === 0) {
                easyrtc.sendServerMessage('removeRoomDB', {roomID: roomObj.id}, callbacks.sendServerMsgSuccess, callbacks.failure);
            } else {
                easyrtc.sendServerMessage('removeUserDB', {
                    roomID: roomObj.id,
                    memberID: $scope.user.id
                }, callbacks.sendServerMsgSuccess, callbacks.failure);
            }
        };

        var discFromAllRooms = function () {
            for (var i = 0; i < $scope.rooms.length; i++) {
                easyrtc.leaveRoom($scope.rooms[i].id, callbacks.leaveRoomSuccess, callbacks.roomFailure);
            }
        };

        var createRoom = function (name, members) {
            var memberIDs = [$scope.user.id];
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
            $scope.$apply(function () {
                $scope.rooms.push(roomObj);
            });
        };

        var addChatToRoomByIndex = function (roomIndex, chat) {
            $scope.rooms[roomIndex].addChat(chat);
        };

        var addChatToRoomByID = function (roomID, chat) {
            getRoomByID(roomID).addChat(chat);
        };

        var removeMemberFromRoom = function (roomID, memberID) {
            var toRemoveRoomInd = -1;
            for (var i = 0; i < $scope.rooms.length; i++) {
                if ($scope.rooms[i].id === roomID) {
                    $scope.$apply(function () {
                        $scope.rooms[i].removeMember(memberID);
                    });
                    toRemoveRoomInd = i;
                    break;
                }
            }
            if ($scope.user.id === memberID) {
                leaveRoomInSession(roomID);
            }
        };

        var getClientUser = function () {
            return $scope.user;
        };

        var getPeer = function (userID) {
            return userPool[userID];
        };

        var getRoomByIndex = function (roomIndex) {
            return $scope.rooms[roomIndex];
        };

        var getIndexOfRoom = function (roomID) {
            var roomInd = -1;
            for (var i = 0; i < $scope.rooms.length; i++) {
                if ($scope.rooms[i].id === roomID) {
                    roomInd = i;
                    break;
                }
            }
            return roomInd;
        };

        var getRoomByID = function (roomID) {
            for (var i = 0; i < $scope.rooms.length; i++) {
                if ($scope.rooms[i].id === roomID)
                    return $scope.rooms[i];
            }
            console.log("Could not find room with ID " + roomID);
        };

        var getRooms = function () {
            return $scope.rooms;
        };

        var getFriends = function () {
            return $scope.friends;
        };

        var hasFriend = function (friendObj) {
            for (var i = 0; i < getFriends().length; i++) {
                if (getFriends()[i].id === friendObj.id)
                    return true;
            }
            return false;
        };

        var updateTypingStatus = function () {
            if (typingTimer === null) {
                easyrtc.getRoomOccupantsAsArray($scope.chatRoom.getSelectedRoom().id).forEach(eid => {
                    if (eid !== easyrtcid) {
                        easyrtc.sendDataWS(eid, "typingStatus", {
                            isTyping: true,
                            id: $scope.user.id,
                            room: $scope.chatRoom.getSelectedRoom().id
                        }, null);
                    }
                });
            } else {
                clearTimeout(typingTimer);
            }
            typingTimer = setTimeout(function () {
                easyrtc.getRoomOccupantsAsArray($scope.chatRoom.getSelectedRoom().id).forEach(eid => {
                    if (eid !== easyrtcid) {
                        easyrtc.sendDataWS(eid, "typingStatus", {
                            isTyping: false,
                            id: $scope.user.id
                        }, null);
                    }
                });
                typingTimer = null;
            }, 2000);
        };

        var getEasyrtcid = function () {
            return easyrtcid;
        };

        var disconnect = function () {
            discFromAllRooms();
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
            getEasyrtcid: getEasyrtcid,
            sendCollectedFiles: sendCollectedFiles,
            getFilesToSend: getFilesToSend,
            updateTypingStatus: updateTypingStatus
        }
    })();

    $scope.chatRoom = (function () {
        var addChatToCurRoom = function (uname, name, msg) {
            $scope.chatClient.addChatToRoomByIndex($scope.selRoomIndex, uname + " " + name + ": " + msg);
        };

        var addChatByID = function (roomID, uname, name, msg) {
            $scope.chatClient.addChatToRoomByID(roomID, uname + " " + name + ": " + msg);
        };

        var handleChat = function (sender, msgType, msgData) {
            addChatByID(msgData.roomID, msgData.senderUname, msgData.senderName, msgData.msg);
            if (!isARoomSelected() || msgData.roomID !== getSelectedRoom().id) {
                easyrtc.sendServerMessage('incUnread', {
                    roomID: msgData.roomID,
                    memberID: $scope.user.id
                }, callbacks.sendServerMsgSuccess, callbacks.failure);
                $scope.$apply(function () {
                    $scope.chatClient.getRoomByID(msgData.roomID).unread++;
                });
            }
        };

        var sendChat = function (msg) {
            var uname = $scope.chatClient.getClientUser().uname;
            var name = $scope.chatClient.getClientUser().name;
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

        var addFriendAsMember = function (friend) {
            getSelectedRoom().addMember(friend);
            easyrtc.sendServerMessage('addMemberDB', {
                roomID: getSelectedRoom().id,
                memberID: friend.id
            }, callbacks.sendServerMsgSuccess, callbacks.failure);
            sendData("addFriendAsMember", {friend: friend});

            var eidObj = easyrtc.usernameToIds(friend.uname)[0];
            if (eidObj !== undefined) {
                var room = new Room(getSelectedRoom().id, getSelectedRoom().name, getSelectedRoom().chats);
                for (var j = 0; j < getSelectedRoom().members.length; j++) {
                    if (getSelectedRoom().members[j].id !== friend.id)
                        room.addMember(getSelectedRoom().members[j]);
                }
                room.addMember($scope.chatClient.getClientUser());
                easyrtc.sendDataWS(eidObj.easyrtcid, "addRoom", {room: room}, null);
            }
        };

        var sendData = function (msgType, data) {
            var uname = $scope.chatClient.getClientUser().uname;
            var name = $scope.chatClient.getClientUser().name;
            var curRoomID = getSelectedRoom().id;
            var roomOcc = easyrtc.getRoomOccupantsAsArray(curRoomID);
            var msgData = {
                roomID: getSelectedRoom().id,
                msg: data,
                senderUname: uname,
                senderName: name
            };

            for (var i = 0; i < roomOcc.length; i++) {
                if (roomOcc[i] !== $scope.chatClient.getEasyrtcid()) {
                    easyrtc.sendDataWS(roomOcc[i], msgType, msgData, null);
                }
            }
        };

        var getSelectedRoom = function () {
            if ($scope.selRoomIndex === -1)
                return null;
            else
                return $scope.chatClient.getRoomByIndex($scope.selRoomIndex);
        };

        var isARoomSelected = function () {
            return $scope.selRoomIndex !== -1;
        };

        var getSelRoomIndex = function () {
            return $scope.selRoomIndex;
        };

        var changeRoom = function (newInd) {
            $scope.selRoomIndex = newInd;
            getSelectedRoom().unread = 0;
            easyrtc.sendServerMessage('resetUnread', {
                roomID: getSelectedRoom().id,
                memberID: $scope.user.id
            }, callbacks.sendServerMsgSuccess, callbacks.failure);
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
            isARoomSelected: isARoomSelected,
            changeRoom: changeRoom,
            removeUser: removeUser,
            addFriendAsMember: addFriendAsMember,
            getMembers: getMembers,
            hasMember: hasMember
        }
    })();

    $scope.chatClient.connect();

    $(window).bind('beforeunload', function () {
        $scope.chatClient.disconnect();
    });
});

let callbacks = (function () {
    let connectSuccess = function (easyrtcid) {
        console.log("User " + easyrtcid + " connected successfully")
    };

    let sendServerMsgSuccess = function (msgType, msgData) {
        console.log("Successfully sent msg to server")
    };

    let joinRoomSuccess = function (roomName) {
        console.log("Successfully joined " + roomName);
    };

    let leaveRoomSuccess = function (roomName) {
        console.log("Successfully left " + roomName);
    };

    let leaveRoomFailure = function (errorCode, errorText, roomName) {
        easyrtc.showError(errorCode, errorText);
    };

    let failure = function (errorCode, errorText) {
        easyrtc.showError(errorCode, errorText);
    };

    let fileReceiveAcceptReject = function (sender, filenamelist, wasAccepted) {
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
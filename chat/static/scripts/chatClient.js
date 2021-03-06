var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(month, date, hour, minute) {
    var fHour = hour % 12;
    var meridiem = hour >= 12 ? "PM" : "AM";
    var fMinute = minute < 10 ? "0" + minute : minute;
    return months[month] + " " + date + ", " + fHour + ":" + fMinute + " " + meridiem;
}

function getUTCTimeNow() {
    var now = new Date();
    var timestamp = formatDate(now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes());
    return timestamp;
}

angular.module("chat", [])
    .directive("selectNgFiles", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    scope.filesToSend.push(files[0]);
                    ngModel.$setViewValue(files);
                })
            }
        }
    })
    .controller("chatCtrl", function ($scope, $timeout) {
        $scope.user = new User("", "", "", "");
        $scope.rooms = [];
        $scope.friends = [];
        $scope.filesToSend = [];
        $scope.selRoomIndex = -1;
        $scope.createRoomFormMemberNames = [];
        $scope.createRoomFormMembers = [];
        $scope.modalMember = {};
        $scope.chatToDeleteIndex = -1;

        $scope.setModalMember = function (member) {
            $scope.modalMember = member;
        };

        $scope.setChatToDeleteIndex = function (ind) {
            $scope.chatToDeleteIndex = ind;
        };

        $scope.trunc = function (str, n) {
            return (str.length > n) ? str.substr(0, n) + '...' : str;
        };

        $scope.formatGroupTextSub = function (chats) {
            if (chats.length === 0)
                return "";
            var last = chats[chats.length - 1];
            var name = last.from.name === $scope.user.name ? "You" : last.from.name;
            var text = name + ": ";
            if (last.type === "message") {
                text += last.message;
            } else {
                text += last.name;
            }
            return $scope.trunc(text, 20);
        }

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

        $scope.isCodeFile = function (filename) {
            if (filename.indexOf('.') === -1)
                return false;
            let split = filename.split('.');
            let ext = split[split.length - 1];
            let possExts = ['java', 'cpp', 'py', 'js', 'html', 'css', 'rb', 'cs', 'c', 'swift', 'h', 'm', 'r'];
            return possExts.includes(ext);
        };

        $scope.getLocalTimeNow = function (UTC) {
            var savedTime = new Date(UTC + " UTC");
            var time = formatDate(savedTime.getMonth(), savedTime.getDate(), savedTime.getHours(), savedTime.getMinutes());
            return time;
        };

        $scope.setChildEditMenuDisplay = function (event, display) {
            let elem = angular.element(event.srcElement || event.target);
            let menu = angular.element(elem[0].nextElementSibling);
            if (display === "visible") {
                /*menu.addClass("ownChatEditMenuFadeIn");
                menu.removeClass("ownChatEditMenuFadeOut");*/
            } else {
                if (!elem[0].classList.contains('btn')) {
                    menu.addClass("ownChatEditMenuFadeOut");
                    menu.removeClass("ownChatEditMenuFadeIn");
                }
            }
        };

        $scope.chatClient = (function () {
            function getParameterByName(name, url) {
                if (!url) url = window.location.href;
                name = name.replace(/[\[\]]/g, '\\$&');
                var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                    results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, ' '));
            }

            var easyrtcid = "";
            var username = "";
            var defaultRoom = getParameterByName('chatGroup');
            var userPool = {};
            var fileSenders = {};
            var fileSenderPool = {toRemove: {}};
            var typingTimer = null;
            var ecode = "";

            var connect = function () {
                var match = document.cookie.match(new RegExp('(^| )5IJFbNgniGHUzVc1SuqWiSPokLMCN0CVOr=([^;]+)'));
                if (!match)
                    return;
                ecode = match[2];

                //easyrtc.setSocketUrl("https://sandboxcodes.com/chatnode/");
                easyrtc.connect('sandbox-chat', function (eid) {
                    easyrtcid = eid;
                    callbacks.connectSuccess(eid);
                }, callbacks.failure);

                easyrtc.setPeerListener(peerListener);
                easyrtc.addEventListener("roomOccupant", roomOccupantListener);

                easyrtc.sendServerMessage('clientConnection', {ecode: ecode}, callbacks.sendServerMsgSuccess, callbacks.failure);
                easyrtc.setServerListener(serverListener);

                // [0] converts jQuerySelector to DOMString
                easyrtc_ft.buildDragNDropRegion($('#attachModal')[0], fileCollectionHandler);
                easyrtc_ft.buildFileReceiver(callbacks.fileReceiveAcceptReject, fileReceiveHandler, function (sender, status) {
                });
            };

            var fileReceiveHandler = function (from, blob, filename, clientData) {
                addChatToRoomByID(clientData.room, clientData.fromUname, "file",
                    new SentFile(getUserByUsername(clientData.fromUname), filename, blob, clientData.timestamp),
                    clientData.timestamp);
            };

            var fileCollectionHandler = function (files) {
                for (var i = 0; i < files.length; i++) {
                    $scope.$apply(function () {
                        $scope.filesToSend.push(files[i]);
                    });
                }
            };

            var clearFilesToSend = function () {
                $scope.filesToSend = [];
            };

            var sendCollectedFiles = function () {
                var roomID = $scope.chatRoom.getSelectedRoom().id;
                var keys = Object.keys(fileSenders[roomID]);
                var timestamp = getUTCTimeNow();
                for (var i = 0; i < keys.length; i++) {
                    fileSenders[roomID][keys[i]].sendFiles($scope.filesToSend, $scope.user, roomID, timestamp);
                }
                Object.keys($scope.filesToSend).forEach(function (key) {
                    var file = $scope.filesToSend[key];
                    var blob = file.slice();
                    var sentFile = {
                        fromUname: $scope.user.uname,
                        name: file.name,
                        blob: blob,
                        type: file.type,
                        timestamp: timestamp
                    };
                    addChatToRoomByID(roomID, sentFile.fromUname, "file", sentFile, timestamp);
                    easyrtc.sendServerMessage('fileMsgDB', {
                        roomID: roomID,
                        file: sentFile
                    }, callbacks.sendServerMsgSuccess, callbacks.failure);
                });
                clearFilesToSend();
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
                username = userData.username;
                ecode = userData.ecode;
                easyrtc.setUsername(username);
                $scope.$apply(function () {
                    $scope.user.id = userData.id;
                    $scope.user.uname = username;
                    $scope.user.name = userData.name;
                    $scope.user.profilepic = userData.profilepic;
                });
            };

            var fillFriends = function (friendData) {
                for (var i = 0; i < friendData.length; i++) {
                    var datum = friendData[i];
                    addFriend(new User(datum.id, datum.uname, datum.name, datum.profilepic));
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
                        if (datum.chats[c].type !== "message") {
                            datum.chats[c].blob = base64_to_blob(datum.chats[c].blob);
                            datum.chats[c] = new SentFile(getUserByUsername(datum.chats[c].fromUname),
                                datum.chats[c].name, datum.chats[c].blob, datum.chats[c].timestamp, datum.chats[c].type);
                        } else if (datum.chats[c].type === "message") {
                            datum.chats[c] = new ChatMessage(getUserByUsername(datum.chats[c].fromUname),
                                datum.chats[c].message, datum.chats[c].timestamp);
                        }
                    }
                    var room = new Room(datum.id, datum.name, datum.chats);
                    room.unread = datum.unread;

                    for (var j = 0; j < datum.members.length; j++) {
                        var member = datum.members[j];
                        if (typeof member === "string") {
                            room.addMember(userPool[member]);
                        } else if (typeof member === "object") {
                            var user = new User(member.id, member.uname, member.name, member.profilepic);
                            userPool[member.id] = user;
                            room.addMember(user);
                        }
                    }
                    $scope.$apply(function () {
                        $scope.rooms.push(room);
                    });
                    easyrtc.joinRoom(datum.id, null, callbacks.joinRoomSuccess, callbacks.roomFailure);
                }
                if (defaultRoom !== null) {
                    for (let r = 0; r < $scope.rooms.length; r++) {
                        if ($scope.rooms[r].name === decodeURI(defaultRoom)) {
                            $scope.chatRoom.changeRoom(r);
                            $scope.chatRoom.scrollToBottom();
                            break;
                        }
                    }
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
                            //alert("Your friend request to " + requestData.processed[i].to + " was denied");
                        }
                    }
                }
            };

            var handleNotifications = function (notifData) {
                notifData.forEach(notification => {
                    //alert(notification.message)
                });
            };

            var peerListener = function (sender, msgType, msgData) {
                if (msgType === "chatMessage") {
                    $scope.chatRoom.handleChat(sender, msgType, msgData);
                } else if (msgType === "memberOnline") {
                    $scope.$apply(function () {
                        getUserByUsername(msgData.username).isOnline = true;
                    });
                } else if (msgType === "removeUser") {
                    removeMemberFromRoom(msgData.roomID, msgData.msg.memberID);
                } else if (msgType === "addFriendAsMember") {
                    getRoomByID(msgData.roomID).addMember(msgData.msg.friend);
                } else if (msgType === "addRoom") {
                    easyrtc.joinRoom(msgData.room.id, null, callbacks.joinRoomSuccess, callbacks.roomFailure);
                    var newRoom = new Room(msgData.room.id, msgData.room.name, msgData.room.chats);
                    newRoom.members = msgData.room.members;
                    $scope.$apply(function () {
                        $scope.rooms.unshift(newRoom);
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
                    //alert("Your friend request to " + msgData.name + " was denied");
                } else if (msgType === "unfriend") {
                    //alert("You were unfriended by " + msgData.name + ".");
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
                Object.keys(eData).forEach(roomID => {
                    fileSenders[roomID] = {};
                    Object.keys(eData[roomID]).forEach(eid => {
                        easyrtc.sendDataWS(eid, "memberOnline", {username: $scope.user.uname}, null);
                        /*if (eData[roomID][eid].username !== $scope.user.uname) {
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
                        }*/
                    });
                });
            };

            var disableInactiveUsers = function () {
                Object.keys(userPool).forEach(key => {
                    userPool[key].isOnline = false;
                    userPool[key].isTyping = false;
                });
                /*if (Object.keys(fileSenderPool.toRemove).length !== 0) {
                    Object.keys(fileSenderPool.toRemove).forEach(function (eid) {
                        fileSenderPool.toRemove[eid].forEach(function (roomID) {
                            delete fileSenders[roomID][eid];
                        });
                        setOnlineStatus(fileSenderPool[eid].uname, false);
                        delete fileSenderPool[eid];
                    });
                }*/
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
                var newFriend = new User(friendData.id, friendData.uname, friendData.name, friendData.profilepic);
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
                $scope.friends.splice(toRemoveInd, 1);
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
                $scope.rooms.splice(toRemoveRoomInd, 1);
            };

            var leaveRoom = function (roomObj) {
                leaveRoomInSession(roomObj.id);
                roomObj.members.forEach(function (member) {
                    var eidObj = easyrtc.usernameToIds(member.uname)[0];
                    if (eidObj !== undefined) {
                        easyrtc.sendDataWS(eidObj.easyrtcid, "leavingRoom", {
                            room: roomObj.id,
                            user: $scope.user.id
                        }, null);
                    }
                });
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

            var addChatToRoomByIndex = function (roomIndex, fromUname, chat, timestamp) {
                $scope.rooms[roomIndex].addChat(new ChatMessage(getUserByUsername(fromUname), chat, timestamp));
                $scope.chatRoom.scrollToBottom();
            };

            var addChatToRoomByID = function (roomID, fromUname, type, chat, timestamp) {
                if (type === "message") {
                    getRoomByID(roomID).addChat(new ChatMessage(getUserByUsername(fromUname), chat, timestamp));
                } else {
                    getRoomByID(roomID).addChat(new SentFile(getUserByUsername(fromUname),
                                chat.name, chat.blob, timestamp, chat.type));
                }
                if (!$scope.chatRoom.isARoomSelected() || roomID !== $scope.chatRoom.getSelectedRoom().id) {
                    easyrtc.sendServerMessage('incUnread', {
                        roomID: roomID,
                        memberID: $scope.user.id
                    }, callbacks.sendServerMsgSuccess, callbacks.failure);
                    $scope.$apply(function () {
                        $scope.chatClient.getRoomByID(roomID).unread++;
                    });
                }
                $scope.chatRoom.scrollToBottom();
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

            var getUserByUsername = function (username) {
                let user = $scope.user;
                Object.keys(userPool).forEach(key => {
                    if (userPool[key].uname === username) {
                        user = userPool[key];
                        return;
                    }
                });
                return user;
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
                updateTypingStatus: updateTypingStatus,
                clearFilesToSend: clearFilesToSend,
                getUserByUsername: getUserByUsername
            }
        })();

        $scope.chatRoom = (function () {
            var scrollToBottom = function () {
                // Wait for chats to be updated
                $timeout(function () {
                    let log = $("#chat");
                    log.scrollTop(log.prop("scrollHeight"));
                });
            };

            var addChatToCurRoom = function (msg) {
                $scope.chatClient.addChatToRoomByIndex($scope.selRoomIndex, msg.fromUname, msg.message, msg.timestamp);
                scrollToBottom();
            };

            var addChatByID = function (roomID, msg) {
                $scope.chatClient.addChatToRoomByID(roomID, msg.fromUname, "message", msg.message, msg.timestamp);
                scrollToBottom();
            };

            var handleChat = function (sender, msgType, msgData) {
                addChatByID(msgData.roomID, {fromUname: msgData.senderUname, message: msgData.msg.message,
                    timestamp: msgData.msg.timestamp});
            };

            var sendChat = function (msg) {
                var uname = $scope.chatClient.getClientUser().uname;
                var timestamp = getUTCTimeNow();
                var message = {
                    type: "message",
                    fromUname: uname,
                    message: msg,
                    timestamp: timestamp
                };
                addChatToCurRoom(message);
                easyrtc.sendServerMessage('chatMessageDB', {
                    roomID: getSelectedRoom().id,
                    chatMsg: message
                }, callbacks.sendServerMsgSuccess, callbacks.failure);
                sendData("chatMessage", {message: msg, timestamp: timestamp});
                getSelectedRoom().members.forEach(member => {
                    var eidObj = easyrtc.usernameToIds(member.uname)[0];
                    if (eidObj === undefined) {
                        easyrtc.sendServerMessage('incUnread', {
                            roomID: getSelectedRoom().id,
                            memberID: member.id
                        }, callbacks.sendServerMsgSuccess, callbacks.failure);
                    }
                });
            };

            var deleteChat = function (index) {
console.log(index);
                getSelectedRoom().chats.splice(index, 1);
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
                if (newInd !== -1) {
                    $scope.selRoomIndex = newInd;
                    scrollToBottom();
                }
                getSelectedRoom().unread = 0;
                easyrtc.sendServerMessage('resetUnread', {
                    roomID: getSelectedRoom().id,
                    memberID: $scope.user.id
                }, callbacks.sendServerMsgSuccess, callbacks.failure);
                if (newInd === -1)
                    $scope.selRoomIndex = newInd;
            };

            // * DOES NOT INCLUDE CLIENT *
            var getMembers = function () {
                if (!isARoomSelected())
                    return [];
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
                scrollToBottom: scrollToBottom,
                handleChat: handleChat,
                sendChat: sendChat,
                deleteChat: deleteChat,
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
        // console.log("User " + easyrtcid + " connected successfully")
    };

    let sendServerMsgSuccess = function (msgType, msgData) {
        // console.log("Successfully sent msg to server")
    };

    let joinRoomSuccess = function (roomName) {
        // console.log("Successfully joined " + roomName);
    };

    let leaveRoomSuccess = function (roomName) {
        // console.log("Successfully left " + roomName);
    };

    let leaveRoomFailure = function (errorCode, errorText, roomName) {
        // easyrtc.showError(errorCode, errorText);
    };

    let failure = function (errorCode, errorText) {
        // easyrtc.showError(errorCode, errorText);
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

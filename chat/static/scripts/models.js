var User = function (id, uname, name, profilepic) {
    this.id = id;
    this.uname = uname;
    this.name = name;
    this.isOnline = false;
    this.isTyping = false;
    this.profilepic = profilepic;
};

var Room = function (id, name, chats) {
    this.id = id;
    this.name = name;
    this.chats = chats;
    this.members = [];
    this.unread = 0;

    this.addMember = function (memberObj) {
        this.members.push(memberObj);
    };

    this.removeMember = function (memberID) {
        var ind = -1;
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].id === memberID) {
                ind = i;
            }
        }
        if (ind === -1) {
            console.log("Could not find member with ID " + memberID + " in room " + this.id);
        } else {
            this.members.splice(ind, 1);
        }
    };

    this.addChat = function (chat) {
        chats.push(chat);
    };
};

var ChatMessage = function (from, message, timestamp) {
    this.type = "message";
    this.from = from;
    this.message = message;
    this.timestamp = timestamp;
};

var SentFile = function (from, name, blob, timestamp, type) {
    this.from = from;
    this.name = name;
    this.blob = Object.prototype.toString.call(this.blob) === "[object ArrayBuffer]" ?
        new Blob([this.blob]) : blob;
    this.url = window.URL.createObjectURL(this.blob);
    this.type = type || blob.type;
    this.timestamp = timestamp;

    this.download = function () {
        easyrtc_ft.saveAs(this.blob, this.name);
    };
};

var FileSender = function (easyrtcid, uname) {
    this.fileSender = easyrtc_ft.buildFileSender(easyrtcid, null, null);
    this.uname = uname;

    this.sendFiles = function (files, from, roomID, timestamp) {
        console.log(easyrtcid);
        this.fileSender(files, true, {fromUname: from.uname, fromName: from.name, room: roomID, timestamp: timestamp});   // Assumes binary
    };
};

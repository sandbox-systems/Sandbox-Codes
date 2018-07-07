var User = function (id, uname, name) {
    this.id = id;
    this.uname = uname;
    this.name = name;
    this.isOnline = false;
};

var Room = function (id, name, chats) {
    this.id = id;
    this.name = name;
    this.chats = chats;
    this.members = [];

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

var SentFile = function (fromName, fromUname, name, blob, type) {
    this.fromName = fromName;
    this.fromUname = fromUname;
    this.name = name;
    this.blob = blob;
    this.type = type || blob.type;

    this.download = function () {
        if (Object.prototype.toString.call(this.blob) === "[object ArrayBuffer]") {
            this.blob = new Blob([this.blob]);
        }
        easyrtc_ft.saveAs(this.blob, this.name);
    };

    this.parseAsImage = function (imgSel) {
        if (Object.prototype.toString.call(this.blob) === "[object ArrayBuffer]") {
            this.blob = new Blob([this.blob]);
        }
        var imageUrl = window.URL.createObjectURL(this.blob);
        imgSel.attr('src', imageUrl);
    };
};

var FileSender = function (easyrtcid, uname) {
    this.fileSender = easyrtc_ft.buildFileSender(easyrtcid, null, null);
    this.uname = uname;

    this.sendFiles = function (files, from, roomID) {
        console.log(easyrtcid);
        this.fileSender(files, true, {fromUname: from.uname, fromName: from.name, room: roomID});   // Assumes binary
    };
};
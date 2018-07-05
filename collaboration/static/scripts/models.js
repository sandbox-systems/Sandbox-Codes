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

var FileSender = function (easyrtcid) {
    this.fileSender = easyrtc_ft.buildFileSender(easyrtcid, null, null);

    this.sendFiles = function (files) {
        console.log(easyrtcid);
        this.fileSender(files, true, {"TEST": 5454545454});   // Assumes binary
    };
};
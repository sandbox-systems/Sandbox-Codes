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

    this.addChat = function (chat) {
        chats.push(chat);
    };
};
var queries = require("./queries");

module.exports = {
    callback: function (pub, easyrtcid, err, successMsg) {
        // General purpose callback for displaying success or failure of an action
        if (err) {
            pub.util.logError("[" + easyrtcid + "] Unhandled easyrtcMsg listener error.", err);
        } else {
            console.log(successMsg);
        }
    },
    emitMsgToClient: function (pub, conObj, msgType, msgObj) {
        var socketCb;

        conObj.socket.on("emitEasyrtcMsg", function (msg, socketCallback) {
            socketCb = socketCallback;
        });

        var msg = {
            "msgData": msgObj
        };

        pub.events.emit("emitEasyrtcMsg", conObj, msgType, msg, socketCb, function (err) {
            module.exports.callback(pub, conObj.getEasyrtcid(), err, "Successfully sent data to client");
        });
    }
};
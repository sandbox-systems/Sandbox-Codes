// Load required modules
var http = require("http");
var express = require("express");
var serveStatic = require('serve-static');
var io = require("socket.io");
var easyrtc = require("easyrtc");

// Setup express http server
var httpApp = express();
httpApp.use(serveStatic('static', {'index': ['index.html']}));

// Start express server
var webServer = http.createServer(httpApp).listen(3000);

// Start socket.io and setup with express server
var socketServer = io.listen(webServer);

// Start EasyRTC server
var easyrtcServer = easyrtc.listen(httpApp, socketServer);
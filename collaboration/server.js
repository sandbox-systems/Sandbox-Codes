// Load required modules
var http = require("http");              // http server core module
var express = require("express");           // web framework external module
var serveStatic = require('serve-static');  // serve static files
var io = require("socket.io");         // web socket external module
var easyrtc = require("easyrtc");           // EasyRTC external module

// Setup express http server
var httpApp = express();
httpApp.use(serveStatic('static', {'index': ['index.html']}));

// Start express server
var webServer = http.createServer(httpApp).listen(3000);

// Start socket.io and setup with express server
var socketServer = io.listen(webServer);

// Start EasyRTC server
var easyrtcServer = easyrtc.listen(httpApp, socketServer);
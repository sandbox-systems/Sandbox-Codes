var net = require('net');
var client = net.createConnection("/var/run/docker.sock");
client.on("connect", function () {
    console.log("Connected successfully");
    //client.write("http://v1.24/containers/3e7d46b185e62412c6914d3385eb3fb6bddb69fd/attach/ws?logs=1&stream=1&stdin=1&stdout=1&stderr=1", "utf8");
    client.write("java", "utf8");
});

client.on('data', function (data) {
    console.log("hi");
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
});

client.on('close', function () {
    console.log('Connection closed');
});

client.on('error', function(error) {
    console.log("ERROR: " + error);
});

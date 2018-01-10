const express = require('express');
const app = express();
const restRouter = require("./routes/rest");
const indexRouter = require("./routes/index");
const path = require('path');
const mongoose =require('mongoose');
mongoose.connect('mongodb://huiqing:1994dhq@ds117913.mlab.com:17913/cs503')

app.use(express.static(path.join(__dirname, '../public/')));
app.use('/',indexRouter);
// app.get('/',function (req,res) {
//   res.send("Hello World!");
// });

app.use('/api/v1',restRouter);

app.use(function(req, res) {
  res.sendFile('index.html', {root: path.join(__dirname, '../public')});
});
// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });

const socketio= require('socket.io');
const http = require('http');
const io = socketio();
const editorSocketService = require('./services/serverSocketService.js')(io);
const server = http.createServer(app);
io.attach(server);
server.listen(3000);

server.on('error', Onerror);
server.on('listening',onListening);

function Onerror() {
  throw error();
}

function onListening(){
  const address = server.address();
  const bind = typeof address === 'string'? 'pipe:'+address :'port'+address.port;
  console.log('listen on:'+bind);
}

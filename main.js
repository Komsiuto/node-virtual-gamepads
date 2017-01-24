// Generated by CoffeeScript 1.10.0

/*
Created by MIROOF on 04/03/2015
Virtual gamepad application
 */

(function() {
  var app, config, express, gamepad_hub, gp_hub, http, io, kb_hub, keyboard_hub, path;

  path = require('path');

  express = require('express');

  app = express();

  http = require('http').Server(app);

  io = require('socket.io')(http);

  config = require('./config.json');

  gamepad_hub = require('./app/virtual_gamepad_hub');

  gp_hub = new gamepad_hub();

  keyboard_hub = require('./app/virtual_keyboard_hub');

  kb_hub = new keyboard_hub();

  app.use(express["static"](__dirname + '/public'));

  io.on('connection', function(socket) {
    socket.on('disconnect', function() {
      if (socket.gamePadId !== void 0) {
        console.info('Gamepad disconnected');
        return gp_hub.disconnectGamepad(socket.gamePadId, function() {});
      } else if (socket.keyBoardId !== void 0) {
        console.info('Keyboard disconnected');
        return kb_hub.disconnectKeyboard(socket.keyBoardId, function() {});
      } else {
        return console.info('Unknown disconnect');
      }
    });
    socket.on('connectGamepad', function() {
      return gp_hub.connectGamepad(function(gamePadId) {
        if (gamePadId !== -1) {
          console.info('Gamepad connected');
          socket.gamePadId = gamePadId;
          return socket.emit('gamepadConnected', {
            padId: gamePadId
          });
        } else {
          return console.info('Gamepad connect failed');
        }
      });
    });
    socket.on('padEvent', function(data) {
      console.info('Pad event', data);
      if (socket.gamePadId !== void 0 && data) {
        return gp_hub.sendEvent(socket.gamePadId, data);
      }
    });
    socket.on('connectKeyboard', function() {
      return kb_hub.connectKeyboard(function(keyBoardId) {
        if (keyBoardId !== -1) {
          console.info('Keyboard connected');
          socket.keyBoardId = keyBoardId;
          return socket.emit('keyboardConnected', {
            boardId: keyBoardId
          });
        } else {
          return console.info('Keyboard connect failed');
        }
      });
    });
    return socket.on('boardEvent', function(data) {
      console.info('Board event', data);
      if (socket.keyBoardId !== void 0 && data) {
        return kb_hub.sendEvent(socket.keyBoardId, data);
      }
    });
  });

  http.on('error', function(err) {
    switch (err.message) {
      case "listen EACCES":
        console.error("You don't have permissions to open port", config.port, "For ports smaller than 1024, you need root privileges.");
    }
    throw err;
  });

  http.listen(config.port, function() {
    return console.info("Listening on " + process.env.PORT || config.port);
  });

}).call(this);

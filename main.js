'use strict';
const electron = require('electron');
const Git = require('nodegit')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const oAuthGithub = require("./lib/oAuthGithub")({
  client_id: "",
  client_secret: "",
  scopes: ["user:email", "notifications"]
})
var githubToken;

let mainWindow;

app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  var indexUrl = "file://" + __dirname + "/index.html"


  mainWindow.loadURL(indexUrl);
  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  oAuthGithub.openWindow(function (error, token) {
    githubToken = token
  })

});

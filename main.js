'use strict';
const electron = require('electron');
const Git = require('nodegit');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const dialog = electron.dialog

const oAuthGithub = require("./lib/oAuthGithub")({
  client_id: "",
  client_secret: "",
  scopes: ["user:email", "notifications"]
});

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
  var indexUrl = "file://" + __dirname + "/index.html";


  mainWindow.loadURL(indexUrl);
  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  // listening to get a github token
  ipcMain.on("getGithubToken", function (event, arg) {
   // waits for an event from the renderer process to get the githubToken
    oAuthGithub.openWindow(function (error, tokenOptions) {
      if (!error) {
        githubToken = tokenOptions.access_token;
        mainWindow.webContents.send('githubToken', githubToken);
      }
    });
  });


});

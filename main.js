'use strict';
const electron = require('electron');
const Git = require('nodegit');
const app = electron.app;
var jade = require('electron-jade')({ pretty: true }, {});
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const dialog = electron.dialog

const oAuthGithub = require("./lib/oAuthGithub")({
  client_id: "", // TODO: Load from a config file
  client_secret: "", // TODO: Load from a config file
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
  var indexUrl = "file://" + __dirname + "/index.jade";

  mainWindow.loadURL(indexUrl);
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

// Show a "open file/directory" dialog in the main window, with the options
// provided in the .send call
// (see http://goo.gl/56QIxx for details on the possible settings)
ipcMain.on('openDialog', function(event, options) {
  dialog.showOpenDialog(options, function(paths) {
    event.sender.send('openDialogReply', paths);
  });
});

// Listen to get a GitHub token
ipcMain.on('getGithubToken', function (event, arg) {
 // Waits for an event from the renderer process to get the githubToken
  oAuthGithub.openWindow(function (error, tokenOptions) {
    if (error) {  // Something went wrong
      console.err(error);
    }

    githubToken = tokenOptions.access_token;
    mainWindow.webContents.send('githubToken', githubToken);

    oAuthGithub.requestUserData(githubToken, function(data, err) {
      if (err) {  // Something went wrong
        console.err(err);
      }

      jade = require('electron-jade')({ pretty: true }, { github: data });
      mainWindow.loadURL("file://" + __dirname + "/index.jade");
    })
  });
});

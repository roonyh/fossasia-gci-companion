'use strict';
const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const dialog = require('electron').dialog;
const Git = require('nodegit');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

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

  mainWindow.loadURL('file://' + __dirname + '/index.html');

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

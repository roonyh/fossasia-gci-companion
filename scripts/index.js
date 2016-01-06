const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on("githubToken", function (event, token) {
  window.localStorage.githubToken = token
})

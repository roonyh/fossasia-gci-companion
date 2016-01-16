require('./git-config.js');
require('./fossasia-gci-website.js');
const jade = require('jade');
var Github = require('./scripts/github.js');

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

// listening to event if githubToken received
ipcRenderer.on('githubToken', function (event, token) {
  window.localStorage.githubToken = token;
  // remove the login with github button

  Github.requestUserData(token, function(data, err) {
    if (err) {  // Something went wrong
      console.error(err);
    }

    console.log(data);
    var html = jade.renderFile('github.jade', {github: data});
    document.getElementById('scroll-tab-3').innerHTML = html;
  })
})

document.getElementById('githubLoginBtn').addEventListener('click', function (event) {
  // request a github token by sendinging getGithubToken message
  ipcRenderer.send('getGithubToken');
}, false);

document.getElementById('github-login-button').addEventListener('click', function(event) {
  event.preventDefault();

  ipcRenderer.send('getGithubToken');
});

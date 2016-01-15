const qs = require('qs');
const request = require('request-promise');
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

module.exports = function (options) {
  if (!options.client_id || !options.client_secret || !options.scopes) {
      throw new Error('all options not provided for oAuth Authentication');
  }

  function openWindow(cb) {
    var authWindow = new BrowserWindow({
      width: 1000,
      height: 620,
      show: false
    });

    var githubUrl = 'https://github.com/login/oauth/authorize?';
    var authUrl = githubUrl + 'client_id=' + options.client_id + '&scope=' + options.scopes;
    authWindow.loadURL(authUrl);
    authWindow.show();

    authWindow.webContents.on('will-navigate', function (event, url) {
      handleCallback(url, authWindow, cb);
    })

    authWindow.webContents.on('did-get-redirect-request', function (event, oldURL, newURL) {
        handleCallback(newURL, authWindow, cb);
    })

    authWindow.on('close', function () {
      authWindow = null;
    }, false)

  }

  function handleCallback(url, authWindow, cb) {
    var queryString = qs.parse(url.substring(url.indexOf('?') + 1));
    var code = queryString.code;
    var error = queryString.error;

    if (error) {
      cb(error);
      authWindow.destroy();
    }

    if (code) {
      requestGithubToken(code, authWindow, cb);
    }

  }

  function requestGithubToken(code, authWindow, cb) {
    var tokenRequestUrl = 'https://github.com/login/oauth/access_token';

    request({
      uri: tokenRequestUrl,
      formData: {
        code: code,
        client_id: options.client_id,
        client_secret: options.client_secret
      }
    }, function (error, response, body) {
      if (error || !body) {
        cb(error || new Error('body empty'));
        authWindow.destroy();
      }
      else if (body) {
        var tokenOptions = qs.parse(body);
        authWindow.destroy();
        cb(error, tokenOptions);
      }
    });
  }

  function requestUserData(token, cb) {
    console.log('on requestUserData');
    // Gather user's info
    const userPromise = request.get({
      uri: 'https://api.github.com/user',
      headers: {
        'Authorization': 'token ' + token,
        'User-Agent': 'FOSSASIA-GCI-Companion'
      },
      json: true
    });

    // Gather user's repositories
    const reposPromise = request.get({
      uri: 'https://api.github.com/user/repos',
      headers: {
        'Authorization': 'token ' + token,
        'User-Agent': 'FOSSASIA-GCI-Companion'
      },
      json: true
    });

    // Gather user's gists
    const gistsPromise = request.get({
      uri: 'https://api.github.com/gists',
      headers: {
        'Authorization': 'token ' + token,
        'User-Agent': 'FOSSASIA-GCI-Companion'
      },
      json: true
    });

    // Launch all requests
    Promise.all([ userPromise, reposPromise, gistsPromise ])
    .then(function(responses) {
      const user = responses[0];
      const repos = responses[1];
      const gists = responses[2].reverse(); // Reverse order to sort them by date

      const github = {
        user: user,
        repos: repos,
        gists: gists
      };

      cb(github, null);
    })
    .catch(function(err) {  // Something went wrong
      cb(null, err);
    });
  }

  return {
    openWindow: openWindow,
    requestUserData: requestUserData
  }
}

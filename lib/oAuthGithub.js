const qs = require('qs')
const request = require('request')
const electron = require('electron')
const BrowserWindow = electron.BrowserWindow;

  module.exports = function (options) {
  if (!options.client_id || !options.client_secret || !options.scopes) {

      throw new Error("all options not provided for oAuth Authentication")
  }


  function openWindow(cb) {
    var authWindow = new BrowserWindow({
      width: 400,
      height: 300,
      show: false
    })

    var githubUrl = "https://github.com/login/oauth/authorize?"
    var authUrl = githubUrl + 'client_id=' + options.client_id + '&scope=' + options.scopes
    authWindow.loadURL(authUrl)
    authWindow.show()

    authWindow.webContents.on("will-navigate", function (event, url) {
      handleCallback(url, authWindow, cb)
    })

    authWindow.webContents.on("did-get-redirect-request", function (event, oldURL, newURL) {
        handleCallback(newURL, authWindow, cb)
    })

    // authWindow.on("close", function () {
    //   authWindow = null
    // }, false)

  }

  function handleCallback(url, authWindow, cb) {
    var queryString = qs.parse(url.substring(url.indexOf("?") + 1))
    var code = queryString.code
    var error = queryString.error


    //   authWindow.destroy()
    if (error) {
      cb(error)
      authWindow.destroy()
    }

    if (code) {
      requestGithubToken(code, authWindow, cb)
    }

  }

  function requestGithubToken(code, authWindow, cb) {
    var tokenRequestUrl = "https://github.com/login/oauth/access_token"

    request({
      uri: tokenRequestUrl,
      formData: {
        code: code,
        client_id: options.client_id,
        client_secret: options.client_secret
      }
    }, function (error, response, body) {
      if (error || !body) {
        cb(error || new Error("body empty"))
        authWindow.destroy()
      }
      else if (body) {
        var tokenOptions = qs.parse(body)
        authWindow.destroy()
        cb(error, tokenOptions)
      }
    })
  }



  return {
    openWindow: openWindow
  }
}

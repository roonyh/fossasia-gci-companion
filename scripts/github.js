const request = require('request-promise');

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

module.exports = {
  requestUserData: requestUserData
}
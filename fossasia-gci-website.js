// This module helps setting up FOSSASIA's GCI15 website repo
// Also checks if origin and upstream remotes are configured correctly

const git = require('./git');
const Git = require('nodegit');
const fs = require('fs');
const ipcRenderer = require('electron').ipcRenderer;

const gciWebButton = document.querySelector('#gci-website__button');
gciWebButton.mode = 'clone';
gciWebButton.innerHTML = 'Clone';

const pathField = document.querySelector('#clone-path');

pathField.value = __dirname;
updateStatuses(); // Update the statuses for the default value of the path

function updateStatuses() {
  const path = pathField.value;

  // Set default submit button's values
  gciWebButton.mode = 'clone';
  gciWebButton.innerHTML = 'Clone';

  const statusDirIcon = document.querySelectorAll('#gci-website__status-dir > span')[0];
  const statusDirText = document.querySelectorAll('#gci-website__status-dir > span')[1];
  const statusRepoIcon = document.querySelectorAll('#gci-website__status-repo > span')[0];
  const statusRepoText = document.querySelectorAll('#gci-website__status-repo > span')[1];
  const statusUpstreamIcon = document.querySelectorAll('#gci-website__status-upstream > span')[0];
  const statusUpstreamText = document.querySelectorAll('#gci-website__status-upstream > span')[1];
  const statusOriginIcon = document.querySelectorAll('#gci-website__status-origin > span')[0];
  const statusOriginText = document.querySelectorAll('#gci-website__status-origin > span')[1];

  // Set all statuses as 'no' by default
  statusDirIcon.className = 'material-icons gci-website__status-no';
  statusDirIcon.innerHTML = 'clear';
  statusDirText.className = 'gci-website__status gci-website__status-no';
  statusDirText.innerHTML = 'doesn\'t exist';
  statusRepoIcon.className = 'material-icons gci-website__status-no';
  statusRepoIcon.innerHTML = 'clear';
  statusRepoText.className = 'gci-website__status gci-website__status-no';
  statusRepoText.innerHTML = 'isn\'t';
  statusUpstreamIcon.className = 'material-icons gci-website__status-no';
  statusUpstreamIcon.innerHTML = 'clear';
  statusUpstreamText.className = 'gci-website__status gci-website__status-no';
  statusUpstreamText.innerHTML = 'isn\'t';
  statusOriginIcon.className = 'material-icons gci-website__status-no';
  statusOriginIcon.innerHTML = 'clear';
  statusOriginText.className = 'gci-website__status gci-website__status-no';
  statusOriginText.innerHTML = 'isn\'t';

  fs.stat(path, function(err, stat) {
    if(err === null) {  // Path already exists
      statusDirIcon.className = 'material-icons gci-website__status-yes';
      statusDirIcon.innerHTML = 'done';
      statusDirText.className = 'gci-website__status gci-website__status-yes';
      statusDirText.innerHTML = 'exists';
      Git.Repository.open(path)
      .then(function(repo) {
        repo.getCommit('03850094869f142934e924a3cbb294993f005d44') // Verify this is gci15.fossasia.org, and not any other git repository (that's the very first commit on gh-pages)
        .then(function(commit) {
          gciWebButton.mode = 'remote';
          statusRepoIcon.className = 'material-icons gci-website__status-yes';
          statusRepoIcon.innerHTML = 'done';
          statusRepoText.className = 'gci-website__status gci-website__status-yes';
          statusRepoText.innerHTML = 'is';
          repo.getRemote('upstream')
          .then(function(remote) {
            if(remote.url() === 'https://github.com/fossasia/gci15.fossasia.org.git') { // "upstream" is set to FOSSASIA's repo
              gciWebButton.mode += '-origin';
              statusUpstreamIcon.className = 'material-icons gci-website__status-yes';
              statusUpstreamIcon.innerHTML = 'done';
              statusUpstreamText.className = 'gci-website__status gci-website__status-yes';
              statusUpstreamText.innerHTML = 'is';
              Git.Remote.create(repo, 'upstream', 'https://github.com/fossasia/gci15.fossasia.org.git');
            }
            repo.getRemote('origin')
            .then(function(remote) {
              if(remote.url() !== 'https://github.com/fossasia/gci15.fossasia.org.git') { // "origin" is set to a custom repo
                gciWebButton.mode += '-upstream';
                statusOriginIcon.className = 'material-icons gci-website__status-yes';
                statusOriginIcon.innerHTML = 'done';
                statusOriginText.className = 'gci-website__status gci-website__status-yes';
                statusOriginText.innerHTML = 'is';
              }
              switch(gciWebButton.mode) {
                // Everything is properly configured
                case 'remote-upstream-origin':
                case 'remote-origin-upstream':
                  gciWebButton.disabled = true;
                  gciWebButton.innerHTML = 'All set!';
                  break;
                // Either "upstream" or none of the remotes aren't configured
                case 'remote':
                case 'remote-upstream':
                  gciWebButton.innerHTML = 'Configure "upstream"';
                  break;
                // The remote "origin" isn't correctly configured
                case 'remote-origin':
                  gciWebButton.innerHTML = 'Configure "origin"';
                  break;
              }
            });
          });
        });
    });
  } else if(err.code !== 'ENOENT') {  // Something went wrong (excluding path not found)
      console.log(err);
    }
  });
}

pathField.onclick = function(e) {
  e.preventDefault();

  // Set up dialog for opening repo's path
  const options = {
    title: 'Choose the directory where open/save the repo',
    properties: [ 'openDirectory' ]
  };

  // Got the path from the dialog
  ipcRenderer.on('openDialogReply', function(event, paths) {
    if(paths !== null) {  // Check the dialog hasn't been cancelled
      // Set the chosen path as pathField's value
      pathField.value = paths[0];
      // Update the statuses (changing the value won't trigger pathfield's oninput
      // event)
      updateStatuses();
    }
  });

  // Display the dialog
  ipcRenderer.send('openDialog', options);
}

pathField.oninput = function(e) {
  e.preventDefault();

  updateStatuses();
}

gciWebButton.onclick = function(e) {
  e.preventDefault();

  const path = pathField.value;

  switch(gciWebButton.mode) {
    // Either "upstream" or none of the remotes aren't configured
    case 'remote':
    case 'remote-upstream':
      gciWebButton.disabled = true;
      gciWebButton.style.cursor = 'not-allowed';
      gciWebButton.innerHTML = 'Loading...';

      document.querySelector('#gci-website__loading').className += ' is-active'; // Display the loading spinner

      Git.Repository.open(path)
      .then(function(repo) {
        Git.Remote.create(repo, 'upstream', 'https://github.com/fossasia/gci15.fossasia.org.git');
        gciWebButton.innerHTML = 'Done!';
        updateStatuses();
        document.querySelector('#gci-website__loading').className = 'mdl-spinner mdl-spinner--single-color mdl-js-spinner';  // Hide the loading spinner (by removing the 'is-active' class)
        setTimeout(function() { // Keep the button disabled with the "Done!" message for a moment
          gciWebButton.disabled = false;
          gciWebButton.style.cursor = 'default';
          gciWebButton.innerHTML = 'Clone';
        }, 1500);
      });
      break;

    // The remote "origin" isn't correctly configured
    case 'remote-origin':
      // TO IMPLEMENT WITH USER'S USERNAME, ONCE #9 IS MERGED
      /*
      Git.Repository.open(path)
      .then(function(repo) {
          Git.Remote.create(repo, 'upstream', customRemote);
      });
      */
      break;

    // The repo isn't cloned yet
    default:
      gciWebButton.disabled = true;
      gciWebButton.style.cursor = 'not-allowed';
      gciWebButton.innerHTML = 'Loading...';

      document.querySelector('#gci-website__loading').className += ' is-active'; // Display the loading spinner

      Git.Clone.clone('https://github.com/fossasia/gci15.fossasia.org.git', path, null)
      .then(function(repo, err) {
        if(err) { // Something went wrong
          console.log(err);
          gciWebButton.innerHTML = 'Error!';
        } else {
          Git.Remote.create(repo, 'upstream', 'https://github.com/fossasia/gci15.fossasia.org.git');
          gciWebButton.innerHTML = 'Done!';
        }
        updateStatuses();
        document.querySelector('#gci-website__loading').className = 'mdl-spinner mdl-spinner--single-color mdl-js-spinner';  // Hide the loading spinner (by removing the 'is-active' class)
        setTimeout(function() { // Keep the button disabled with the "Done!" message for a moment
          gciWebButton.disabled = false;
          gciWebButton.style.cursor = 'default';
          gciWebButton.innerHTML = 'Clone';
        }, 1500);
      });
  }
}

// This module deals with setting global git config
// Graphical interface for
//   `git config --global user.name "John Doe"`
//   `git config --global user.email "john@doe.org"`

const git = require('./git');

const configForm = document.querySelector('#git-config-form')

git.getConfig()
.then(function(config){
  configForm.querySelector('input[name="name"]').value = config.name;
  configForm.querySelector('input[name="name"]').parentElement.className += ' is-dirty';
  configForm.querySelector('input[name="email"]').value = config.email;
  configForm.querySelector('input[name="email"]').parentElement.className += ' is-dirty';
}).
catch(function(e){
  console.log('Error while getting config', e);
});

configForm.onsubmit = function(e){
  e.preventDefault();
  const config = {
    name: configForm.querySelector('input[name="name"]').value,
    email: configForm.querySelector('input[name="email"]').value
  }
  git.setConfig(config)
  .catch(function(e){
    console.log('Error while setting config', e);
  });
}

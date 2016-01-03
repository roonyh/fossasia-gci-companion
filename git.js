const Git = require('nodegit')

exports.getConfig = function(){
  const configPromise = Git.Config.openDefault();
  const namePromise = configPromise.then(function(config){
    return config.getString("user.name");
  });
  const emailPromise = configPromise.then(function(config){
    return config.getString("user.email");
  });

  return Promise.all([namePromise, emailPromise]).then(function(configs){
    return {
      name: configs[0],
      email: configs[1]
    }
  });
}

exports.setConfig = function(configValues){
  const configPromise = Git.Config.openDefault();
  // We cant use promise.all here. have to set them one by one

  const updateConfig = function(config){
    config.setString("user.name", configValues.name)
    .then(function(){
      config.setString("user.email", configValues.email)
    });
  };

  return configPromise.then(updateConfig);
}
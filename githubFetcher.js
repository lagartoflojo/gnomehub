const Soup = imports.gi.Soup;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Base64 = Extension.imports.base64.Base64;

const API_URL = 'https://api.github.com';

const GithubFetcher = function (options) {
  this.repoNames = ['rails/rails', 'emberjs/ember.js'];
  this._httpSession = new Soup.Session({user_agent: 'lagartoflojo'});
  this.options = options;

  // Soup.Session.prototype.add_feature.call(this._httpSession,
  //   new Soup.ProxyResolverDefault());
  // this._httpSession.connect('authenticate', function () {
  //   log('requires auth!');
  // });

  this.loadJSON = function(path, cb) {
    let self = this;

    let message = Soup.Message.new('GET', API_URL + path);
    this.authenticateMessage(message);
    this._httpSession.queue_message(message, function(session, message) {
      let data = message.response_body.data;
      cb.call(self, JSON.parse(data));
    });
  };

  this.authenticateMessage = function (message) {
    if(this.options.username && this.options.password) {
      let value = 'Basic ' + Base64.encode(this.options.username + ':' + this.options.password);
      message.request_headers.append('Authorization', value);
    }
  };

  this.getRepos = function (cb) {
    let self = this;

    this.repoNames.forEach(function (repoName) {
      self.loadJSON('/repos/' + repoName + '/pulls', function (pullRequestsData) {
        let repo = {
          name: repoName,
          pullRequests: []
        };

        pullRequestsData.forEach(function (pullRequestData) {
          let pr = {
            number: pullRequestData.number,
            title: pullRequestData.title,
            url: pullRequestData.url
          };
          repo.pullRequests.push(pr);
        });

        cb(repo);
      }); // End loadJason
    }); // End repoNames.forEach
  };

  this.close = function () {
    if (this._httpSession) {
      this._httpSession.abort();
    }
    this._httpSession = null;
  };
}

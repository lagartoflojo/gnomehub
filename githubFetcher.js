const Soup = imports.gi.Soup;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Base64 = Extension.imports.base64.Base64;
const fetch = Extension.imports.fetch.fetch;
const Promise = Extension.imports.promise.Promise;

const API_URL = 'https://api.github.com';

const GithubFetcher = function(options) {
  this.options = options;

  this.loadJSON = function(path) {
    return new Promise(resolve => {
      fetch(API_URL + path, {
        preprocess: this.authenticate,
        userAgent: 'lagartoflojo/github-shell-extension'
      }).then(response => {
        resolve(response.json());
      });
    });
  };

  this.authenticate = request => {
    if (this.options.username.length && this.options.password.length) {
      let value = 'Basic ' + Base64.encode(this.options.username + ':' +
        this.options.password);
      request.request_headers.append('Authorization', value);
    }
  };

  this.getRepos = function(repoNames, cb) {
    let self = this;


    repoNames.forEach(repoName => {
      this.loadJSON('/repos/' + repoName + '/pulls').then(pullRequestsData => {
        let repo = {
          name: repoName,
          pullRequests: []
        };

        pullRequestsData.forEach(function(pullRequestData) {
          let pr = {
            number: pullRequestData.number,
            title: pullRequestData.title,
            url: pullRequestData.url,
            headSha: pullRequestData.head.sha,
            status: null
          };

          // self.loadJSON('/repos/' + repoName + '/status/' + pr.headSha, function (statusData) {
          //   // Only update the status if there are any checks in the PR
          //   if(statusData.statuses.length) {
          //     pr.status = statusData.state;
          //   }
          // });

          repo.pullRequests.push(pr);
        });

        cb(repo);
      }); // End loadJason
    }); // End repoNames.forEach
  };
}

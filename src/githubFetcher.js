const Soup = imports.gi.Soup;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const fetch = Extension.imports.lib.fetch.fetch;
const Promise = Extension.imports.lib.promise.Promise;
const GLib = imports.gi.GLib;

const API_URL = 'https://api.github.com';

const GithubFetcher = function(options) {
  this.options = options;

  this.loadJSON = function(path) {
    return new Promise((resolve, reject) => {
      fetch(API_URL + path, {
        preprocess: this.authenticate,
        userAgent: 'lagartoflojo/gnomehub'
      }).then(response => {
        if(response.ok) {
          resolve(response.json());
        }
        else {
          reject(response);
        }
      });
    });
  };

  this.authenticate = request => {
    if (this.options.username.length && this.options.password.length) {
      let value = 'Basic ' + GLib.base64_encode(this.options.username + ':' +
        this.options.password);
      request.request_headers.append('Authorization', value);
    }
  };

  // Receives an array of repo names
  // Resolves to an array of hashes, where each hash has the keys
  // repoFullName and pullRequests
  this.getRepos = function(repoNames) {
    let promises = repoNames.map(repoName => {
      return this._loadPullRequests(repoName);
    });

    return Promise.all(promises);
  };

  // Receives the name of a single repo
  // Resolves to hash with two keys: repoFullName and pullRequests.
  this._loadPullRequests = function (repoName) {
    return new Promise((resolve, reject) => {
      this.loadJSON('/repos/' + repoName + '/pulls').then(prs => {
        let repo = {
          repoFullName: repoName,
          pullRequests: prs.map(pr => this._processPullRequest(pr))
        };

        resolve(repo);
      }).catch(response => {
        response.repoFullName = repoName;
        reject(response);
      });
    });
  };

  this._processPullRequest = function (prJSON) {
    return {
      number: prJSON.number,
      title: prJSON.title,
      url: prJSON.url,
      headSha: prJSON.head.sha,
      status: null
    };
  };
}



// pullRequestsData.forEach(function(pullRequestData) {
//   let pr = {
//     number: pullRequestData.number,
//     title: pullRequestData.title,
//     url: pullRequestData.url,
//     headSha: pullRequestData.head.sha,
//     status: null
//   };

// self.loadJSON('/repos/' + repoName + '/status/' + pr.headSha, function (statusData) {
//   // Only update the status if there are any checks in the PR
//   if(statusData.statuses.length) {
//     pr.status = statusData.state;
//   }
// });

// repo.pullRequests.push(pr);

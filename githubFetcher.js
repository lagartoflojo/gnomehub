const Soup = imports.gi.Soup;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Base64 = Extension.imports.base64.Base64;
const fetch = Extension.imports.fetch.fetch;
const Promise = Extension.imports.promise.Promise;

const API_URL = 'https://api.github.com';

const GithubFetcher = function(options) {
  this.options = options;

  this.loadJSON = function(path) {
    return new Promise((resolve, reject) => {
      fetch(API_URL + path, {
        preprocess: this.authenticate,
        userAgent: 'lagartoflojo/github-shell-extension'
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
      let value = 'Basic ' + Base64.encode(this.options.username + ':' +
        this.options.password);
      request.request_headers.append('Authorization', value);
    }
  };

  this.getRepos = function(repoNames) {
    return new Promise((resolve, reject) => {
      this._fetchPullRequests(repoNames).then(reposData => {
        let repos = {};

        reposData.forEach(repoData => {
          let repoName = repoData.repo_full_name;
          repos[repoName] = repoData;
        });

        resolve(repos);
      }).catch(response => {
        log(JSON.stringify(response))
        // No internet: (try to reload data when internet is back)
        // {"message":{},"headers":{},"url":"https://api.github.com/repos/lagartoflojo/minijq/pulls","status":2,"statusText":"Cannot resolve hostname","ok":false}
        // Not found / no permissions:
        // {"message":{},"headers":{},"url":"https://api.github.com/repos/asdsadasd/adaerear/pulls","status":404,"statusText":"Not Found","ok":false}
        reject(response);
      });
    });
  };

  this._fetchPullRequests = function (repoNames) {
    let promises = repoNames.map(repoName => {
      return this._loadPullRequests(repoName);
    });

    return Promise.all(promises);
  };

  this._loadPullRequests = function (repoName) {
    return new Promise((resolve, reject) => {
      this.loadJSON('/repos/' + repoName + '/pulls').then(prs => {
        let repo = {
          repo_full_name: repoName,
          pull_requests: prs.map(pr => this._processPullRequest(pr))
        };

        resolve(repo);
      }).catch(response => {
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

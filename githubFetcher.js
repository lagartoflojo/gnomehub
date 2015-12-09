const GithubFetcher = function () {
  this.getRepos = function () {
    let repo = {
      name: 'SUSE/happy-customer',
      pullRequests: [
        {
          number: 2461,
          title: "add more syslog objects for easy access to object history..."
        },
        {
          number: 2465,
          title: "Update Sprint25 scrum data 2905"
        },
        {
          number: 2466,
          title: "Fix bug when user has no orgs with support, or all orgs with..."
        }
      ]
    };
    let rails = {
      name: 'rails/rails',
      pullRequests: [
        {
          number: 22534,
          title: "ActionMailer: support overriding template name in multipart"
        },
        {
          number: 22526,
          title: "WIP: Add methods for querying exactly one record from a relation"
        }
      ]
    }

    return [repo, rails];
  }
}

/**
 * github-short-url-regex <https://github.com/regexps/github-short-url-regex>
 *
 * Copyright (c) 2014-2015 Charlike Mike Reagent, contributors.
 * Released under the MIT license.
 */

'use strict';

/**
 * Find github shorthand url (user/repo#branch)
 *
 * @param  {Object} `options`
 * @return {RegExp}
 * @api public
 */
function githubShortUrlRegex(options) {
  options = options || {};
  var regex = '([-_\\w]+)\\/([-_.\\w]+)';

  regex = options.exact === false ? regex : '^' + regex + '$';

  return new RegExp(regex, options.flags);
};

function matchRepo(text) {
  let regex = githubShortUrlRegex({
    exact: true
  });

  let matches = text.match(regex);

  return !!matches;
}

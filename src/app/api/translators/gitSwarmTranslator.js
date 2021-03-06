'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _uuidV4 = require('uuid-v4');

var _uuidV42 = _interopRequireDefault(_uuidV4);

var _middlewareGitSwarmCommitMalformedError = require('../../middleware/gitSwarmCommitMalformedError');

var _middlewareGitSwarmCommitMalformedError2 = _interopRequireDefault(_middlewareGitSwarmCommitMalformedError);

var _getProperties2 = require('./getProperties');

var _getProperties3 = _interopRequireDefault(_getProperties2);

var _branchNameParse = require('./branchNameParse');

var _branchNameParse2 = _interopRequireDefault(_branchNameParse);

var _helpersVcsFamilies = require('../helpers/vcsFamilies');

var _helpersVcsFamilies2 = _interopRequireDefault(_helpersVcsFamilies);

var gitSwarmTranslator = {
  family: _helpersVcsFamilies2['default'].GitSwarm,
  canTranslate: function canTranslate(request) {
    // gitLab does not have a pusheEvent.repository.id field, and github does
    // gitLab does not have a commit.committer object, and github does
    if (hasCorrectHeaders(request.headers)) {
      return true;
    }
    return false;
  },
  translatePush: function translatePush(pushEvent, instanceId, digestId, inboxId) {
    try {
      var _ret = (function () {
        var branch = (0, _branchNameParse2['default'])(pushEvent.ref);
        var repository = {
          // gitLab does not have a repository id
          // id: pushEvent.repository.id,
          name: pushEvent.repository.name
        };

        var events = pushEvent.commits.map(function (aCommit) {
          var commit = {
            sha: aCommit.id,
            commit: {
              author: aCommit.author,
              // gitLab does not have a commit.committer object. Using the same thing as author for now.
              // committer: {
              //   name: aCommit.committer.name,
              //   email: aCommit.committer.email,
              //   date: aCommit.timestamp
              // },
              committer: {
                name: aCommit.author.name,
                email: aCommit.author.email,
                date: aCommit.timestamp
              },
              message: aCommit.message
            },
            html_url: aCommit.url,
            repository: repository,
            branch: branch,
            originalMessage: aCommit
          };
          return {
            eventId: (0, _uuidV42['default'])(),
            eventType: gitSwarmTranslator.family + 'CommitReceived',
            data: commit,
            metadata: {
              instanceId: instanceId,
              digestId: digestId,
              inboxId: inboxId
            }
          };
        });

        return {
          v: events
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    } catch (ex) {
      throw new _middlewareGitSwarmCommitMalformedError2['default'](ex, pushEvent);
    }
  },
  getProperties: function getProperties(event) {
    return (0, _getProperties3['default'])(event, '/commit', 'tree');
  }
};

var hasCorrectHeaders = function hasCorrectHeaders(headers) {
  return headers.hasOwnProperty('x-gitlab-event') && headers['x-gitlab-event'] === 'Push Hook' && headers.hasOwnProperty('x-gitswarm-event') && headers['x-gitswarm-event'] === 'Push Hook';
};

exports['default'] = gitSwarmTranslator;
module.exports = exports['default'];

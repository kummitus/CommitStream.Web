'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _CsError2 = require('./CsError');

var _CsError3 = _interopRequireDefault(_CsError2);

var GitLabCommitMalformedError = (function (_CsError) {
	_inherits(GitLabCommitMalformedError, _CsError);

	function GitLabCommitMalformedError() {
		_classCallCheck(this, GitLabCommitMalformedError);

		_get(Object.getPrototypeOf(GitLabCommitMalformedError.prototype), 'constructor', this).call(this, ['There was an unexpected error when processing your GitLab push event.']);
	}

	return GitLabCommitMalformedError;
})(_CsError3['default']);

exports['default'] = GitLabCommitMalformedError;
module.exports = exports['default'];

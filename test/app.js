'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-browser-extension:app', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({someAnswer: true, license: 'MIT'})
      .toPromise();
  });

  it('creates files', function () {
    assert.file([
      'package.json', '.babelrc'
    ]);
  });
});

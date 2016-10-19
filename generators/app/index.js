'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
const extend = require('deep-extend')

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the exquisite ' + chalk.red('generator-browser-extension') + ' generator!'
    ));

    var prompts = [{
      type: 'confirm',
      name: 'someAnswer',
      message: 'Would you like to enable this option?',
      default: true
    }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  default: function () {
    this.composeWith(
      'node:app',
      {
        options: {
          babel: false,
          boilerplate: false,
          coveralls: false,
          gulp: false,
          name: 'test',
          projectRoot: 'generators',
          skipInstall: this.options.skipInstall,
          readme: 'test'
        }
      },
      {local: require('generator-node').app}
    )
  },

  writing: function () {
    const pkg = this.fs.readJSON(this.destinationPath('package.json'), {})
    extend(pkg, {
      devDependencies: {
        'babel-preset-latest': '^6.16.0',
        babelify: '^7.3.0',
        browserify: '^13.1.0'
      }
    })
    this.fs.writeJSON(this.destinationPath('package.json'), pkg)

    this.fs.copy(
      this.templatePath('dummyfile.txt'),
      this.destinationPath('dummyfile.txt')
    );
  },

  install: function () {
    this.installDependencies({bower: false})
  }
});

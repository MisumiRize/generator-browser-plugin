'use strict';
var chalk = require('chalk');
var yosay = require('yosay');
const extend = require('deep-extend')
const askName = require('inquirer-npm-name')
const kebabCase = require('lodash.kebabcase')
const path = require('path')
const yeoman = require('yeoman-generator')

module.exports = yeoman.Base.extend({
  constructor: function () {
    yeoman.Base.apply(this, arguments)

    this.option('boilerplate', {
      type: Boolean,
      required: false,
      defaults: true,
      desc: 'Include boilerplate files'
    })
  },

  initializing: function () {
    this.props = {}
  },

  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the exquisite ' + chalk.red('generator-browser-extension') + ' generator!'
    ));

    return askName({
      name: 'name',
      message: 'Your extension name',
      default: kebabCase(path.basename(process.cwd())),
      filter: kebabCase
    }, this).then(function (props) {
      this.props.name = props.name
    }.bind(this))
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
          name: this.props.name,
          projectRoot: 'generators',
          skipInstall: this.options.skipInstall,
          readme: 'test'
        }
      },
      {local: require('generator-node').app}
    )

    if (this.options.boilerplate) {
      this.composeWith(
        'browser-extension:boilerplate',
        {},
        {local: require.resolve('../boilerplate')}
      )
    }
  },

  writing: function () {
    const pkg = this.fs.readJSON(this.destinationPath('package.json'), {})
    extend(pkg, this.fs.readJSON(this.templatePath('package.json')))
    this.fs.writeJSON(this.destinationPath('package.json'), pkg)

    const config = this.fs.readJSON(this.destinationPath('.extension.json'), {})
    extend(config, {name: this.props.name})
    this.fs.writeJSON(this.destinationPath('.extension.json'), config)

    this.fs.copy(this.templatePath('.babelrc'), this.destinationPath('.babelrc'))

    this.fs.copyTpl(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js'), {
        pkgName: this.props.name
      }
    )
  },

  install: function () {
    this.installDependencies({bower: false})
  }
});

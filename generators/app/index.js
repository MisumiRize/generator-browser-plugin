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

    this.option('chromium', {
      type: Boolean,
      required: false,
      defaults: true,
      desc: 'Include chromium files'
    })

    this.option('firefox', {
      type: Boolean,
      required: false,
      defaults: true,
      desc: 'Include firefox files'
    })

    this.option('safari', {
      type: Boolean,
      required: false,
      defaults: true,
      desc: 'Include safari files'
    })
  },

  initializing: function () {
    this.props = {}
  },

  prompting: {
    askForName: function () {
      // Have Yeoman greet the user.
      this.log(yosay(
        'Welcome to the exquisite ' + chalk.red('generator-browser-extension') + ' generator!'
      ))

      const prompts = [{
        name: 'name',
        message: 'Your extension name',
        default: path.basename(process.cwd())
      }]

      return this.prompt(prompts).then(function (props) {
        this.props.name = props.name
      }.bind(this))
    },

    askForModuleName: function () {
      return askName({
        name: 'name',
        message: 'Extension short name',
        default: kebabCase(path.basename(process.cwd())),
        filter: kebabCase
      }, this).then(function (props) {
        this.props.moduleName = props.name
      }.bind(this))
    }
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

    if (this.options.chromium) {
      this.composeWith(
        'browser-extension:chromium',
        {},
        {local: require.resolve('../chromium')}
      )
    }

    if (this.options.firefox) {
      this.composeWith(
        'browser-extension:firefox',
        {},
        {local: require.resolve('../firefox')}
      )
    }

    if (this.options.safari) {
      this.composeWith(
        'browser-extension:safari',
        {
          options: {name: this.props.name}
        },
        {local: require.resolve('../safari')}
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
        pkgName: this.props.moduleName
      }
    )
  },

  install: function () {
    this.installDependencies({bower: false})
  }
})
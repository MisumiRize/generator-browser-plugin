const extend = require('deep-extend')
const githubUsername = require('github-username')
const path = require('path')
const plist = require('plist')
const yeoman = require('yeoman-generator')

module.exports = yeoman.Base.extend({
  constructor: function () {
    yeoman.Base.apply(this, arguments)

    this.option('name', {
      type: String,
      required: true,
      desc: 'Extension name'
    })
  },

  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {})
    this.props = {}
  },

  prompting: {
    askForName: function () {
      if (this.pkg.name || this.options.name) {
        this.props.name = this.pkg.name || this.options.name
        return
      }

      return this.prompt({
        name: 'name',
        message: 'Extension name',
        default: path.basename(process.cwd())
      }).then(function (props) {
        this.props.name = props.name
      }.bind(this))
    },

    askForBundleIdentifier: function () {
      return githubUsername(this.user.git.email())
        .then(
          function (username) {
            return username.toLowerCase()
          },
          function () {
            return this.user.git.name().toLowerCase().replace(' ', '')
          }.bind(this)
        )
        .then(function (username) {
          return this.prompt({
            name: 'bundleIdentifier',
            message: 'Extension identifier',
            default: `com.${username}.${this.props.name}`
          }).then(function (props) {
            this.props.bundleIdentifier = props.bundleIdentifier
          }.bind(this))
        }.bind(this))
    }
  },

  writing: function () {
    let info
    if (this.fs.exists(this.destinationPath('platform/safari/Info.plist'))) {
      info = plist.parse(this.fs.read(this.destinationPath('platform/safari/Info.plist')))
    } else {
      info = {}
    }
    extend(info, {
      'Builder Version': '534.57.2',
      CFBundleIdentifier: this.props.bundleIdentifier,
      CFBundleInfoDictionaryVersion: '6.0',
      ExtensionInfoDictionaryVersion: '1.0'
    })
    this.fs.write(this.destinationPath('platform/safari/Info.plist'), plist.build(info))
  }
})
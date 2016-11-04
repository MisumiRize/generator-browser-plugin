const extend = require('deep-extend')
const yeoman = require('yeoman-generator')

module.exports = yeoman.Base.extend({
  initializing: function () {
    this.props = {}
  },

  prompting: function () {
    const prompts = [{
      name: 'whitelist',
      message: 'Matching URL (comma to split)',
      filter: (urls) => urls.split(/\s*,\s*/g)
    }]

    return this.prompt(prompts).then(function (props) {
      this.props.whitelist = props.whitelist
    }.bind(this))
  },

  writing: function () {
    const config = this.fs.readJSON(this.destinationPath('.extension.json'), {})
    extend(config, {
      content: {
        scripts: {
          start: ['contentscript-start.js'],
          end: ['contentscript-end.js']
        },
        whitelist: this.props.whitelist
      },
    })
    this.fs.writeJSON(this.destinationPath('.extension.json'), config)

    this.fs.copy(this.templatePath('contentscript-start.js'), this.destinationPath('src/script/contentscript-start.js'))
    this.fs.copy(this.templatePath('contentscript-end.js'), this.destinationPath('src/script/contentscript-end.js'))
    this.fs.copy(this.templatePath('style.scss'), this.destinationPath('src/style/style.scss'))
  }
})
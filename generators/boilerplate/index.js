const extend = require('deep-extend')
const yeoman = require('yeoman-generator')

module.exports = yeoman.Base.extend({
  initializing: function () {
    this.props = {}
  },

  prompting: function () {
    const prompts = [{
      name: 'matches',
      message: 'Matching URL (comma to split)',
      filter: (urls) => urls.split(/\s*,\s*/g)
    }]

    return this.prompt(prompts).then(function (props) {
      this.props.matches = props.matches
    }.bind(this))
  },

  writing: function () {
    const config = this.fs.readJSON(this.destinationPath('.extension.json'), {})
    extend(config, {
      'content_scripts': [
        {
          matches: this.props.matches,
          js: ['contentscript-start.js'],
          'run_at': 'document_start',
        },
        {
          matches: this.props.matches,
          js: ['contentscript-end.js'],
          'run_at': 'document_end',
        }
      ]
    })
    this.fs.writeJSON(this.destinationPath('.extension.json'), config)

    this.fs.copy(this.templatePath('contentscript-start.js'), this.destinationPath('src/script/contentscript-start.js'))
    this.fs.copy(this.templatePath('contentscript-end.js'), this.destinationPath('src/script/contentscript-end.js'))
    this.fs.copy(this.templatePath('style.scss'), this.destinationPath('src/style/style.scss'))
  }
})
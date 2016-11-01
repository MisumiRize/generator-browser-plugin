const extend = require('deep-extend')
const yeoman = require('yeoman-generator')

module.exports = yeoman.Base.extend({
  writing: function () {
    const pkg = this.fs.readJSON(this.destinationPath('platform/firefox/package.json'), {})
    extend(pkg, this.fs.readJSON(this.templatePath('package.json')))
    this.fs.writeJSON(this.destinationPath('platform/firefox/package.json', pkg))

    this.fs.copy(
      this.templatePath('index.ejs'),
      this.destinationPath('platform/firefox/index.ejs')
    )
  }
})

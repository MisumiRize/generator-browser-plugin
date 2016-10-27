const extend = require('deep-extend')
const yeoman = require('yeoman-generator')

module.exports = yeoman.Base.extend({
  writing: function () {
    const manifest = this.fs.readJSON(this.destinationPath('platform/chromium/manifest.json'), {})
    extend(manifest, this.fs.readJSON(this.templatePath('manifest.json')))
    this.fs.writeJSON(this.destinationPath('platform/chromium/manifest.json'), manifest)
  }
})

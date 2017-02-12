var path = require('path')

var gulp = require('gulp')
var exeq = require('exeq')
var moment = require('moment')
var chalk = require('chalk')
var notifier = require('node-notifier')
var Promise = require('bluebird')
var fsExtra = Promise.promisifyAll(require('fs-extra'))
var basePath = path.resolve(__dirname, '..')
var updateInfoJsonFilePath = path.join(basePath, 'updateInfo.json')

var newVersionString = `${ moment().year() }.${ moment().month() + 1 }.${ moment().date() }`

gulp.task('bumpVersion', () => {
  console.log(`running 'npm --no-git-tag-version --force version ${ newVersionString }'`)
  exeq(`npm --no-git-tag-version --force version ${ newVersionString }`)
    /*****
    * Update the updateInfo.json too
    */
    .then(() => fsExtra.readJsonAsync(updateInfoJsonFilePath))
    .then(updateInfoObj =>
      fsExtra.writeJsonAsync(
        updateInfoJsonFilePath,
        Object.assign({}, updateInfoObj, {latestUpdateVersion: newVersionString})
      )
    )
    .then(() => {
      var message = 'IMPORTANT! - after bumping version, you MUST bust the github pages cache, so go to gh-pages branch and run the buildProduction npm task and then push that branch'
      console.log('bumpVersion task succeded')
      console.log(chalk.red.bold(message))
      notifier.notify({
        'title': 'bumpVersion',
        'message': message
      })
    })
    .catch(function(err) {
      console.error('There was an error running bumpVersion', err)
    })
})

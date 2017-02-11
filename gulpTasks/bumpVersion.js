var path = require('path')

var gulp = require('gulp')
var exeq = require('exeq')
var moment = require('moment')
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
    .catch(function(err) {
      console.error('There was an error running bumpVersion', err)
    })
})

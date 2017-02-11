var gulp = require('gulp')

var exeq = require('exeq')
var moment = require('moment')

gulp.task('bumpVersion', () => {
  console.log(`running 'npm --no-git-tag-version --force version ${ moment().year() }.${ moment().month() + 1 }.${ moment().date() }'`)
  exeq(`npm --no-git-tag-version --force version ${ moment().year() }.${ moment().month() + 1 }.${ moment().date() }`)
    .then(function() {
      console.log('Successfully compiled sqlite3 lib binding')
    })
    .catch(function(err) {
      console.error('There was an error building sqlite3 lib binding', err)
    })
})

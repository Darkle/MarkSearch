'use strict';

gulp.task('frontendModuleSize', () => {
  /****
   * https://www.npmjs.com/package/disc
   */
  var discAppPath = path.join(__dirname, 'node_modules', '.bin', 'discify')
  var desktopPath = path.join('/Users', username.sync(), 'Desktop')
  var bundleFilePaths = path.join(__dirname, 'frontend', 'static', 'js')
  var bundleFiles = [
    'aboutPage-bundle.js',
    'helpPage-bundle.js',
    'removeOldBookmarksPage-bundle.js',
    'searchPage-bundle.js',
    'settingsPage-bundle.js'
  ]
  _.each(bundleFiles, value => {
    let outputFilePath = `${path.join(desktopPath, `disc${value}ModuleSizes.html`)}`
    // console.log(`${discAppPath} ${path.join(bundleFilePaths, value)} > ${outputFilePath}`)
    shell.exec(`${discAppPath} ${path.join(bundleFilePaths, value)} > ${outputFilePath}`, (exitCode, stdout, stderr) => {
      if(exitCode === 0){
        console.log('modulesize exec completed successfully')
        shell.exec(`open -a "Google Chrome" ${outputFilePath}`, (exitCode, stdout, stderr) => {
          if(exitCode === 0){
            console.log('opening html file completed successfully')
          }
          else{
            console.error(`
            An error occured
            Exit code: ${exitCode}
            Program output: ${stdout}
            Program stderr: ${stderr}
          `)
          }
        })
      }
      else{
        console.error(`
            An error occured
            Exit code: ${exitCode}
            Program output: ${stdout}
            Program stderr: ${stderr}
          `)
      }
    })
  })
})
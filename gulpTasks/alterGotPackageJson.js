'use strict';


// gulp.task('alterGotPackageJson', () => {
//   /****
//    * details in miscNotes.txt
//    */
//   var gotPackageJsonFilePath = path.join(__dirname, 'node_modules', 'got', 'package.json')
//   return jetpack.readAsync(gotPackageJsonFilePath, 'json')
//     .then(jsonData => {
//       jsonData.browserify = {
//         transform: [
//           [
//             "babelify",
//             {
//               "presets": [
//                 "es2015"
//               ]
//             }
//           ]
//         ]
//       }
//       return jetpack.writeAsync(gotPackageJsonFilePath, jsonData, 'json')
//     })
//     .then(() => console.log(`got's package.json successfully altered`))
//     .catch(err => console.error(`there was an error altering got's package.json`, err))
// })
/* global releases */
import 'babel-polyfill'

/*****
* Not sure if github sorts the releases array by date, so gonna do it manually and grab the most recent.
*/
const latestRelease = releases.sort((r1, r2) => new Date(r2.published_at) - new Date(r1.published_at))[0]
const downloadsContainer = document.querySelectorAll('#downloads a')

latestRelease.assets.forEach(download => {
    if(download.name.includes('windows')){
        downloadsContainer[0].href = download.browser_download_url
    }
    if(download.name.includes('macos')){
        downloadsContainer[1].href = download.browser_download_url
    }
    if(download.name.includes('linux')){
        downloadsContainer[2].href = download.browser_download_url
    }
})

let locationHash = window.location.hash

if(window.location.hash[0] === '#'){
  locationHash = window.location.hash.slice(1)
}

const urlParams = new URLSearchParams(locationHash)
const isUpdating = urlParams.has('installedVersion')

if(isUpdating){
  const currentlyInstalledVersion = urlParams.get('installedVersion')
  console.log(currentlyInstalledVersion)
}

console.log('test7s')

/* global releases */

const latestRelease = releases.sort((r1, r2) => new Date(r2.published_at) - new Date(r1.published_at))[0]
const downloadsContainer = document.querySelectorAll('#downloads a')

latestRelease.assets.forEach(download => {
    if(download.name.toLowerCase().indexOf('windows') > -1){
        downloadsContainer[0].href = download.browser_download_url
    }
    if(download.name.toLowerCase().indexOf('macos') > -1){
        downloadsContainer[1].href = download.browser_download_url
    }
    if(download.name.toLowerCase().indexOf('linux') > -1){
        downloadsContainer[2].href = download.browser_download_url
    }
})

/*****
* This is because the asset urls are different if viewing on the github repo page compared to the project page.
*/
if(window.location.href.startsWith('https://darkle.github.io/MarkSearch/')){
  Array.from(document.querySelectorAll('img')).forEach(img => {
    if(img.src.startsWith('https://darkle.github.io/assets/screenshots/'))
      img.src = img.src.replace('https://darkle.github.io/assets/screenshots/', 'https://darkle.github.io/MarkSearch/assets/screenshots/')
    })
}
const locationHash = window.location.hash

if(window.location.hash[0] === '#'){
  locationHash = window.location.hash.slice(1)
}

const urlParams = new URLSearchParams(locationHash)
const isUpdating = urlParams.has('installedVersion')

if(isUpdating){
  const currentlyInstalledVersion = urlParams.get('installedVersion')
}

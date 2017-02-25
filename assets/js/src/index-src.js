/* global releases */
import 'babel-polyfill'

/*****
* Not sure if github sorts the releases array by date, so gonna do it manually and grab the most recent.
*/
const latestRelease = releases.sort((r1, r2) => new Date(r2.published_at) - new Date(r1.published_at))[0]
const downloadsContainer = document.querySelectorAll('#downloads a')

latestRelease.assets.forEach(download => {
    if(download.name.toLowerCase().includes('windows')){
        downloadsContainer[0].href = download.browser_download_url
    }
    if(download.name.toLowerCase().endsWith('.dmg')){
        downloadsContainer[1].href = download.browser_download_url
    }
    if(download.name.toLowerCase().includes('linux')){
        downloadsContainer[2].href = download.browser_download_url
    }
})

if(window.location.href === 'https://darkle.github.io/MarkSearch/#downloads'){
  document.querySelector('#upgradeInfo').classList.toggle('hide')
}

const chromeExtensionUrl = 'https://chrome.google.com/webstore/detail/marksearch-browser-extens/apfcialnncnhpohmofpigaclihopfeng'

document.querySelector(`.main-content a[href="${ chromeExtensionUrl }"]`).setAttribute('target', '_blank')

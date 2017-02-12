
## Intro
MarkSearch is a desktop bookmarking application. It allows you to save and search web pages.

The desktop application runs in the background while you use your browser to access the main MarkSearch search page. MarkSearch is supposed to work kinda like google in that you dont need to use tags or categories, you just do a full text search.

You can save web sites manually from the MarkSearch search page, or by using the browser extension to save a site.

The browser extension also has the ability to show your MarkSearch bookmarks on google search pages, so you can see results for you search terms from Google and MarkSearch at the same time.

## Features
- Full text search of the web pages you save.
- Search by site just like google (e.g. site:example.com thingToSearchFor)
- Search by date
- MarkSearch results integrated in to google results page so you can search both at once.
- Browser extention to easily save a web page with one click.
- Fast - because MarkSearch doesn't run on a server on the internet, it should display results as fast as google.
- Cross platform; MarkSearch runs on Linux, MacOS & Windows.
- Simple to install; just download the latest release for you operating system and run.

## Screenshots

#### MarkSearch Search Page:
![Screenshot Of MarkSearch Search Page](/assets/screenshots/MSsearch.png)

#### MarkSearch Settings Page:
![Screenshot Of MarkSearch Settings Page](/assets/screenshots/MSsettingsPage.png)

#### MarkSearch Sitting In The System Tray On Linux & Windows & In The Menu Bar On MacOS:
![Screenshot Of MarkSearch Sitting In The System Tray On Linux](/assets/screenshots/systemtrayLinux.png)

![Screenshot Of MarkSearch Sitting In The System Tray On Windows](/assets/screenshots/systemtrayWin10.png)


![Screenshot Of MarkSearch Sitting In The System Tray On MacOS](/assets/screenshots/menuBarMacOS.png)

#### MarkSearch Browser Extension Icon:
![Screenshot Of MarkSearch Browser Extension Icon](/assets/screenshots/browserExtensionIcon.png)

#### MarkSearch Browser Extension Settings:
![Screenshot Of MarkSearch Browser Extension Settings](/assets/screenshots/extensionOptionsTab1.png)

## Help

### Installation

#### Desktop App:

To install the desktop app, download the latest release for your operating system here: https://darkle.github.io/MarkSearch/#downloads

##### Windows Users:

Once you have downloaded the .exe file, double click it and run the installer. When you run MarkSearch for the first time, you may get a Windows firewall prompt like this:

![Screenshot Of Windows Firwall Prompt](/assets/screenshots/windowsFirewall.png)

if you wish to access the MarkSearch search page from other devices on your network (e.g. your phone), click "Allow access", if you don't, click "Cancel".

##### Linux Users:

Unzip the file and put the folder wherever you want (you can rename it too). Then double click the MarkSearch file.
Note: if you create a .desktop file and need an icon, you can use this large one: [https://github.com/Darkle/MarkSearch/blob/master/appmodules/electron/icons/MSlargeIcon.png](https://github.com/Darkle/MarkSearch/blob/master/appmodules/electron/icons/MSlargeIcon.png)

#### Browser Extension:
Install from the Google Chrome webstore: https://chrome.google.com/webstore/detail/marksearch-browser-extens/apfcialnncnhpohmofpigaclihopfeng
Then go to the MarkSearch desktop app settings by clicking on the MarkSearch icon in the systme tray/menu bar th

### Usage

#### Desktop App:

#### Browser Extension:


## FAQ
- Why doesn't it have tags?
  - Its focus is full text search and on integration with google and other search engines, so just like how you dont really use tags when you search google, the same applies for Marksearch.
- I like the idea of full text search for bookmarks, but I don't like MarkSearch, are there any alternatives?
  - [https://historio.us/](https://historio.us/)
  - [http://fetching.io](http://fetching.io)
  - [http://cottontracks.com/](http://cottontracks.com/)
  - [http://region.io/](http://region.io/)
  - [https://www.basketapp.net/](https://www.basketapp.net/)
  - [http://docs.bmark.us/en/latest/](http://docs.bmark.us/en/latest/)
  - [http://pinboard.in/tour/](http://pinboard.in/tour/)
  - [https://github.com/acoffman/indexmarks](https://github.com/acoffman/indexmarks)
  - [https://grabduck.com/](https://grabduck.com/)
  - [https://chrome.google.com/webstore/detail/foundit/kckobojmajgneicjgbpcccionajfobbo?hl=en-US](https://chrome.google.com/webstore/detail/foundit/kckobojmajgneicjgbpcccionajfobbo?hl=en-US)
  - [http://sebsauvage.net/wiki/doku.php?id=php%3Ashaarli](http://sebsauvage.net/wiki/doku.php?id=php%3Ashaarli)
  - [http://getstache.com/](http://getstache.com/)
  - [https://github.com/kwalo/bookmark-manager](https://github.com/kwalo/bookmark-manager)


Add that can search by site to features- also add to features that site/date search also work with google search - also add to help also
For chrome extension - Remember to mention that the reason we need permission to all sites is because we can not know ahead of time
what ipv4 address the MarkSearch server will use, and we need permission to access that address to send http
requests to it. - (note - it's all sites on http, not https as the MarkSearch server does not run on https)

Make sure i mention how to open the settings via the system tray/menu bar - make sure to include a small screenshot for windows/mac/linux system tray/menu bar

Also put a note that it may take a few minutes for the email to arrive for the token/bookmarklet

REmember to mention that you can search by site and date filter

Show screenshots of the extension - the right click menu on browser bar and the extension settings

Remember to mention about the extensions that search by site and date filter also works

Put a note in the readme that sometimes the emailed bookmarklet takes a few minutes to arrive

Remember to mention for OSX that when MarkSearch starts, it will show up in the menu bar, not in the dock

For the extensions, rememeber to say that the extension respects date filters & searching by site

Mention that if they have the results box set to be on the left on google, that it will always be hidden, even if you have it set to auto show on page load (cause it would always obscure the google results)

For extension, remember to mention that you can click on the MarkSearch link at the top of the results box on the search enging to open the results in the MarkSearch server search page (its the light grey MarkSearch text up the top of the MS results box)

Remember to add info about keyboard shortcut (Ctrl+M) to show/hide the MarkSearch results box

Also info about searching MS in the omnibox

Add info about choosing the search type (instant or non instant)

Make a note that the extension should work ok with google search pages that have RTL languages

Remember to mention on install under windows, when you first run MarkSearch you may get a firewall popup like this: (show the screenshot in the assets folder) - if you want to be able to search MarkSearch from other computers on your network click "Allow Access", if not, you can click cancel to deny (MarkSearch will still work if you click cancel, it just wont be accessable from other devices on your network).

Go through all the features in the desktop app settings

Note that at the moment it doesnt support quoting to make the search more accurate - the current search is `from "fts" where fts match '"tech news" OR ("tech" AND "news")'`

Note that the bookmarklet may not work on some sites due to CSPs

### Help

##### Setting Up The MarkSearch Browser Extension

##### Setting Up The MarkSearch Bookmarklet

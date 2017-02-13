
## Intro
MarkSearch is a desktop bookmarking application. It allows you to save and search web pages.

The desktop application runs in the background while you use your browser to access the main MarkSearch search page. MarkSearch is supposed to work kinda like google in that you dont need to use tags or categories, you just do a full text search.

You can save web sites manually from the MarkSearch search page, or by using the browser extension to save a site.

The browser extension also has the ability to show your MarkSearch bookmarks on google search pages, so you can see results for you search terms from Google and MarkSearch at the same time.

## Features
- Full text search of the web pages you save
- Search by site just like google (e.g. site:example.com thingToSearchFor)
- Search by date
- An archive of the page you save is also created so that you can view the page even if it is no longer online
- MarkSearch results integrated in to google results page so you can search both at once
- Browser extention to easily save a web page with one click
- Fast - because MarkSearch doesn't run on a server on the internet, it should display results as fast as google
- Bookmark expiry - get an email with old bookmarks that you can delete
- You can change the location of the MarkSearch database to make it easy to back it up to Dropbox
- Easily import and export bookmarks en masse
- Cross platform; MarkSearch runs on Linux, MacOS & Windows
- Simple to install; just download the latest release for you operating system and run

## Screenshots

#### MarkSearch Search Page:
![Screenshot Of MarkSearch Search Page]({{ '/assets/screenshots/MSsearch.png' | relative_url }})

#### MarkSearch Settings Page:
![Screenshot Of MarkSearch Settings Page]({{ '/assets/screenshots/MSsettingsPage.png' | relative_url }})

#### MarkSearch Sitting In The System Tray On Linux & Windows & In The Menu Bar On MacOS:
![Screenshot Of MarkSearch Sitting In The System Tray On Linux]({{ '/assets/screenshots/systemtrayLinux.png' | relative_url }})

![Screenshot Of MarkSearch Sitting In The System Tray On Windows]({{ '/assets/screenshots/systemtrayWin10.png' | relative_url }})


![Screenshot Of MarkSearch Sitting In The System Tray On MacOS]({{ '/assets/screenshots/menuBarMacOS.png' | relative_url }})

#### MarkSearch Browser Extension Icon:
![Screenshot Of MarkSearch Browser Extension Icon]({{ '/assets/screenshots/browserExtensionIcon.png' | relative_url }})

#### MarkSearch Browser Extension Settings:
![Screenshot Of MarkSearch Browser Extension Settings]({{ '/assets/screenshots/extensionOptionsTab1.png' | relative_url }})

## Help

To find this help page again, right-click the MarkSearch icon in the system tray (or left-click the MarkSearch icon in the menu bar if you're on MacOS), then click on "Help".

Note: if you need help with something that isn't mentioned here, you can open a ticket here: [https://github.com/Darkle/MarkSearch/issues](https://github.com/Darkle/MarkSearch/issues)

### Installation & Setup

#### Desktop App:

To install the desktop app, download the latest release for your operating system here: [Downloads]({{ '#downloads' | relative_url }})

##### Windows Users:

Once you have downloaded the .exe file, double click it and run the installer. When you run MarkSearch for the first time, you may get a Windows firewall prompt like this:

![Screenshot Of Windows Firwall Prompt]({{ '/assets/screenshots/windowsFirewall.png' | relative_url }})

if you wish to access the MarkSearch search page from other devices on your network (e.g. your phone), click "Allow access", if you don't, click "Cancel".

##### Linux Users:

Unzip the file and put the folder wherever you want (you can rename it too). Then double click the MarkSearch file.
Note: if you create a .desktop file and need an icon, you can use this large one: [https://github.com/Darkle/MarkSearch/blob/master/appmodules/electron/icons/MSlargeIcon.png](https://github.com/Darkle/MarkSearch/blob/master/appmodules/electron/icons/MSlargeIcon.png)

##### MacOS Users:

Mount the DMG file and copy the MarkSearch.app to the applications directory.

#### Browser Extension:
Install from the Google Chrome webstore: [https://chrome.google.com/webstore/detail/marksearch-browser-extens/apfcialnncnhpohmofpigaclihopfeng](https://chrome.google.com/webstore/detail/marksearch-browser-extens/apfcialnncnhpohmofpigaclihopfeng)

When you first install the MarkSearch browser extension, the extension options page will automatically open to the setup.

![Screenshot Of MarkSearch Extension Setup]({{ '/assets/screenshots/extensionToken.png' | relative_url }})

You need to get an extension token from the MarkSearch desktop app settings and paste it in here.

You can open the MarkSearch desktop settings by right-clicking the MarkSearch icon in the system tray (or left-clicking the MarkSearch icon in the menu bar if you're on MacOS), then click on "Settings".

Once the MarkSearch dekstop app settings window is displayed, click on the "Gernerate Extension Token" button. Then click the clipboard button to the right to copy the token to the clipboard. Once you have done that, go back to the MarkSearch browser extenstion settings in your browser and paste in the token.

### Usage

#### Desktop App:

When MarkSearch runs for the first time, it will open the MarkSearch search page automatically in your browser. From this page you can search MarkSearch and all add web sites to MarkSearch.

##### Search

If you havent already bookmarked the MarkSearch search page, you can open it by right-clicking the MarkSearch icon in the system tray (or left-clicking the MarkSearch icon in the menu bar if you're on MacOS), then click on "Search". This will open the MarkSearch search page in your browser.

Typing in the search box will search MarkSearch.

To search by site, use the following format: `site:reddit.com foo bar` where reddit.com is the site you want to limit the search too and "foo bar" are the search terms you want to search for.

To search by date, click on the date icon on the search page. This will show a date filter bar like so:

![Screenshot Of MarkSearch Date Filter]({{ '/assets/screenshots/dateFilterBar.png' | relative_url }})

You can choose one of the quick date filter shortcuts on the right to search the past 3 days, the past week, the past month etc, or you can set the start and end month/year for the date filter manually.

To remove the date filter, click on the date icon.

##### Adding Pages

To add a web page to MarkSearch, click on the plus icon on the top right of the MarkSearch search page. This will open the box where you can add multiple web pages at once like so:

![Screenshot Of MarkSearch Add Pages Box]({{ '/assets/screenshots/addPagesToMS.png' | relative_url }})

After you have pasted all the pages you want to save in to the box, click the "Save URLs" button. Note: it will take a few moments to save them as the MarkSearch desktop app has to download the sites internally.

##### Removing Pages

To remove a page from MarkSearch, just click on the trash icon to the right of the link:

![Screenshot Of MarkSearch Delete Icon]({{ '/assets/screenshots/deleteIcon.png' | relative_url }})

##### Viewing Page Archive

Whenever a page is saved to MarkSearch, an archive is also created of that page on [archive.is](https://archive.is/). To view the archive, just click on the archive icon to the right of the link:

![Screenshot Of MarkSearch Archive Icon]({{ '/assets/screenshots/archiveIcon.png' | relative_url }})

##### Settings

You can open the MarkSearch desktop settings by right-clicking the MarkSearch icon in the system tray (or left-clicking the MarkSearch icon in the menu bar if you're on MacOS), then click on "Settings".

Once you have changed a setting, click on the "Save" button at the bottom.

###### Bookmarklet

You can use the bookmarklet to save pages from browsers that cant run extensions (e.g. mobile browsers). You can either generate the bookmarklet text and copy & paste, or you can have the bookmarklet emailed to you. Note: unfortunately the bookmarklet will not work on https pages.

###### Prebrowsing

When enabled, the first two results on the MarkSearch search page will have prebrowsing applied to them. Prebrowsing can make bookmark links load faster when you click on them from the search page. (The first result will have "preconnect" applied, while the second result will have "dns-prefetch" applied. More info [here](https://css-tricks.com/prefetching-preloading-prebrowsing/)

###### Always Disable Tooltips

MarkSearch shows tooltips when you hover over icons on the MarkSearch search page. It does this until there have been pages saved to the database and there has been at least one result shown. This is done to help the user know what the icons do. If you are always running in incognito mode, then you probably want to always disable the tooltips.

###### Bookmark Expiry

MarkSearch can check every 3 or 6 months for old bookmarks and then email you with details of the old bookmarks. In the email, you are given a link to a page where you can delete the old bookmarks from MarkSearch.

MarkSearch remembers which links it has already checked, so you wont get an email with previously checked links.

###### Current Database Location

You can change where your MarkSearch database is stored. This is useful for if you want to have your bookmarks automatically backed up (e.g. putting them in a Dropbox folder). **Note: if you already have a file named "MarkSearchPages.db" in that directory, it will be overwritten.**

###### Revoke All Tokens

Use this button to revoke all tokens generated for extensions or bookmarklets.

###### Tray Icon Color

This setting allows you to change the color of the MarkSearch system tray icon. The 3 options are Blue, Black or White.

Note: once you save this setting, you will have to restart MarkSearch for the new icon to be shown.

###### Import Bookmarks

You can import Bookmarks into MarkSearch using either a Netscape Bookmarks html file or a Plain Text file.

Netscape Bookmarks html files can be exported by Chrome, Firefox and IE, so you can export your bookmarks from those browsers and then import them into MarkSearch.

You can also import bookmarks from Instapaper, Pocket & Pinboard using the "Import Bookmarks.html File" method. Note: make sure when exporting your bookmarks from Instapaper or Pinboard, that you choose the "html" export method.

You can also import Bookmarks via a plain text file. The plain text file must contain a URL on each new line.

When importing, MarkSearch scrapes the web page for each Bookmark URL you are importing, so the import may take some time if there are a large number of URLs to import/scrape.

###### Export Bookmarks

Exporting as a Bookmarks.html file (aka Netscape Bookmarks html file) will allow you to import your MarkSearch Bookmarks into Chrome, Firefox & IE.

Exporting as a Plain Text file will export all your MarkSearch Bookmarks as plain text with each Bookmarks URL on a new line in the file.





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

Remember to do a bit on the archive.is backups

Go through all the features in the desktop app settings

Note that at the moment it doesnt support quoting to make the search more accurate - the current search is `from "fts" where fts match '"tech news" OR ("tech" AND "news")'`

Note that the bookmarklet may not work on some sites due to CSPs

### Help

##### Setting Up The MarkSearch Browser Extension

##### Setting Up The MarkSearch Bookmarklet

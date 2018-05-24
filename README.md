#### A note about security and updates

Recently there was a [vulnerability discovered](https://www.trustwave.com/Resources/SpiderLabs-Blog/CVE-2018-1000136---Electron-nodeIntegration-Bypass/) in Electron. I have updated the Windows version of MarkSearch to a version of Electron that includes a patch for this issue. 

Unfortunately I ran in to some issues building the latest version of MarkSearch on MacOS and Linux, so if you need to use MarkSearch on MacOS or Linux, it is recommended that you do not add links manually from the MarkSearch search page or via the MarkSearch settings page - only add pages to MarkSearch via the chrome extension.

---

MarkSearch is a desktop bookmarking application. It allows you to save and search web pages.

The desktop application runs in the background while you use your browser to access the main MarkSearch search page. MarkSearch is supposed to work kinda like google in that you don't need to use tags or categories, you just do a full text search.

You can save websites manually from the MarkSearch search page, or by using the browser extension to save a site.

The browser extension also has the ability to show your MarkSearch bookmarks on google search pages, so you can see results for you search terms from Google and MarkSearch at the same time.

## Features:

- Full text search of the web pages you save
- Search by site just like google (e.g. site:example.com thingToSearchFor)
- Search by date
- An archive of the page you save is also created so that you can view the page even if it is no longer online
- MarkSearch results integrated into google results page so you can search both at once
- Browser extension to easily save a web page with one click
- Fast - because MarkSearch doesn't run on a server on the internet, it should display results as fast as google
- Bookmark expiry - get an email with old bookmarks that you can delete
- You can change the location of the MarkSearch database to make it easy to back it up to Dropbox
- Easily import and export bookmarks en masse
- Cross platform; MarkSearch runs on Linux, MacOS & Windows
- Simple to install; just download the latest release for you operating system and run
- Automatic update checks

## Screenshots:

- #### MarkSearch Search Page

  - ![Screenshot Of MarkSearch Search Page]({{ '/assets/screenshots/screenshots-optimized/MSsearch.png' | relative_url }})

- #### MarkSearch Sitting In The System Tray On Linux & Windows And In The Menu Bar On MacOS

  - ![Screenshot Of MarkSearch Sitting In The System Tray On Linux]({{ '/assets/screenshots/screenshots-optimized/systemtrayLinux.png' | relative_url }})

  - ![Screenshot Of MarkSearch Sitting In The System Tray On Windows]({{ '/assets/screenshots/screenshots-optimized/systemtrayWin10.png' | relative_url }})

- ![Screenshot Of MarkSearch Sitting In The System Tray On MacOS]({{ '/assets/screenshots/screenshots-optimized/menuBarMacOS.png' | relative_url }})

- #### MarkSearch Browser Extension Icon

  - ![Screenshot Of MarkSearch Browser Extension Icon]({{ '/assets/screenshots/screenshots-optimized/browserExtensionIcon.png' | relative_url }})

- #### MarkSearch Results On The Google Results Page

  - ![Screenshot Of MarkSearch Extension MarkSearch Results Box]({{ '/assets/screenshots/screenshots-optimized/extensionResultsBox.png' | relative_url }})

## Help

To find this help page again, right-click the MarkSearch icon in the system tray (or left-click the MarkSearch icon in the menu bar if you're on MacOS), then click on "Help".

Note: if you need help with something that isn't mentioned here, you can open a ticket here: [https://github.com/Darkle/MarkSearch/issues](https://github.com/Darkle/MarkSearch/issues)

- ### Installation & Setup:

  - #### Desktop App:

    - To install the desktop app, download the latest release for your operating system here: [Downloads]({{ '#downloads' | relative_url }})

    - Note: if you are updating, remember to exit MarkSearch first before you install the new version. To exit, just right-click the MarkSearch icon in the system tray (or left-click the MarkSearch icon in the menu bar if you're on MacOS), then click on "Quit MarkSearch".

    - ##### Windows Users:

      - Once you have downloaded the .exe file, double click it and run the installer.

      - When you run MarkSearch for the first time, you may get a Windows firewall prompt like this:

      - ![Screenshot Of Windows Firewall Prompt]({{ '/assets/screenshots/screenshots-optimized/windowsFirewall.png' | relative_url }})

      - if you wish to access the MarkSearch search page from other devices on your network (e.g. your phone), click "Allow access", if you don't, click "Cancel".

    - ##### Linux Users:

      - Unzip the file and put the folder wherever you want (you can rename the folder if you want). Then double click the MarkSearch file to run it.

      - Add the MarkSearch file to your startup applications to have it run on startup.

      - If you are running a firewall and want to access the MarkSearch search page from other devices on your network, you will have to allow incoming connections for the port MarkSearch is running on. You will see the port it is running on in the address url when you have the MarkSearch search page open.

      - Note: if you creating a .desktop file for MarkSearch and need an icon, you can use this large one: [https://github.com/Darkle/MarkSearch/blob/master/appmodules/electron/icons/MSlargeIcon.png](https://github.com/Darkle/MarkSearch/blob/master/appmodules/electron/icons/MSlargeIcon.png)

    - ##### MacOS Users:

      - Mount the DMG file and copy the MarkSearch.app to the applications directory.

      - When you run MarkSearch for the first time, you may get a firewall prompt like this:

      - ![Screenshot Of MacOS Firewall Prompt]({{ '/assets/screenshots/screenshots-optimized/OSX-Firewall-SS-opt.png' | relative_url }})

      - if you wish to access the MarkSearch search page from other devices on your network (e.g. your phone), click "Allow", if you don't, click "Deny".

      - Note: when MarkSearch runs on MacOS, it will not show in the dock, it will only be available from the menu bar.

      - 
  - #### Browser Extension:

    - Install from the Google Chrome webstore: [https://chrome.google.com/webstore/detail/marksearch-browser-extens/apfcialnncnhpohmofpigaclihopfeng](https://chrome.google.com/webstore/detail/marksearch-browser-extens/apfcialnncnhpohmofpigaclihopfeng)

    - When you first install the MarkSearch browser extension, the extension options page will automatically open to the setup.

    - ![Screenshot Of MarkSearch Extension Setup]({{ '/assets/screenshots/screenshots-optimized/extensionToken.png' | relative_url }})

    - You need to get an extension token from the MarkSearch desktop app settings and paste it in here.

    - You can open the MarkSearch desktop settings by right-clicking the MarkSearch icon in the system tray (or left-clicking the MarkSearch icon in the menu bar if you're on MacOS), then click on "Settings".

    - Once the MarkSearch desktop app settings window is displayed, click on the "Generate Extension Token" button. Then click the clipboard button to the right to copy the token to the clipboard. Once you have done that, go back to the MarkSearch browser extension settings in your browser and paste in the token.

    - Then click on the "Look & Behaviour" tab in the settings. There you will see a setting to choose the search type that google is using. If you have never changed the google search settings on the google search page, then leave the search type as "Instant", if you have changed your google search type in the google search page settings to "Never Show Instant Results" then you need to change the search type to "Non Instant Search".

    - You can check what your google search settings are by clicking on the "Settings" button on the google search page and then clicking on "Search settings" as seen here:

    - ![Screenshot Of Google Search Settings Button]({{ '/assets/screenshots/screenshots-optimized/googleSearchSettingsButton.png' | relative_url }})

    - This will take you to a page where you will see whether google instant search is enabled/disabled:

    - ![Screenshot Of Google Search Settings Button]({{ '/assets/screenshots/screenshots-optimized/googleInstantSearchSettings.png' | relative_url }})

- ### Usage

  - #### Desktop App:

    - When MarkSearch runs for the first time, it will open the MarkSearch search page automatically in your browser. From this page you can search MarkSearch and add websites to MarkSearch.

    - ##### Search:

      - If you haven't already bookmarked the MarkSearch search page, you can open it by right-clicking the MarkSearch icon in the system tray (or left-clicking the MarkSearch icon in the menu bar if you're on MacOS), then click on "Search". This will open the MarkSearch search page in your browser.

      - Note: you can also open the MarkSearch search page by using the browser extension right-click menu as seen here:

      - ![Screenshot Of MarkSearch Extension MarkSearch Button Menu]({{ '/assets/screenshots/screenshots-optimized/rightClickMenuExtensionIcon.png' | relative_url }})

      - Typing in the search box will search MarkSearch.

      - You can use the `-` operator to indicate you don't want a word to appear in a search result, so searching for `foo -bar` would search for results that have the word "foo" but not "bar" in it. Note: the `-` must be right next to the word, so `foo -bar` would work, but `foo - bar` would not work as an operator.

      - You can use the `|` operator to indicate an OR search, so searching for `foo |bar` would search for results with the word "foo" or "bar" in it. Note: the `|` must be right next to the word, so `foo |bar` would work, but `foo | bar` would not work as an operator.

      - To search by site, use the following format: `site:reddit.com foo bar` where reddit.com is the site you want to limit the search too and "foo bar" are the search terms you want to search for. Note: the `site:` must be right next to the domain, so `site:reddit.com foo bar` would work, but `site: reddit.com foo bar` would not work as a search by site.

      - If you want to list all the sites you have saved from a single domain, you can use `site:reddit.com` without any search terms following it.

      - To search by date, click on the date icon on the search page. This will show a date filter bar like so:

      - ![Screenshot Of MarkSearch Date Filter]({{ '/assets/screenshots/screenshots-optimized/dateFilterBar.png' | relative_url }})

      - You can choose one of the quick date filter shortcuts on the right to search the past 3 days, the past week, the past month etc, or you can set the start and end month/year for the date filter manually.

      - To remove the date filter, click on the date icon.

    - ##### Adding Pages:

      - To add a web page to MarkSearch, click on the plus icon on the top right of the MarkSearch search page. This will open the box where you can add multiple web pages at once like so:

      - ![Screenshot Of MarkSearch Add Pages Box]({{ '/assets/screenshots/screenshots-optimized/addPagesToMS.png' | relative_url }})

      - After you have pasted all the pages you want to save into the box, click the "Save URLs" button. Note: it will take a few moments to save them as the MarkSearch desktop app has to download the sites internally.

    - ##### Removing Pages:

      - To remove a page from MarkSearch, just click on the trash icon to the right of the link:

      - ![Screenshot Of MarkSearch Delete Icon]({{ '/assets/screenshots/screenshots-optimized/deleteIcon.png' | relative_url }})

    - ##### Viewing Page Archive:

      - Whenever a page is saved to MarkSearch, an archive is also created of that page on [archive.is](https://archive.is/). To view the archive, just click on the archive icon to the right of the link:

      - ![Screenshot Of MarkSearch Archive Icon]({{ '/assets/screenshots/screenshots-optimized/archiveIcon.png' | relative_url }})

    - ##### Settings:

      - You can open the MarkSearch desktop settings by right-clicking the MarkSearch icon in the system tray (or left-clicking the MarkSearch icon in the menu bar if you're on MacOS), then click on "Settings".

      - Once you have changed a setting, click on the "Save" button at the bottom.

      - Screenshot of the MarkSearch settings window:

        - ![Screenshot Of MarkSearch Settings Page]({{ '/assets/screenshots/screenshots-optimized/MSsettingsPage.png' | relative_url }})
        - 
      - ###### Bookmarklet:

        - You can use the bookmarklet to save pages from browsers that can't run extensions (e.g. mobile browsers). You can either generate the bookmarklet text and copy & paste, or you can have the bookmarklet emailed to you. Note: unfortunately the bookmarklet will not work on https pages - also, the email may take a few minutes to arrive.
        - 
      - ###### Prebrowsing:

        - When enabled, the first two results on the MarkSearch search page will have prebrowsing applied to them. Prebrowsing can make bookmark links load faster when you click on them from the search page. (The first result will have "preconnect" applied, while the second result will have "dns-prefetch" applied. More info [here](https://css-tricks.com/prefetching-preloading-prebrowsing/)
        - 
      - ###### Always Disable Tooltips

        - MarkSearch shows tooltips when you hover over icons on the MarkSearch search page. It does this until there have been pages saved to the database and there has been at least one result shown. This is done to help the user know what the icons do. If you are always running in incognito mode, then you probably want to always disable the tooltips.
        - 
      - ###### Bookmark Expiry:

        - MarkSearch can check every 3 or 6 months for old bookmarks and then email you with details of the old bookmarks. In the email, you are given a link to a page where you can delete the old bookmarks from MarkSearch.

        - MarkSearch remembers which links it has already checked, so you won't get an email with previously checked links.

        - 
      - ###### Current Database Location:

        - You can change where your MarkSearch database is stored. This is useful for if you want to have your bookmarks automatically backed up (e.g. putting them in a Dropbox folder). **Note: if you already have a file named "MarkSearchPages.db" in that directory, it will be overwritten.**
        - 
      - ###### Revoke All Tokens:

        - Use this button to revoke all tokens generated for extensions or bookmarklets.
        - 
      - ###### Tray Icon Color:

        - This setting allows you to change the color of the MarkSearch system tray icon. The 3 options are Blue, Black or White.

        - Note: once you save this setting, you will have to restart MarkSearch for the new icon to be shown.

        - 
      - ###### Import Bookmarks:

        - You can import Bookmarks into MarkSearch using either a Netscape Bookmarks html file or a Plain Text file.

        - Netscape Bookmarks html files can be exported by Chrome, Firefox and IE, so you can export your bookmarks from those browsers and then import them into MarkSearch.

        - You can also import bookmarks from Instapaper, Pocket & Pinboard using the "Import Bookmarks.html File" method. Note: make sure when exporting your bookmarks from Instapaper or Pinboard, that you choose the "html" export method.

        - You can also import Bookmarks via a plain text file. The plain text file must contain a URL on each new line.

        - When importing, MarkSearch scrapes the web page for each Bookmark URL you are importing, so the import may take some time if there are a large number of URLs to import/scrape.

        - 
      - ###### Export Bookmarks:

        - Exporting as a Bookmarks.html file (aka Netscape Bookmarks html file) will allow you to import your MarkSearch Bookmarks into Chrome, Firefox & IE.

        - Exporting as a Plain Text file will export all your MarkSearch Bookmarks as plain text with each Bookmarks URL on a new line in the file.

        - 
    - ##### MarkSearch Desktop App Updates:

      - MarkSearch will check on startup for updates and then once a week while it's running. If there is an update available, you will get an update window like this:

      - ![Screenshot Of MarkSearch Desktop Updated Notification]({{ '/assets/screenshots/screenshots-optimized/MSupdateNotification.png' | relative_url }})

      - If you click the "Go To Download Page", it will open the download page in your browser. If you click "Skip This Update", it will not pester you again for this update. If you close the update window without clicking any of the buttons, it will show the update window again in a week or the next time you run MarkSearch.

      - Note: once you have downloaded the update, remember to exit MarkSearch first before you install the new version. To exit, just right-click the MarkSearch icon in the system tray (or left-click the MarkSearch icon in the menu bar if you're on MacOS), then click on "Quit MarkSearch".

  - #### Browser Extension:

    - When you first install the MarkSearch browser extension, the extension options page will automatically open to the setup.

    - ![Screenshot Of MarkSearch Extension Setup]({{ '/assets/screenshots/screenshots-optimized/extensionToken.png' | relative_url }})

    - You need to get an extension token from the MarkSearch desktop app settings and paste it in here.

    - You can open the MarkSearch desktop settings by right-clicking the MarkSearch icon in the system tray (or left-clicking the MarkSearch icon in the menu bar if you're on MacOS), then click on "Settings".

    - Once the MarkSearch desktop app settings window is displayed, click on the "Generate Extension Token" button. Then click the clipboard button to the right to copy the token to the clipboard. Once you have done that, go back to the MarkSearch browser extension settings in your browser and paste in the token.

    - Note: if you need to open the MarkSearch browser extension settings again later, you can do so by right-clicking on the MarkSearch icon in the browser and selecting "Options" as seen here:

    - ![Screenshot Of MarkSearch Extension MarkSearch Button Menu]({{ '/assets/screenshots/screenshots-optimized/rightClickMenuExtensionIcon.png' | relative_url }})

      - ##### Search:

        - The MarkSearch browser extension integrates with google. When you search for something in google, you also search for it in MarkSearch. So typing "hacker news" into google would result in the following:

        - ![Screenshot Of MarkSearch Extension Default Search]({{ '/assets/screenshots/screenshots-optimized/extensionDefaultSearch.png' | relative_url }})

        - The MarkSearch results box by default is on the right of the page and hidden. You can see the MarkSearch results in the box by either clicking the blue bar or by using the keyboard shortcut Ctrl+M.

        - When the MarkSearch results box is displayed it looks like this:

        - ![Screenshot Of MarkSearch Extension MarkSearch Results Box]({{ '/assets/screenshots/screenshots-optimized/extensionResultsBox.png' | relative_url }})

        - By default the MarkSearch results box will not expand to show the results on page load so as not to annoy you. You can change this behaviour and have it always auto expand in the extension settings.

        - Note: if your browser's current width is wide enough, the MarkSearch results box when expanded will show to the right of the google results (this is handy if you have a widescreen monitor). However if your browser is not wide enough, the MarkSearch results box will expand to the full width of the browser and show on top of the google results like this:

        - ![Screenshot Of MarkSearch Extension MarkSearch Results Box Shown Narrow Browser]({{ '/assets/screenshots/screenshots-optimized/extensionResultsNarrowBrowser.png' | relative_url }})

        - If you wish to open the MarkSearch search page with the current google search terms, you can either click on the blue MarkSearch search button seen here at the top right of the google search box:

        - ![Screenshot Of MarkSearch Extension MarkSearch Search Button]({{ '/assets/screenshots/screenshots-optimized/extensionSearchButton.png' | relative_url }})

        - or you can click the word MarkSearch at the top of the MarkSearch results box seen here:

        - ![Screenshot Of MarkSearch Extension MarkSearch Results Box Shortcut Link]({{ '/assets/screenshots/screenshots-optimized/MSresultsBoxShortcutLink.png' | relative_url }})

        - Both the MarkSearch search button and results box on the google results page should also work with google search pages that use rtl languages like Arabic, Hebrew etc.

        - If you want to search by site, MarkSearch uses the same syntax that google uses, so if you search for `site:reddit.com foo bar` into google, MarkSearch will also search for pages with "foo bar" in them from the site reddit.com. (note, make sure when you use this syntax that you don't put a space between `site:` and the domain)

        - MarkSearch will also respect any date filters you use with your google search, so if you set the google search filters (as seen in the screenshot below), MarkSearch will also apply the same date filter to the search.

        - ![Screenshot Of Google Date Filters]({{ '/assets/screenshots/screenshots-optimized/googleDateFilters.png' | relative_url }})

        - MarkSearch will also use the google search operators `-` and `|` if you use them, but note that you must make sure to put them next to the word without a space - e.g. `foo -bar` not `foo - bar` and `foo |bar` not `foo | bar`

        - You can also search MarkSearch via the omnibox in Chrome. Just click on the url bar in chrome and type 'ms', then press tab and you will now be able to search MarkSearch from the Chrome omnibox. Screenshot:

        - ![Screenshot Of MarkSearch Extension Omnibox Search]({{ '/assets/screenshots/screenshots-optimized/omniboxSearch.png' | relative_url }})

      - ##### Saving & Removing Pages:

        - To save a page to MarkSearch, click on the MS icon seen here:

        - ![Screenshot Of MarkSearch Extension Icon]({{ '/assets/screenshots/screenshots-optimized/extensionIcon.png' | relative_url }})

        - A notice will display on the page that it has been saved to MarkSearch and the icon will also change to say "Saved":

        - ![Screenshot Of MarkSearch Saved Page]({{ '/assets/screenshots/screenshots-optimized/extensionSavePage.png' | relative_url }})

        - To remove a page from MarkSearch, just click on the MS icon and it will be removed. A notification will show on the page and the MS icon will no longer say "Saved":

        - ![Screenshot Of MarkSearch Removed Page]({{ '/assets/screenshots/screenshots-optimized/extensionRemovedPage.png' | relative_url }})

      - ##### Extension Options:

        - ![Screenshot Of MarkSearch Extension Options]({{ '/assets/screenshots/screenshots-optimized/extensionOptions.png' | relative_url }})

        - ###### MarkSearch Results Box:

          - You can set the MarkSearch results box to show on the right or left of the google results page. You can also set the box to autoexpand on page load.
          - 
        - ###### MarkSearch Search Button:

          - You can disable showing the MarkSearch search button next to the google search box as seen here:

          - ![Screenshot Of MarkSearch Extension MarkSearch Search Button]({{ '/assets/screenshots/screenshots-optimized/extensionSearchButton.png' | relative_url }})

          - 
        - ###### Prebrowsing:

          - When enabled, the first two results in the MarkSearch results will have prebrowsing applied to them. Prebrowsing can make links load faster.

          - The first result will have "preconnect" applied, while the second result will have "dns-prefetch" applied. More info on how prebrowsing works is available here: [https://css-tricks.com/prefetching-preloading-prebrowsing/](https://css-tricks.com/prefetching-preloading-prebrowsing/)

          - 
## FAQ

- Why doesn't it have tags?
  - Its focus is full text search and on integration with google and other search engines, so just like how you don't really use tags when you search google, the same applies for Marksearch.
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
- Why is the code so shit?
  - It's my first day
- I'd like to donate
  - <a href="https://www.buymeacoffee.com/2yhzJxd4B" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png?" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
  - You can also donate via Bitcoin. Click the image below if you have a bitcoin app installed, or use it as a QR code. Or copy the address manually below.
    - {: #bitcoinAddress }[![Bitcoin Address QR Code](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOQAAADkAQAAAACgLLUgAAADH0lEQVR4nO2Y3Y0kMQiEzSYAGZB/WM4AIvB95Xnve5jmpJO2V5rpNZIZ/qrK/jkPT/2sp+fX+l9YzSy6V8fqtSL45kuLw379HD5sbVvWWrOwz+JwNhRZe6wTZ+0VVV2fxfkquK+z4liuVa2P13Z+thoRrzKKvDN2+Xs7P1hPkeIOMu0UtWrxpsVhv222cCm3KzwjM1ZocdivALH523XrWor4Lo738zKPE4lzDRIDvDvijZ0frbjU3OxKxnZtvIYzS2saN9p2klyQqs52XApB+g7xLF65796u+prjLJP2pru+3/kv1gYpvJPH1clgVhN1jef5rPIAKmjpz2IGtbbxPAsxFJ1bKs2t/7aP48aml8N29wYpu+o4nrNiOs+5VVSIwS9eQkRUd0eN4wZ5PR6ABnSPawYomeDxeOsUM9PpnviHf8n1NvPvd362Bu3E/FLgggw1UC06Gs/zPhBvLsVsaUwVEBnh/f3Oz1baF33TfOaN9zbY6nG8itvD5Y6o1AxvUW/nP5hfp52JE6A+7XxV8zLez5IZLRmJo3DYYUfysqb7CnckGUQWYKHfIaXWy/c7P1tLMmOrnfAp3CLvbW/s/Gx1cILm2lKyoBWFNnjw7On6WkaUH7AxklIDVAc6ivH6SkMCjhT37E2kjJHmdxwnmZyABUg0Yyy0OMrAGtfP8uT3lAAz6GdYFTUf15OBWgYljuaJbF8K7OMv7PxslZS8JQa56CjYV/z/xs7P1jTSCw8unQkP1F8QobT7eD9z+IQHmyPoJaTmHBp7f7/zs7XhgAuLWWUAJipH//k4L9jRMaWyLCWzOCBR4BznfbCReUVAmsjIQhcqOpzNn0Nd8X7ukYRUO6Wgx3kfqtWJ8KCzwkLnfiih58+/93oDIoiW3tAoMVXHx/H5Xs2lvOqeo/QrmKMb8SwvnLMkXtVJ98KMwQIxx+O9V3NQQeoWZyVN1noZP+/rCcllVCRx3sOgbizf2fkvVth3nd0SeH3Vpc/zLw290XTEm1LTEgL1D/TGvZqDDyrvjV0UP8IuXg7P7znIOmHW56JO1MDn/H3dr3Xe+gdaueWsaAiRewAAAABJRU5ErkJggg==)](bitcoin:1D8rwE8rmAzASPaJadcaMFxdjXtyJZpGQP)
    - `1D8rwE8rmAzASPaJadcaMFxdjXtyJZpGQP`

* To get set up:
  1. Clone repo
  2. Install node-gyp requirements: https://github.com/nodejs/node-gyp#installation
  Note: for windows setup, you can use the setupForNodeGypForWindows npm task.
  3. run `npm run initialSetup`
  4. Create a folder called `config` in the project directory, then in the `config` folder, create a file called `apikeys.json`. In the `apikeys.json` file put the following: https://gist.github.com/Darkle/e80746ccc0e30d675b3dc5b5046659ea
  5. Sign up for a free account on https://www.mailgun.com/ and put your mailgun keys in the apikeys.json.
  6. Then if you want to do some development, just run `npm start` or if you want to package, run one of the npm package
  scripts like `npm run packagelinux64`

* Some urls to try that have issues saving: https://gist.github.com/Darkle/26c453d6778adeaf2f84c6c53e2bfe16

* Note: we dont use electron-prebuilt any more: http://electron.atom.io/blog/2016/08/16/npm-install-electron

* Consider switching to using https://github.com/electron-userland/electron-builder rather than electron-packager as it can do produce
  windows installers and seems to do MacOS apps with code signing.

* When doing a new release, double check the download links point to the latest release downloads. Note: remember to run webpack in the gh-pages branch and push the changes with the new file hash name, otherwise the js on the page wont point to the latest releases because the github metadata only seems to be updated for the github pages when something is changed in the gh-pages branch and pushed.

* Doing the github pages stuff:
  * **IMPORTANT: DON'T rebase or merge the master into the gh-pages branch or vice versa. There's nothing in either branch that needs to be in the other branch. Effectively think of them as seperate repos.**
  * (to clone the pages branch, create a new folder and run `git clone -b gh-pages --single-branch https://github.com/Darkle/MarkSearch.git`)
  * http://mycyberuniverse.com/web/fixing-jekyll-github-metadata-warning.html
  * https://help.github.com/articles/using-jekyll-as-a-static-site-generator-with-github-pages/
  * https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/
  * https://help.github.com/articles/user-organization-and-project-pages/
  * https://help.github.com/articles/repository-metadata-on-github-pages/
running `jekyll serve` should show you a preview of what it will look like
  * When you are done editing, remember to run buildProduction npm task and then push that branch to github.

**NOTE: we dont rebase or merge anything from master in to gh-pages branch. We treat them as completely seperate.**

* We run `npm install multiview -g` in the npm setup task cause for some reason multiview doesnt work again after it first runs and you stop it with ctrl+c. Installing it globally works though.

* If someone asks about the permissions for the chrome extension:
  * For chrome extension - Remember to mention that the reason we need permission to all sites is because we can not know ahead of time
what ipv4 address the MarkSearch server will use, and we need permission to access that address to send http
requests to it. - (note - it's all sites on http, not https as the MarkSearch server does not run on https)

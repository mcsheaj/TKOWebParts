# tkoWebPart
Image slider web part for SharePoint on premises or online using Typescript and KnockoutJs.

Code for "Customizing SharePoint with Knockout and TypeScript" at #SPSHOU, #SPSChigagoBurbs, #SPSDC, #SPSAtlanta

Steps to setup:

- Setup NodeJs, npm and Visual Studio Code as per [Set up your SharePoint client-side web part development environment](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment).  Note: you can skip Yeoman and Gulp.  You can technically use any editor in place of VSCode.
- Install webpack globally: **npm install webpack@2.2.1 -g**
- Install typescript globally: **npm install typescript@2.1.5 -g**
- Install git: https://git-scm.com/
- Clone the project on the command line:
    - change directory to where you want the project
    - **git clone https://github.com/mcsheaj/tkoWebPart.git** (you'll need a github account for this) 1
- Change directory to tkoWebPart and run the following commands to build the project:
    - **npm install**
    - **npm run build**
- copy files in dist up to Style Library/tkoWebPart
- copy everything in the body of index.html to the snippet of a script editor web part (note: if you're not on a host named site collection or the root site collection, you'll need to change the paths to the style library in this source first)

     1 If you don't have a github account or you can't get authentication working, you can alternatively go the the project homepage, find the big green button that says "Clone or Download", and choose "Download Zip".  This will get you a local copy of the project (that is now disconnected from github).

Slides are in the root of the project.


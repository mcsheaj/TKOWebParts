# tkoWebPart
Image slider web part for SharePoint on premises or online using Typescript and KnockoutJs.

Code for "Customizing SharePoint with Knockout and TypeScript" at #SPSHOU

Steps to setup:

- Setup NodeJs, npm and Visual Studio Code as per [Set up your SharePoint client-side web part development environment](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment).  Note: you can skip Yeoman and Gulp.  You can technically use any editor in place of VSCode.
- Install webpack globally: **npm install webpack@2.2.1 -g**
- Install typescript globally: **npm install typescript@2.1.5 -g**
- Install git: https://git-scm.com/
- Clone the project on the command line:
    - change directory to where you want the project
    - **git clone https://github.com/mcsheaj/tkoWebPart.git**
- Change directory to tkoWebPart and run the following commands to build the project:
    - **npm install**
    - **npm run build**
- copy files in dist up to Style Library/tkoWebPart
- copy everything in the body of index.html to the snippet of a script editor web part (note: if you're not on a host named site collection or the root site collection, you'll need to change the paths to the style library in this source first)

Slides are in the root of the project.

I'll write this up a bit better time-permitting


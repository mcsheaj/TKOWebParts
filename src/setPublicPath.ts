// initialize the public path from the sharepoint context
declare var  __webpack_public_path__: string;
let baseUrl = (_spPageContextInfo.siteServerRelativeUrl == "/" ? "" : _spPageContextInfo.siteServerRelativeUrl);
export = __webpack_public_path__ =  baseUrl + "/Style%20Library/tkoWebPart/";

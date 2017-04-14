import * as ko from "knockout";
import { ajax, Options } from '../utils/ajax';

interface Callback {
    (json: any): void;
}

interface Merge {
    Title: string;
    Description: string;
}

export class ImageService {
    listTitle: string;

    constructor(listTitle: string) {
        this.listTitle = listTitle;
    }

    /*
    Upload an images using the SharePoint RESTful web services.
    */
    createImage = (filename: string, buffer: any, callback?: Callback): void => {
        let url = _spPageContextInfo.webAbsoluteUrl +
            "/_api/web/lists/getByTitle('" + this.listTitle + "')" +
            "/RootFolder/Files/add(url='" + filename + "',overwrite='true')" +
            "?" + "@TargetLibrary='" + this.listTitle + "'&@TargetFileName='" + filename + "'";

        ajax({
            method: "PUT",
            url: url,
            headers: {
                'X-RequestDigest': (<HTMLInputElement>document.getElementById("__REQUESTDIGEST")).value,
                "X-HTTP-Method": "MERGE"
            },
            data: buffer,
            success: function (request: XMLHttpRequest, json: any) {
                if (request.status < 200 && request.status >= 400) {
                    alert(request.status + ": " + request.statusText);
                } else {
                    callback(json);
                }
            },
            error: function (request) {
                alert("something bad happened");
            }
        });
    }

    /*
    Read images using the SharePoint RESTful web services.
     */
    readImages = (callback?: Callback): void => {
        let serviceUrl = "/_api/Web/Lists/getByTitle('" + this.listTitle + "')/Items";
        let serviceParams = "$select=FileRef,Title,Description,Id,Created,Modified,GUID";

        ajax({
            url: _spPageContextInfo.webAbsoluteUrl + serviceUrl + "?" + serviceParams,
            async: false,
            success: (request: XMLHttpRequest, json: any) => {
                if (request.status < 200 && request.status >= 400) {
                    alert(request.status + ": " + request.statusText);
                } else if (json && json.error && json.error.message && json.error.message.value) {
                    alert(json.error.message.value);
                } else {
                    callback(json.d.results);
                }
            },
            error: (request: XMLHttpRequest, json: any) => {
                alert("something bad happened");
            }
        });
    }

    /*
    Update the title/description using the SharePoint RESTful web services.
    */
    updateImage = (id: number, merge: any, callback?: Callback): void => {
        let serviceUrl = "/_api/Web/Lists/getByTitle('" + this.listTitle + "')/Items(" + id + ")";
        let url = _spPageContextInfo.webAbsoluteUrl + serviceUrl;
        let digest = (<HTMLInputElement>document.getElementById("__REQUESTDIGEST")).value;

        merge.__metadata = { type: "SP.Data.PicturesItem" };

        ajax({
            method: "MERGE",
            url: url,
            headers: {
                "content-Type": "application/json;odata=verbose",
                "X-RequestDigest": digest,
                "X-HTTP-Method": "MERGE",
                "IF-MATCH": "*"
            },
            data: JSON.stringify(merge),
            success: function (request: XMLHttpRequest, json: any) {
                if (request.status < 200 && request.status > 400) {
                    alert(request.status + ": " + request.statusText);
                } else if (json && json.error && json.error.message && json.error.message.value) {
                    alert(json.error.message.value);
                }
                else {
                    callback(json);
                }
            },
            error: function (request) {
                alert("something bad happened");
            }
        });
    }

    /*
    Delete an image using SharePoint RESTful web services.
     */
    deleteImage = (serverRelativeUrl: string, callback?: Callback): void => {
        let serviceUrl = "/_api/Web/getFileByServerRelativeUrl('" + serverRelativeUrl + "')";
        let url = _spPageContextInfo.webAbsoluteUrl + serviceUrl;
        let digest = (<HTMLInputElement>document.getElementById("__REQUESTDIGEST")).value;

        ajax({
            method: "DELETE",
            url: url,
            headers: {
                "X-RequestDigest": digest,
                "X-HTTP-Method": "DELETE"
            },
            success: function (request: XMLHttpRequest, json: any) {
                if (request.status < 200 && request.status > 400) {
                    alert(request.status + ": " + request.statusText);
                } else if (json && json.error && json.error.message && json.error.message.value) {
                    alert(json.error.message.value);
                } else {
                    callback(json);
                }
            },
            error: function (request: XMLHttpRequest, json: any) {
                alert("something bad happened");
            }
        });
    }
}

import * as ko from "knockout";
import { fetchx } from "../utils/fetchx";

interface Callback {
    (json: any): void;
}

interface Merge {
    Title: string;
    Description: string;
}

export class ImageService {
    webUrl: string;
    digest: string;

    /*
    Instantiate per list, save the list entity type full name for updates.
    */
    constructor(public listTitle: string) {
        this.webUrl = _spPageContextInfo.webAbsoluteUrl;
        this.digest = (<HTMLInputElement>document.getElementById("__REQUESTDIGEST")).value;
    }

    /*
    Upload an images using the SharePoint RESTful web services.
    */
    createImage = (filename: string, buffer: any, callback?: Callback): void => {
        let service = `${this.webUrl}/_api/web/lists/getByTitle('${this.listTitle}')/RootFolder/Files/add(url='${filename}',overwrite='true')`;
        let query = `$expand=ListItemAllFields&@TargetLibrary='${this.listTitle}'&@TargetFileName='${filename}'`;

        fetchx(`${service}?${query}`, {
            method: "POST",
            headers: {
                "accept": "application/json;odata=nometadata",
                "X-RequestDigest": this.digest
            },
            body: buffer
        }).then((json) => {
            callback(json);
        }).catch((error) => {
            alert(error);
        });
    }

    /*
    Read images using the SharePoint RESTful web services.
     */
    readImages = (callback?: Callback): void => {
        let service = `${this.webUrl}/_api/Web/Lists/getByTitle('${this.listTitle}')/Items`;
        let query = "$select=FileRef,Title,Description,Id,Created,Modified,GUID";

        fetchx(`${service}?${query}`, {
            headers: {
                "accept": "application/json;odata=nometadata"
            }
        }).then((json) => {
            callback(json.value);
        }).catch((error) => {
            alert(error);
        });
    }

    /*
    Update the title/description using the SharePoint RESTful web services.
    */
    updateImage = (id: number, merge: any, callback?: Callback): void => {
        let serviceUrl = `/_api/Web/Lists/getByTitle('${this.listTitle}')/Items(${id})`;
        let url = _spPageContextInfo.webAbsoluteUrl + serviceUrl;
        let digest = (<HTMLInputElement>document.getElementById("__REQUESTDIGEST")).value;
        fetchx(url, {
            method: "POST",
            headers: {
                "accept": "application/json;odata=nometadata",
                "content-Type": "application/json;odata=nometadata",
                "X-RequestDigest": this.digest,
                "X-HTTP-Method": "MERGE",
                "IF-MATCH": "*"
            },
            body: JSON.stringify(merge),
        }).then(function () {
            callback(null);
        }).catch(function (error) {
            alert(error);
        });
    }

    /*
    Delete an image using SharePoint RESTful web services.
     */
    deleteImage = (serverRelativeUrl: string, callback?: Callback): void => {
        let serviceUrl = `/_api/Web/getFileByServerRelativeUrl('${serverRelativeUrl}')`;
        let url = _spPageContextInfo.webAbsoluteUrl + serviceUrl;

        fetchx(url, {
            method: "DELETE",
            headers: {
                "X-RequestDigest": this.digest,
                "X-HTTP-Method": "DELETE"
            }
        }).then(function () {
            callback(null);
        }).catch(function (error) {
            alert(error);
        });
    }
}

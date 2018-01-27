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

    /*
    Instantiate per list, save the list entity type full name for updates.
    */
    constructor(public listTitle: string, public webUrl?: string) {
        this.webUrl = (this.webUrl ? this.webUrl : _spPageContextInfo.webAbsoluteUrl);
    }

    /*
    Upload an images using the SharePoint RESTful web services.
    */
    createImage = (filename: string, buffer: any, callback: Callback): void => {
        let service = `${this.webUrl}/_api/web/lists/getByTitle('${this.listTitle}')/RootFolder/Files/add(url='${filename}',overwrite='true')`;
        let query = `$expand=ListItemAllFields&@TargetLibrary='${this.listTitle}'&@TargetFileName='${filename}'`;

        fetchx(`${service}?${query}`, { method: "POST", body: buffer }).then((json) => {
            callback(json);
        }).catch((error) => {
            alert(error);
        });
    }

    /*
    Read images using the SharePoint RESTful web services.
     */
    readImages = (callback: Callback): void => {
        let service = `${this.webUrl}/_api/Web/Lists/getByTitle('${this.listTitle}')/Items`;
        let query = "$filter=startswith(ContentTypeId,'0x0101')&$select=Id,FileRef,Title,Description";

        fetchx(`${service}?${query}`).then((json) => {
            callback(json.value);
        }).catch((error) => {
            alert(error);
        });
    }

    /*
    Update the title/description using the SharePoint RESTful web services.
    */
    updateImage = (id: number, merge: any, callback?: Callback): void => {
        let url = `${this.webUrl}/_api/Web/Lists/getByTitle('${this.listTitle}')/Items(${id})`;
        
        fetchx(url, { method: "MERGE", body: JSON.stringify(merge) }).then(function () {
            if(callback) callback(null);
        }).catch(function (error) {
            alert(error);
        });
    }

    /*
    Delete an image using SharePoint RESTful web services.
     */
    deleteImage = (serverRelativeUrl: string, callback?: Callback): void => {
        let url = `${this.webUrl}/_api/Web/getFileByServerRelativeUrl('${serverRelativeUrl}')`;

        fetchx(url, { method: "DELETE" }).then(function () {
            if(callback) callback(null);
        }).catch(function (error) {
            alert(error);
        });
    }
}

import * as ko from "knockout";
import { fetchx } from "../utils/fetchx";

interface Callback {
    (json: any): void;
}

export class LibraryService {

    /*
    Instantiate per list, save the list entity type full name for updates.
    */
    constructor(public listTitle: string, public select: string, public webUrl?: string) {
        this.webUrl = (this.webUrl ? this.webUrl : _spPageContextInfo.webAbsoluteUrl);
    }

    /*
    Upload a document using the SharePoint RESTful web services.
    */
    createDocument = (filename: string, buffer: any, callback: Callback): void => {
        let service = `${this.webUrl}/_api/web/lists/getByTitle('${this.listTitle}')/RootFolder/Files/add(url='${filename}',overwrite='true')`;
        let query = `$expand=ListItemAllFields&@TargetLibrary='${this.listTitle}'&@TargetFileName='${filename}'`;

        fetchx(`${service}?${query}`, { method: "POST", body: buffer }).then((json) => {
            callback(json);
        }).catch((error) => {
            alert(error);
        });
    }

    /*
    Read documents using the SharePoint RESTful web services.
     */
    readDocuments = (callback: Callback): void => {
        let service = `${this.webUrl}/_api/Web/Lists/getByTitle('${this.listTitle}')/Items`;
        let query = `$filter=startswith(ContentTypeId,'0x0101')&$select=${this.select}`;

        fetchx(`${service}?${query}`).then((json) => {
            callback(json.value);
        }).catch((error) => {
            alert(error);
        });
    }

    /*
    Update the title (and other fields) of a document using the SharePoint RESTful web services.
    */
    updateDocument = (id: number, merge: any, callback?: Callback): void => {
        let url = `${this.webUrl}/_api/Web/Lists/getByTitle('${this.listTitle}')/Items(${id})`;
        
        fetchx(url, { method: "MERGE", body: JSON.stringify(merge) }).then(function () {
            if(callback) callback(null);
        }).catch(function (error) {
            alert(error);
        });
    }

    /*
    Delete an document using SharePoint RESTful web services.
     */
    deleteDocument = (serverRelativeUrl: string, callback?: Callback): void => {
        let url = `${this.webUrl}/_api/Web/getFileByServerRelativeUrl('${serverRelativeUrl}')`;

        fetchx(url, { method: "DELETE" }).then(function () {
            if(callback) callback(null);
        }).catch(function (error) {
            alert(error);
        });
    }
}

import * as ko from "knockout";
import { LibraryService } from "../api/libraryService";
import { protectedObservable, KnockoutProtectedObservable } from "../ko/protectedObservable";
import { Widget } from "../ko/widgetSettingsBinding";

// field structure for the web part configuration
export interface Field {
    name: string;
    displayName: string;
    type: string;
}

// web part configuration
export interface EditorConfig {
    listTitle: string;
    interval: number;
    otherFields: Field[];
}

// model for a single document
export interface Document {
    Id: number;
    FileRef: string;
    Url: string;
    Title: KnockoutProtectedObservable<string>;
    [name: string]: any;
}

/*
View model for the library editor
*/
export class LibraryEditorViewModel implements Widget {
    webPartId: string;
    documents: KnockoutObservableArray<Document>;
    selected: KnockoutObservable<number>;

    // dialog observables
    addDialog: KnockoutObservable<boolean>;
    editDialog: KnockoutObservable<boolean>;
    deleteDialog: KnockoutObservable<boolean>;
    editSettings: KnockoutObservable<boolean>;

    // manage settings
    listTitle: KnockoutProtectedObservable<string>;
    interval: KnockoutProtectedObservable<number>;
    otherFields: KnockoutProtectedObservable<string>;

    // state
    hasConfigChanged: KnockoutObservable<boolean>;
    isInEditMode: KnockoutObservable<boolean>;

    isInitialized: KnockoutObservable<boolean>;

    // computed
    hasList: any;
    hasDocuments: any;
    needToSave: any;
    showAddMessage: any;
    showMenu: any;
    currentDocument: any;

    service: LibraryService;

    timerId: number = 0;

    /*
    Load the documents from the source library into the model.
    */
    constructor(id: string, public config: EditorConfig) {
        // initialize members
        this.webPartId = id;
        let select: string = "Id,FileRef,Title";
        config.otherFields.forEach(field => select += "," + field.name );
        this.service = new LibraryService(this.config.listTitle, select);


        // initialize observables
        this.documents = ko.observableArray([]);
        this.selected = ko.observable(0);

        // initialize settings observables
        this.listTitle = protectedObservable(config.listTitle);
        this.interval = protectedObservable(config.interval);
        this.otherFields = protectedObservable(JSON.stringify(config.otherFields, null, 4));
        this.hasConfigChanged = ko.observable(false);

        // initialize state observables
        this.isInEditMode = ko.observable(false);
        this.isInitialized = ko.observable(false);

        // initialize dialog observables
        this.addDialog = ko.observable(false);
        this.editDialog = ko.observable(false);
        this.deleteDialog = ko.observable(false);
        this.editSettings = ko.observable(false);

        // read in documents and push them to this.documents
        this.readDocuments();

        this.hasList = ko.computed(() => {
            let result = false;
            if (this.listTitle().length > 0) {
                result = true;
            }
            return result;
        });

        this.hasDocuments = ko.computed(() => {
            let result = false;
            if (this.documents().length > 0) {
                result = true;
            }
            return result;
        });

        this.currentDocument = ko.computed((): any => {
            let dummy: any = {
                Title: "",
            };
            this.config.otherFields.forEach(field => dummy[field.name] = "" );            
            return this.documents().length > 0 && this.selected() >= 0 ? this.documents()[this.selected()] : dummy;
        });

        // start scrolling documents
        this.mouseOut();
    }

    /*
    Callback for FileDropzone binding.  Create a new document in the source library from data passed 
    from the drop zone binding, and add it to the model. 
    */
    createDocument = (filename: string, buffer: any, complete: () => any): void => {
        if (this.listTitle().length === 0) {
            return;
        }

        this.service.createDocument(filename,
            buffer,
            (json: any) => {
                if (json.TimeCreated === json.TimeLastModified) {
                    // construct the new document
                    let document = <Document>{
                        Id: json.ListItemAllFields.Id,
                        Url: _spPageContextInfo.webServerRelativeUrl + this.config.listTitle + "/" + filename,
                        Title: protectedObservable(""),
                        FileRef: _spPageContextInfo.webServerRelativeUrl +
                            this.config.listTitle + "/" + filename
                    };
                    this.config.otherFields.forEach(field => document[field.name] = protectedObservable("") );                    

                    // push it to the array
                    this.documents.push(document);
                }

                // tell the drop zone we're finished
                complete();
            });
    }

    /*
    Callback for FileDropzone binding.  Close the add dialog when all files have been uploaded.
    */
    uploadComplete = (): void => {
        this.toggleDialog(this.addDialog);
    }

    /*
    Read all documents from the source library and push them to the model.
    */
    readDocuments = (): void => {
        if (this.listTitle().length === 0) {
            this.isInitialized(true);
            return;
        }

        this.service.readDocuments(
            (json: any) => {
                let tmp: any[] = [];
                for (let i = 0; i < json.length; i++) {
                    // get the current result
                    let current = json[i];

                    // convert the result to an document model.
                    current.Url = ko.observable(current.FileRef);
                    current.Title = protectedObservable(current.Title);
                    this.config.otherFields.forEach(field => current[field.name] = protectedObservable(current[field.name]) );

                    // push it onto the array
                    tmp.push(current);
                }
                if (tmp.length > 0) {
                    // reconstruct the observable array from scratch (faster than
                    // repeatedly pushing)
                    this.documents.valueWillMutate();
                    ko.utils.arrayPushAll(this.documents, tmp);
                    this.documents.valueHasMutated();

                    // select the first document
                    this.selected(0);
                }
                this.isInitialized(true);
            });
    }

    /*
    Update the title and other fields of the current document in the source library.
    */
    updateDocument = (commit: boolean): void => {
        if (this.documents().length === 0) {
            return;
        }

        let current = this.documents()[this.selected()];
        if (commit) {
            let merge: any = { Title: current.Title() };
            this.config.otherFields.forEach(field => merge[field.name] = current[field.name]() );

            // save to SharePoint
            this.service.updateDocument(current.Id,
                merge,
                (json: any) => {
                    // overwrite the reset state
                    current.Title.commit();
                    this.config.otherFields.forEach(field => current[field.name].commit() );
                });
        }
        else {
            // reset the observables
            current.Title.reset();
            this.config.otherFields.forEach(field => current[field.name].reset() );
        }

        this.toggleDialog(this.editDialog);
    }

    /*
    Delete the currently displayed document from the source library and the model.
    */
    deleteDocument = (): void => {
        if (this.documents().length === 0) {
            return;
        }

        let index = this.selected();
        this.service.deleteDocument(
            this.documents()[index].FileRef, (json: any) => {
                // get the previous document index
                let newIndex = index > 0 ? index - 1 : this.documents().length - 2;

                this.selected(-1);

                // remove the deleted index from the model
                let deleted = this.documents.splice(index, 1);

               // select the previous index
               this.selected(newIndex);

               // close the dialog
                this.toggleDialog(this.deleteDialog);
            });
    }

    /*
    Select and document by 0 based index.
    */
    select = (index: number): void => {
        this.selected(index);
    }

    /*
    Callback for the web part settings dialog to initiate update.
    */
    settings = (commit: boolean): void => {
        if (commit) {
            if (this.listTitle.hasChanged() || this.interval.hasChanged() || this.otherFields.hasChanged()) {
                this.hasConfigChanged(true);
                this.listTitle.commit();
                this.interval.commit();
                this.otherFields.commit();
            }
        }
        else {
            this.listTitle.reset();
            this.interval.reset();
            this.otherFields.reset();
        }
        this.editSettings(false);
    }

    /*
    Callback for widgetSettingsBinding, to get view model specific configuration as
    a JSON string in order to persist it.
    */
    persistConfig = (): string => {
        this.config.listTitle = this.listTitle();
        this.config.interval = this.interval();
        this.config.otherFields = JSON.parse(this.otherFields());
        return JSON.stringify(this.config);
    }

    /*
    Stop scrolling documents until not hovering.
    */
    mouseOver = (): void => {
        if (this.timerId > 0) {
            clearInterval(this.timerId);
            this.timerId = 0;
        }
    }

    /*
    Start scrolling documents unless interval equals zero.
     */
    mouseOut = (): void => {
        if (this.timerId === 0 && this.config.interval > 0) {
            this.timerId = setInterval(() => {
                if (this.selected() + 1 >= this.documents().length) {
                    this.selected(0);
                }
                else {
                    this.selected(this.selected() + 1);
                }
            }, this.config.interval);
        }
    }

    /*
    Helper callback to launch one of the dialogs.
    */
    toggleDialog = (dialog: KnockoutObservable<boolean>): void => {
        dialog(!dialog());
    }
}
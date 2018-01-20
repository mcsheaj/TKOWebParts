import * as ko from "knockout";
import { ImageService } from "../api/imageService";
import { protectedObservable, KnockoutProtectedObservable } from "../ko/protectedObservable";
import { Widget } from "../ko/widgetSettingsBinding";

// web part configuration
export interface SliderConfig {
    listTitle: string;
    interval: number;
}

// model for a single image.
export interface Image {
    Url: string;
    Title: KnockoutProtectedObservable<string>;
    Description: KnockoutProtectedObservable<string>;
    Id: number;
    FileRef: string;
}

/*
View model for the image slider.
*/
export class ImageSliderViewModel implements Widget {
    webPartId: string;
    images: KnockoutObservableArray<Image>;
    selected: KnockoutObservable<number>;

    // dialog observables
    addDialog: KnockoutObservable<boolean>;
    editDialog: KnockoutObservable<boolean>;
    deleteDialog: KnockoutObservable<boolean>;
    editSettings: KnockoutObservable<boolean>;

    listTitle: KnockoutProtectedObservable<string>;
    interval: KnockoutProtectedObservable<number>;
    configChanged: KnockoutObservable<boolean>;
    inEditMode: KnockoutObservable<boolean>;

    //slider: Slider;
    service: ImageService;

    timerId: number = 0;

    /*
    Load the images from the source library into the model.
    */
    constructor(id: string, public config: SliderConfig) {
        // initialize members
        this.webPartId = id;
        this.service = new ImageService(this.config.listTitle);

        // initialize observables
        this.images = ko.observableArray([]);
        this.selected = ko.observable(0);

        // initialize settings observables
        this.listTitle = protectedObservable(config.listTitle);
        this.interval = protectedObservable(config.interval);
        this.configChanged = ko.observable(false);
        this.inEditMode = ko.observable(false);

        // initialize dialog observables
        this.addDialog = ko.observable(false);
        this.editDialog = ko.observable(false);
        this.deleteDialog = ko.observable(false);
        this.editSettings = ko.observable(false);

        // read in images and push them to this.images
        this.readImages();

        // start scrolling images
        this.mouseOut();
    }

    /*
    Callback for FileDropzone binding.  Create a new image in the source library from data passed 
    from the drop zone binding, and add it to the model. 
    */
    createImage = (filename: string, buffer: any, complete: () => any): void => {
        this.service.createImage(filename,
            buffer,
            (json: any) => {
                if (json.TimeCreated === json.TimeLastModified) {
                    // construct the new image
                    let image = <Image>{
                        Id: json.ListItemAllFields.Id,
                        Url: _spPageContextInfo.webServerRelativeUrl + this.config.listTitle + "/" + filename,
                        Title: protectedObservable(""),
                        Description: protectedObservable(""),
                        FileRef: _spPageContextInfo.webServerRelativeUrl +
                            this.config.listTitle + "/" + filename
                    };

                    // push it to the array
                    this.images.push(image);
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
    Read all images from the source library and push them to the model.
    */
    readImages = (): void => {
        this.service.readImages(
            (json: any) => {
                let tmp: any[] = [];
                for (let i = 0; i < json.length; i++) {
                    // get the current result
                    let current = json[i];

                    // convert the result to an image model.
                    current.Url = ko.observable(current.FileRef);
                    current.Title = protectedObservable(current.Title);
                    current.Description = protectedObservable(current.Description);

                    // push it onto the array
                    tmp.push(current);
                }
                if (tmp.length > 0) {
                    // reconstruct the observable array from scratch (faster than
                    // repeatedly pushing)
                    this.images.valueWillMutate();
                    ko.utils.arrayPushAll(this.images, tmp);
                    this.images.valueHasMutated();

                    // select the first image
                    this.selected(0);
                }
            });
    }

    /*
    Update the title/description of the current image in the source library.
    */
    updateImage = (): void => {
        let current = this.images()[this.selected()];
        this.service.updateImage(current.Id,
            { Title: current.Title(), Description: current.Description() },
            (json: any) => {
                // overwrite the reset state
                current.Title.commit();
                current.Description.commit();

                // close the dialog
                this.toggleDialog(this.editDialog);
            });
    }

    /*
    Reset the model for the current image to it's original state, discarding
    any changes.
    */
    resetImage = (): void => {
        let current = this.images()[this.selected()];

        // reset the observables
        current.Title.reset();
        current.Description.reset();

        this.toggleDialog(this.editDialog);
    }

    /*
    Delete the currently displayed image from the source library and the model.
    */
    deleteImage = (): void => {
        let index = this.selected();
        this.service.deleteImage(
            this.images()[index].FileRef, (json: any) => {
                // select the previous image
                this.selected(index > 0 ? index - 1 : this.images().length - 2);

                // remove the deleted index from the model
                let deleted = this.images.splice(index, 1);

                // close the dialog
                this.toggleDialog(this.deleteDialog);
            });
    }

    /*
    Select and image by 0 based index.F
    */
    select = (index: number): void => {
        this.selected(index);
    }

    /*
    Helper callback to launch one of the dialogs.
    */
    toggleDialog = (dialog: KnockoutObservable<boolean>): void => {
        dialog(!dialog());
    }

    settings = (update: boolean): void => {
        if (update) {
            if (this.listTitle.hasChanged() || this.interval.hasChanged()) {
                this.configChanged(true);
                this.listTitle.commit();
                this.interval.commit();
            }
        }
        else {
            this.listTitle.reset();
        }
        this.editSettings(false);
    }

    persistentConfig = (): string => {
        this.config.listTitle = this.listTitle();
        this.config.interval = this.interval();
        return JSON.stringify(this.config);
    }

    mouseOver = (): void => {
        if(this.timerId > 0) {
            clearInterval(this.timerId);
            this.timerId = 0;
        }
    }

    mouseOut = (): void => {
        if (this.timerId === 0 && this.config.interval > 0) {
            this.timerId = setInterval(() => {
                if (this.selected() + 1 >= this.images().length) {
                    this.selected(0);
                }
                else {
                    this.selected(this.selected() + 1);
                }
            }, this.config.interval);
        }
    }
}
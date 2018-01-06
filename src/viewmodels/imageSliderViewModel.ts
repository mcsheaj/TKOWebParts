import '../css/slider.scss';
import '../css/sliderButton.scss';
import '../css/sliderDialog.scss';
import '../css/sliderDropzone.scss';

import * as ko from "knockout";
import { ImageService } from '../api/imageService';
import { Slider } from '../utils/slider';
import { FileDropzone, CompleteCallback } from '../utils/fileDropzone';
import { protectedObservable, KnockoutProtectedObservable } from './protectedObservable';

// web part configuration
export interface SliderConfig {
    listTitle: string;
}

// model for a single image.
export interface Image {
    Url: KnockoutObservable<string>;
    Title: KnockoutProtectedObservable<string>;
    Description: KnockoutProtectedObservable<string>;
    Id: number;
    FileRef: string;
    OriginalTitle: string;
    OriginalDescription: string;
}

/*
View model for the image slider.
*/
export class ImageSliderViewModel {
    webPartId: KnockoutObservable<string>;
    images: KnockoutObservableArray<Image>;
    selected: KnockoutObservable<Image>;

    slider: Slider;
    dropzone: FileDropzone;
    service: ImageService;
    nextIndex: number = 0;

    /*
    Load the images from the source library into the model.
    */
    constructor(id: string, public config: SliderConfig) {
        // initialize members
        this.images = ko.observableArray([]);
        this.webPartId = ko.observable(id);
        this.images = ko.observableArray([]);
        this.service = new ImageService(this.config.listTitle);
        this.selected = ko.observable(<Image>{
            Url: ko.observable(""),
            Title: ko.observable(""),
            Description: ko.observable(""),
            FileRef: ""
        });

        // read in images and push them to this.images
        this.readImages();

        // initialize the drop zone for adding images
        this.dropzone = new FileDropzone({
            root: document.getElementById(this.webPartId()),
            selector: ".dragandrophandler",
            fileCallback: this.createImage
        });
    }

    /*
    The slider needs to be fully formed in the DOM before it can be
    initialized.
    */
    applySlider = (): void => {
        this.slider = new Slider(
            document.getElementById(this.webPartId()),
            ".slider",
            this.nextIndex);
    }

    /*
    Create a new image in the source library from data passed from the drop
    zone, and add it to the model.
    */
    createImage = (filename: string, buffer: any, complete: CompleteCallback): void => {
        this.service.createImage(filename,
            buffer,
            (json: any) => {
                if (json.d.TimeCreated === json.d.TimeLastModified) {
                    // construct the new image
                    let image = <Image>{
                        Id: json.d.ListItemAllFields.Id,
                        Url: ko.observable(_spPageContextInfo.webServerRelativeUrl +
                            this.config.listTitle + "/" + filename),
                        Title: protectedObservable(""),
                        Description: protectedObservable(""),
                        FileRef: _spPageContextInfo.webServerRelativeUrl +
                        this.config.listTitle + "/" + filename
                    };

                    this.nextIndex = -1;

                    // push it to the array
                    this.images.push(image);
                }

                // tell the drop zone we're finished
                complete();
            });
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
                    current.OriginalTitle = current.Title;
                    current.OriginalDescription = current.Description;
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
                    this.selected(this.images()[0]);
                }
            });
    }

    /*
    Update the title/description of the current image in the source library.
    */
    updateImage = (): void => {
        let index = this.slider.getSelectedIndex();
        let current = this.images()[index];
        this.service.updateImage(current.Id,
            { Title: current.Title(), Description: current.Description() },
            (json: any) => {
                // overwrite the reset state
                current.Title.commit();
                current.Description.commit();

                // close the dialog
                this.toggleDialog(".editSliderImage");
            });
    }

    /*
    Reset the model for the current image to it's original state, discarding
    any changes.
    */
    resetImage = (): void => {
        let index = this.slider.getSelectedIndex();
        let current = this.images()[index];
        current.Title.reset();
        current.Description.reset();
        this.toggleDialog(".editSliderImage");
    }

    /*
    Delete the currently displayed image from the source library and the model.
    */
    deleteImage = (): void => {
        let index = this.slider.getSelectedIndex();
        this.service.deleteImage(
            this.images()[index].FileRef, (json: any) => {
                // remove the deleted index from the model
                let deleted = this.images.splice(index, 1);

                // re-initialize the slider
                this.slider.init(index - 1);

                // close the dialog
                this.toggleDialog(".deleteSliderImage");
            });
    }

    /*
    Helper callback to launch one of the dialogs.
    */
    toggleDialog = (dialogSelector: string): void => {
        let index = this.slider.getSelectedIndex();
        let root = document.getElementById(this.webPartId());
        let dialog = <HTMLElement>root.querySelector(dialogSelector);
        if (dialog.className.indexOf("show") < 0) {
            if (this.images().length > 0) {
                this.selected(this.images()[index]);
            }
            dialog.classList.add("show");
        }
        else {
            dialog.classList.remove("show");
        }
    }
}

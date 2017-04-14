import '../css/slider.scss';
import '../css/sliderButton.scss';
import '../css/sliderDialog.scss';
import '../css/sliderDropzone.scss';

import * as ko from "knockout";
import { ajax, Options } from '../utils/ajax';
import { ImageService } from '../api/imageService';
import { Slider } from '../utils/slider';
import { FileDropzone, CompleteCallback } from '../utils/fileDropzone';

// web part configuration
export interface SliderConfig {
    listTitle: string;
}

// model for a single image.
export interface Image {
    Url: KnockoutObservable<string>;
    Title: KnockoutObservable<string>;
    Description: KnockoutObservable<string>;
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
    config: SliderConfig;

    service: ImageService;

    /*
    Load the images from the source library into the model.
    */
    constructor(id: string, config: SliderConfig) {
        // initialize members
        this.config = config;
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
            ".slider");
    }

    /*
    Create a new image in the source library from data passed from the drop
    zone, and add it to the model.
    */
    createImage = (filename: string,
        buffer: any,
        complete: CompleteCallback): void => {
        this.service.createImage(filename,
            buffer,
            (json: any) =>{
                // construct the new image
                let image = <Image>{
                    Url: ko.observable(_spPageContextInfo.webServerRelativeUrl +
                        this.config.listTitle + "/" + filename),
                    Title: ko.observable(""),
                    Description: ko.observable(""),
                    FileRef: _spPageContextInfo.webServerRelativeUrl +
                    this.config.listTitle + "/" + filename
                };

                // push it to the array
                this.images.push(image);

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
                    current.Title = ko.observable(current.Title);
                    current.Description = ko.observable(current.Description);

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
                current.OriginalTitle = current.Title();
                current.OriginalDescription = current.Description();

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
        current.Title(current.OriginalTitle);
        current.Description(current.OriginalDescription);
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
                this.slider.init();

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
        if (this.images().length > 0) {
            this.selected(this.images()[index]);
        }
        if (dialog.className.indexOf("show") < 0) {
            dialog.className = dialog.className + " show";
        }
        else {
            let expression = new RegExp(" show", "g");
            dialog.className = dialog.className.replace(expression, "");
        }
    }
}

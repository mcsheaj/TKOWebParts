import * as ko from "knockout";
import { toggleDialog } from "./toggleDialogBinding";
import { slider } from "./sliderBinding";
import { fileDropzone } from "./fileDropzoneBinding";
import { widgetSettings } from "./widgetSettingsBinding";

export const initBindingHandlers = () => {
    ko.bindingHandlers.toggleDialog = toggleDialog;
    ko.bindingHandlers.slider = slider;
    ko.bindingHandlers.fileDropzone = fileDropzone;
    ko.bindingHandlers.widgetSettings = widgetSettings;
};


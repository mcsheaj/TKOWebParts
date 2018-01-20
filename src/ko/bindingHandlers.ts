import * as ko from "knockout";
import { toggleDialog } from "./toggleDialogBinding";
import { slide } from "./slideBinding";
import { fileDropzone } from "./fileDropzoneBinding";
import { widgetSettings } from "./widgetSettingsBinding";

export const initBindingHandlers = () => {
    ko.bindingHandlers.toggleDialog = toggleDialog;
    ko.bindingHandlers.slide = slide;
    ko.bindingHandlers.fileDropzone = fileDropzone;
    ko.bindingHandlers.widgetSettings = widgetSettings;
};


import * as ko from "knockout";
import { toggleDialog } from "./toggleDialogBinding";
import { slide } from "./slideBinding";
import { fileDropzone } from "./fileDropzoneBinding";

export const initBindingHandlers = () => {
    ko.bindingHandlers.toggleDialog = toggleDialog;
    ko.bindingHandlers.slide = slide;
    ko.bindingHandlers.fileDropzone = fileDropzone;
};


import * as ko from "knockout";
import { toggleDialog } from "./toggleDialogBinding";
import { slide } from "./slideBinding";

export const initBindingHandlers = () => {
    ko.bindingHandlers.toggleDialog = toggleDialog;
    ko.bindingHandlers.slide = slide;
};


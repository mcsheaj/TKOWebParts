import * as ko from "knockout";
import {toggleDialog} from './toggleDialogBindingHandler';

export const initBindingHandlers = () => {
    ko.bindingHandlers.toggleDialog = toggleDialog;
}


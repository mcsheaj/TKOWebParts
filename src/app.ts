import "./css/documentViewer.scss";
import "./css/button.scss";
import "./css/slider.scss";
import "./css/dialog.scss";
import "./css/dropzone.scss";

import "es6-promise/auto";
import * as ko from "knockout";
import { LibraryEditorViewModel, EditorConfig } from "./viewmodels/libraryEditorViewModel";
import { initBindingHandlers } from "./ko/bindingHandlers";

initBindingHandlers();

function getWebPartId(elem: Element): string {
    if(elem.id.indexOf("WebPart") === 0) return elem.id;
    else if(elem.parentElement === null) return "";
    else return getWebPartId(elem.parentElement);
}

let tkoWebPart = {

    libraryEditor: {
        init: function (elem: Element, json: string): void {
            let config = <EditorConfig>JSON.parse(json);
            let webPartId = getWebPartId(elem);
            let webPart = document.getElementById(webPartId);
            ko.applyBindings(new LibraryEditorViewModel(webPartId, config), webPart);
        }
    },

};

export = tkoWebPart;

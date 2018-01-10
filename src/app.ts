import "./css/styles.scss";

import * as ko from "knockout";
import { ImageSliderViewModel, SliderConfig } from "./viewmodels/imageSliderViewModel";
import { Slider } from "./utils/slider";
import { toggleDialog } from "./ko/bindingHandlers";

ko.bindingHandlers.toggleDialog = toggleDialog;

function getWebPartId(elem: Element): string {
    if(elem.id.indexOf("WebPart") === 0) return elem.id;
    else if(elem.parentElement === null) return "";
    else return getWebPartId(elem.parentElement);
}

let tkoWebPart = {

    imageSlider: {
        init: function (elem: Element, json: string): void {
            let config = <SliderConfig>JSON.parse(json);
            ko.applyBindings(new ImageSliderViewModel(getWebPartId(elem), config), elem);
        }
    },

};

export = tkoWebPart;

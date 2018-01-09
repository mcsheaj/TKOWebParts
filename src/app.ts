import "./css/styles.scss";

import * as ko from "knockout";
import { ImageSliderViewModel, SliderConfig } from "./viewmodels/imageSliderViewModel";
import { Slider } from "./utils/slider";
import { toggleDialog } from "./ko/bindingHandlers";

ko.bindingHandlers.toggleDialog = toggleDialog;

let tkoWebPart = {

    imageSlider: {
        init: function (elem: Element, json: string) {
            let config = <SliderConfig>JSON.parse(json);
            ko.applyBindings(new ImageSliderViewModel(elem.parentElement.id, config), elem);
        }
    },

};

export = tkoWebPart;

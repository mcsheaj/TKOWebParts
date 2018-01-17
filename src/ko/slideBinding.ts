import * as ko from "knockout";

export const slide = {
    update: (el: HTMLElement, v: () => any, all: any, dep: any, ctx: KnockoutBindingContext) : void => {
        let selected = v();
        if(selected) {
            let wrapper = el.parentElement;
            wrapper.style.left = "-" + el.offsetLeft + "px";
            el.querySelector(".caption").classList.add("visible");
        }
        else {
            el.querySelector(".caption").classList.remove("visible");            
        }
    }
};

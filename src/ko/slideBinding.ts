export const slide = {
    update: (el: HTMLElement, v: () => any) : void => {
        let selected : number = v();
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

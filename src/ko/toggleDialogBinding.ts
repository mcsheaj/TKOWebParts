export const toggleDialog = {
    update: (el:HTMLElement, any, v: () => any) : void => {
        let value = v().toggleDialog;
        if(value) {
            el.classList.add("show");
        }
        else {
            el.classList.remove("show");
        }
    }
};

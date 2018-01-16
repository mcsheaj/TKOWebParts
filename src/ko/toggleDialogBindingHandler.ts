export const toggleDialog = {
    update: (el: any, v: () => any) : void => {
        let value = v();
        if(value) {
            el.classList.add("show");
        }
        else {
            el.classList.remove("show");
        }
    }
};

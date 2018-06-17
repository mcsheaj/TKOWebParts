import * as ko from "knockout";

export interface Widget {
    webPartId: string;
    isInEditMode: KnockoutObservable<boolean>;
    persistConfig(): string;
}

export const widgetSettings = {
    init: (el: any, v: () => any, all: KnockoutAllBindingsAccessor, dep: any, ctx: KnockoutBindingContext): void => {
        let value = v();
        let widget = <Widget>ctx.$root;

        // tell the widget if we're in edit mode
        if(isInEditMode(widget)) {
            widget.isInEditMode(true);
            el.addEventListener("keydown", function(e) {
                e.stopPropagation();
            });
        }

        // hide the edit snippet link
        if (window.location.search.toLowerCase().indexOf("showeditsnippet=true") < 0) {
            let webPart = document.getElementById(widget.webPartId);
            let anchor = <HTMLElement>webPart.querySelector("a[title='Edit Snippet']");
            if (anchor) {
                //anchor.style.display = "none";
            }
        }
    },

    update: (el: any, v: () => any, all: KnockoutAllBindingsAccessor, dep: any, ctx: KnockoutBindingContext): void => {
        let value = v();
        let widget = <Widget>ctx.$root;

        // save the widget's persistent config for save
        saveChanges(widget);

        if (value) {
            let okBtn = document.querySelector("input[name$='AppBtn'],input[name$='OKBtn']");
            if (okBtn) {
                okBtn.addEventListener("click", function () {
                    // save the widget's persistent config again on ok
                    saveChanges(widget);
                }, false);
            }
        }
    }
};

const saveChanges = (widget: Widget): void => {
    let webPart = document.getElementById(widget.webPartId);
    let rte = webPart.querySelector(".ms-rte-embedwp");
    if (rte) {
        let input = <HTMLInputElement>document.getElementById(rte.getAttribute("inputfield"));
        if (input && input.value) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(input.value, "text/html");

            doc.querySelector("script").setAttribute("ww-appConfig", widget.persistConfig());
            input.value = doc.body.outerHTML;
        }
    }
};

const isInEditMode = (widget: Widget): boolean => {
    let win = <any>window;
    let formName = (typeof win.MSOWebPartPageFormName === "string") ? win.MSOWebPartPageFormName : "aspnetForm";
    let form = <any>document.forms[formName];

    // check to see if the form is in edit mode;
    let formInEdit = form && (form.MSOLayout_InDesignMode && form.MSOLayout_InDesignMode.value);
    let wikiInEdit = typeof win.MSOLayout_IsWikiEditMode === "function" && win.MSOLayout_IsWikiEditMode();
    if (formInEdit || wikiInEdit) {

        // get the embeded rich text control for our web part
        let webPart = document.getElementById(widget.webPartId);
        let rte = webPart.querySelector(".ms-rte-embedwp");
        if (rte) {

            // get the name of the hidden input field to update
            let input = rte.getAttribute("inputfield");
            if (input && document.getElementById(input)) {

                // and get the toolpane body for our web part
                let toolpaneBody = document.querySelectorAll("div[class='ms-WPBody']");
                let okBtn = document.querySelector("input[name$='AppBtn'],input[name$='OKBtn']");
                if (toolpaneBody.length > 0 && okBtn) {
                    // if we got all 3, we're in an editable state
                    return true;
                }

            }
        }

    }

    // not currently editable
    return false;
};

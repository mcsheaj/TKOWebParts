// Pure Javascript Slider with Animations - https://codepen.io/gabrieleromanato/pen/pIfoD by Gabriele Romanato
export class Slider {
    root: Element;
    links: NodeListOf<Element>;
    wrapper: HTMLElement;
    selectedIndex: number;

    constructor(webPart: Element, selctor: string, index: number) {
        this.root = webPart.querySelector(selctor);
        this.init(index);
    }

    init(index: number) : void {
        this.links = this.root.parentElement.querySelectorAll(".slider-nav a");
        this.wrapper = <HTMLElement>this.root.querySelector(".slider-wrapper");
        for (let i = 0; i < this.links.length; ++i) {
            let link = this.links[i];
            this.initSlide(link);
        }
        if(index < 0) {
            index = this.links.length + index;
        }
        if(this.links.length > index) {
            (<HTMLElement>this.links[index]).click();
        }
    }

    initSlide(element: Element) : void {
        element.addEventListener("click", (event) => {
            event.preventDefault();
            let a = <Element>event.target;
            this.setCurrentLink(a);
            let index = parseInt(a.getAttribute("data-slide"), 10) + 1;
            let currentSlide = <HTMLElement>this.root.querySelector(".slide:nth-child(" + index + ")");

            this.wrapper.style.left = "-" + currentSlide.offsetLeft + "px";
            this.animate(currentSlide);

        }, false);
    }

    getSelectedIndex() : number {
        return this.selectedIndex;
    }

    animate(slide: HTMLElement) : void {
        let parent = slide.parentElement;
        let caption = slide.querySelector(".caption");
        let captions = parent.querySelectorAll(".caption");
        for (let k = 0; k < captions.length; ++k) {
            let cap = captions[k];
            if (cap !== caption) {
                cap.classList.remove("visible");
            }
        }
        caption.classList.add("visible");
    }

    setCurrentLink(link: Element) : void;
    setCurrentLink(index: number) : void;
    setCurrentLink(input: number | Element) : void {
        let link : Element = null;
        if (typeof input === "number") {
            link = this.root.querySelector("[data-slide='" + input + "']");
        }
        else {
            link = input;
        }

        let parent = link.parentElement;
        this.selectedIndex = Number(link.getAttribute("data-slide"));
        let a = parent.querySelectorAll("a");

        for (let j = 0; j < a.length; ++j) {
            a[j].className = "";
        }

        link.className = "current";
    }
}

/*
Interface for a void:void callback function
*/
interface CompleteCallback {
    (): void;
}

/*
Binding handler
 */
export const fileDropzone = {
    init: (el: HTMLElement, v: () => any) : void => {
        let options = v();
        this.dropzone = new FileDropzone({
            element: el,
            fileCallback: options.processFile,
            completeCallback: options.complete,
        });
    }
};

interface FileDropZoneConfig {
    element: Element;
    fileCallback: (filename: string, buffer: any, complete: CompleteCallback) => void;
    completeCallback: () => void;
}

class FileDropzone {
    element: Element;
    uploading: number;
    fileArray: any[];

    constructor(public config: FileDropZoneConfig) {
        this.element = config.element;
        this.uploading = 0;
        this.fileArray = [];
        if (this.element) {
            this.element.addEventListener("dragover", (e: DragEvent) => {
                e.cancelBubble = true;
                if (e.stopPropagation) { e.stopPropagation(); }
                if (e.preventDefault) { e.preventDefault(); }
                if ((<HTMLElement>e.target).className.indexOf("drag-over") < 0) {
                    (<HTMLElement>e.target).parentElement.classList.add("drag-over");
                }
            });

            this.element.addEventListener("dragleave", (e: DragEvent) => {
                e.cancelBubble = true;
                if (e.stopPropagation) { e.stopPropagation(); }
                if (e.preventDefault) { e.preventDefault(); }
                (<HTMLElement>e.target).parentElement.classList.remove("drag-over");
            });

            this.element.addEventListener("drop", (e: DragEvent) => {
                (<HTMLElement>e.target).parentElement.classList.remove("drag-over");
                if (e.preventDefault) { e.preventDefault(); }
                let files = e.dataTransfer.files;
                this.handleFileUpload(files);
            });
        }
    }

    handleFileUpload(files: FileList) {
        for (let i = 0; i < files.length; i++) {
            this.fileArray.push(files[i]);
        }

        let doUpTo5Files = () => {
            while (this.fileArray.length > 0 && this.uploading < 5) {
                let file = this.fileArray.splice(0, 1);
                this.createImage(file[0]);
            }
        };

        doUpTo5Files();
        if (this.fileArray.length > 0) {
            let id = setInterval(function () {
                if(this.uploading === 0 && this.fileArray.length > 0)
                {
                    doUpTo5Files();
                    if (this.fileArray.length === 0) {
                        clearInterval(id);
                    }
                }
            }, 1000);
        }
    }

    createImage(file: any) {
        let reader = new FileReader();
        reader.onloadend = (evt: any) => {
            let buffer = evt.target.result;

            if (this.uploading == 0) {
                (<HTMLElement>this.element.querySelector(".drag-and-drop-label")).style.display = "none";
                (<HTMLElement>this.element.querySelector(".drag-and-drop-busy")).style.display = "block";
            }
            this.uploading++;

            let decrement = () => {
                this.uploading--;
                if (this.uploading === 0 && this.fileArray.length == 0) {
                    (<HTMLElement>this.element.querySelector(".drag-and-drop-label")).style.display = "block";
                    (<HTMLElement>this.element.querySelector(".drag-and-drop-busy")).style.display = "none";
                    if (this.config.completeCallback) {
                        this.config.completeCallback();
                    }
                }
            };

            this.config.fileCallback(file.name, buffer, decrement);
        };
        reader.readAsArrayBuffer(file);
    }
}


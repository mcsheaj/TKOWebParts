export const fileDropzone = {
    update: (el: HTMLElement, v: () => any) : void => {
        let options = v();
        this.dropzone = new FileDropzone({
            element: el,
            fileCallback: options.processFile,
            completeCallback: options.complete,
        });
    }
};

interface CompleteCallback {
    (): void;
}

interface FileDropZoneConfig {
    element: Element;
    fileCallback: (filename: string, buffer: any, complete: CompleteCallback) => void;
    completeCallback?: () => void;
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
                if ((<HTMLElement>e.target).className.indexOf("dragover") < 0) {
                    (<HTMLElement>e.target).className = (<HTMLElement>e.target).className + " dragover";
                }
            });

            this.element.addEventListener("dragleave", (e: DragEvent) => {
                e.cancelBubble = true;
                if (e.stopPropagation) { e.stopPropagation(); }
                if (e.preventDefault) { e.preventDefault(); }
                (<HTMLElement>e.target).className = (<HTMLElement>e.target).className.replace(/ dragover/g, "");
            });

            this.element.addEventListener("drop", (e: DragEvent) => {
                (<HTMLElement>e.target).className = (<HTMLElement>e.target).className.replace(/ dragover/g, "");
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
                (<HTMLElement>this.element.querySelector(".draganddroplabel")).style.display = "none";
                (<HTMLElement>this.element.querySelector(".draganddropbusy")).style.display = "block";
            }
            this.uploading++;

            let decrement = () => {
                this.uploading--;
                if (this.uploading === 0 && this.fileArray.length == 0) {
                    (<HTMLElement>this.element.querySelector(".draganddroplabel")).style.display = "block";
                    (<HTMLElement>this.element.querySelector(".draganddropbusy")).style.display = "none";
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


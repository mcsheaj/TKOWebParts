// Ravishanker Kusuma - Drag and Drop File Upload jQuery Example - http://hayageek.com/drag-and-drop-file-upload-jquery/
export interface CompleteCallback {
    (): void;
}

export interface FileDropZoneConfig {
    root: Element;
    selector: string;
    fileCallback: (filename: string, buffer: any, complete: CompleteCallback) => void;
    completeCallback?: () => void;
}

export class FileDropzone {
    config: FileDropZoneConfig;
    element: Element;
    uploading: number;

    constructor(config: FileDropZoneConfig) {
        this.config = config;
        this.element = config.root.querySelector(config.selector);
        this.uploading = 0;

        this.element.addEventListener("dragover", (e: DragEvent) => {
            e.cancelBubble = true;
            if (e.stopPropagation) { e.stopPropagation(); }
            if (e.preventDefault) { e.preventDefault(); }
            if((<HTMLElement>e.target).className.indexOf("dragover") < 0) {
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

    handleFileUpload(files: FileList) {
        let fileArray: any[] = [];
        for (let i = 0; i < files.length; i++) {
            fileArray.push(files[i]);
        }

        let doUpTo5Files = () => {
            while (fileArray.length > 0 && this.uploading < 5) {
                let file = fileArray.splice(0, 1);
                this.createImage(file[0]);
            }
        };

        doUpTo5Files();
        if (fileArray.length > 0) {
            let id = setInterval(function () {
                doUpTo5Files();
                if (fileArray.length === 0) {
                    clearInterval(id);
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
                if (!this.uploading) {
                    (<HTMLElement>this.element.querySelector(".draganddroplabel")).style.display = "block";
                    (<HTMLElement>this.element.querySelector(".draganddropbusy")).style.display = "none";
                    if(this.config.completeCallback) {
                        this.config.completeCallback();
                    }
                }
            };

            this.config.fileCallback(file.name, buffer, decrement);
        };
        reader.readAsArrayBuffer(file);
    }
}

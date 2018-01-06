export interface Options {
    async?: boolean;
    method?: string;
    url: string;
    headers?: any;
    data?: any;
    success?: (request: XMLHttpRequest, responseJSON?: any) => void;
    error?: (request: XMLHttpRequest, responseJSON?: any) => void;
}

export function ajax(options: Options) {
    options.method = options.method || "GET";
    options.headers = options.headers || {};
    options.headers.accept = options.headers.accept || "application/json;odata=verbose";
    options.data = options.data || null;
    options.async = typeof (options.async) === "undefined" ? true : options.async;

    let keys = Object.keys(options.headers);
    let request = new XMLHttpRequest();
    request.open(options.method, options.url, options.async);
    for (let i = 0; i < keys.length; i++) {
        request.setRequestHeader(keys[i].replace(/_/g, "-"), options.headers[keys[i]]);
    }

    request.onload = function () {
        if (typeof (options.success) === "function") {
            let responseJSON;
            if (options.headers.accept.indexOf("application/json") > -1 && request.responseText) {
                responseJSON = JSON.parse(request.responseText);
            }
            options.success(request, responseJSON);
        }
    };

    request.onerror = function () {
        if (typeof (options.error) === "function") {
            let responseJSON;
            if (options.headers.accept.indexOf("application/json") > -1 && request.responseText) {
                responseJSON = JSON.parse(request.responseText);
            }
            options.error(request, responseJSON);
        }
    };

    request.send(options.data);
}

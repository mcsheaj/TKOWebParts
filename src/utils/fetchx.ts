import "cross-fetch/polyfill";

declare var UpdateFormDigest: any;
declare var _spFormDigestRefreshInterval: any;

export function fetchx(url: string, init?: any) {
    let acceptSpecified = false;
    init = init || {};

    // all SharePoint operations are going to need this, so let's default.
    init.credentials = "include";

    // turn objects into Headers, also see if we're expecting a json response
    if (init && init.headers && !(init.headers instanceof Headers)) {
        let newHeaders = new Headers();
        for (let key in init.headers) {
            newHeaders.append(key, init.headers[key]);
            if (key.toLowerCase() === "accept") {
                acceptSpecified = true;
            }
        }
        init.headers = newHeaders;
    }

    // create headers if there aren't any because we're going to add a couple
    if(!init.headers) {
        init.headers = new Headers();
    }

    // add accept application/json;odata=nometadata by default
    let headers = <Headers>init.headers;
    if(!headers.has("accept")) {
        init.headers.append("accept", "application/json;odata=nometadata");
    }

    // update the form digest as needed to prevent "The security validation for this page is invalid" errors.
    UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, _spFormDigestRefreshInterval);
    let digest = (<HTMLInputElement>document.getElementById("__REQUESTDIGEST"));

    // then add the request digest header, really only needed for non-get but doesn't hurt anything
    if(digest) {
        init.headers.append("X-RequestDigest", digest.value);
    }

    // fix merge, SharePoint rest chooses only to accept this as POST
    if(init.method === "MERGE") {
        init.method = "POST";
        if(!headers.has("X-HTTP-Method")) {
            init.headers.append("X-HTTP-Method", "MERGE");
        }
        if(!headers.has("IF-MATCH")) {
            init.headers.append("IF-MATCH", "*");
        }
        if(!headers.has("content-type")) {
            init.headers.append("content-type", "application/json;odata=nometadata");
        }
    }

    if(init.method === "DELETE") {
        if(!headers.has("X-HTTP-Method")) {
            init.headers.append("X-HTTP-Method", "DELETE");
        }
    }

    /*
    Call fetch, process obvious error responses, pre-process json responses, and
    return the promise for further processing.
    */
    return fetch(url, init).then(function(response) {
        // non-success response
        if (response.status < 200 || response.status >= 400) {
            throw new Error(response.status + " " + response.statusText);
        }

        // no content by design
        if (response.status === 204) {
            return response;
        }

        // no content, but not quite right
        if (response.headers.get("content-length") === "0") {
            // some rest endpoints return no content, but don't return status 204 like SharePoint's MERGE
            return response;
        }

        // process json responses
        let contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") > -1) {
            return response.json();
        } 

        // no errors but also not json, just return the response
        return response;
    });
}
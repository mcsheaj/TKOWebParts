import "cross-fetch/polyfill";

export function fetchx(url: string, init: any) {
  let expectsJson = false;

  // all SharePoint operations are going to need this, so let's default.
  init.credentials = "include";

  // turn objects into Headers, also see if we're expecting a json response
  if (init && init.headers && !(init.headers instanceof Headers)) {
    let newHeaders = new Headers();
    for (let key in init.headers) {
      newHeaders.append(key, init.headers[key]);
      if (key.toLowerCase() === "accept") {
        if (init.headers[key].indexOf("application/json") > -1) {
          expectsJson = true;
        }
      }
    }
    init.headers = newHeaders;
  }

  /*
  Call fetch, process obvious error responses, pre-process json responses, and
  return the promise for further processing.
  */
  return fetch(url, init).then(function (response) {
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
      /*
      This seems like an obvious error, but SharePoint REST is not consistent
      on this. It seems like any response with no content should return a status 
      of "204 No Content", which the delete operation does, but the merge 
      operation returns "200 Ok" with a 'content-length' of 0, which technically
      is a fine response.
      */
      return response;
    }

    // process json responses
    if (expectsJson) {
      let contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") > -1) {
        return response.json();
      } else {
        throw new TypeError("Oops, we haven't got JSON!");
      }
    }

    // no errors but also not json
    return response;
  });
}

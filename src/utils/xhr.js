
/** basic xhr factory **/
const xhrFactory = () => {
    const xhr = new XMLHttpRequest();
    let body = undefined;
    const self = {
        init : function (url, verb) {
            xhr.open(verb || 'GET', url)
            return this;
        },
        body : function (b) {
            body = b;
            return this;
        },
        header: function (headers) {
            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });
            return this;
        },
        send : function () {
            return new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(xhr.statusText);
                    }
                };
                xhr.onerror = () => reject(xhr.statusText);
                xhr.send(body);
            });
        }
    }

    return self;
};

export default xhrFactory;
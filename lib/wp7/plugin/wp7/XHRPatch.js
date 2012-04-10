

(function (win, doc) {

var docDomain = null;
try {
    docDomain = doc.domain;
}
catch (err) 
{
    //console.log("caught exception trying to access document.domain");
}

if (!docDomain || docDomain.length == 0) {

    var aliasXHR = win.XMLHttpRequest;

    win.XMLHttpRequest = function () { };
    win.XMLHttpRequest.noConflict = aliasXHR;
    win.XMLHttpRequest.UNSENT = 0;
    win.XMLHttpRequest.OPENED = 1;
    win.XMLHttpRequest.HEADERS_RECEIVED = 2;
    win.XMLHttpRequest.LOADING = 3;
    win.XMLHttpRequest.DONE = 4;

    win.XMLHttpRequest.prototype =
	{
	    UNSENT: 0,
	    OPENED: 1,
	    HEADERS_RECEIVED: 2,
	    LOADING: 3,
	    DONE: 4,

	    isAsync: false,
	    onreadystatechange: null,
	    readyState: 0,
	    _url: "",
	    timeout: 0,
	    withCredentials: false,
	    _requestHeaders: null,
	    open: function (reqType, uri, isAsync, user, password) {
	        console.log("XMLHttpRequest.open ::: " + uri);

	        if (uri && uri.indexOf("http") == 0) {
	            if (!this.wrappedXHR) {
	                this.wrappedXHR = new aliasXHR();
	                var self = this;

	                // timeout
	                if (this.timeout > 0) {
	                    this.wrappedXHR.timeout = this.timeout;
	                }
	                Object.defineProperty(this, "timeout", {
	                    set: function (val) {
	                        this.wrappedXHR.timeout = val;
	                    },
	                    get: function () {
	                        return this.wrappedXHR.timeout;
	                    }
	                });



	                if (this.withCredentials) {
	                    this.wrappedXHR.withCredentials = this.withCredentials;
	                }
	                Object.defineProperty(this, "withCredentials", {
	                    set: function (val) {
	                        this.wrappedXHR.withCredentials = val;
	                    },
	                    get: function () {
	                        return this.wrappedXHR.withCredentials;
	                    }
	                });


	                Object.defineProperty(this, "status", { get: function () {
	                    return this.wrappedXHR.status;
	                }
	                });
	                Object.defineProperty(this, "responseText", { get: function () {
	                    return this.wrappedXHR.responseText;
	                }
	                });
	                Object.defineProperty(this, "statusText", { get: function () {
	                    return this.wrappedXHR.statusText;
	                }
	                });

	                Object.defineProperty(this, "responseXML", { get: function () {
	                    return this.wrappedXHR.responseXML;
	                }
	                });

	                this.getResponseHeader = function (header) {
	                    return this.wrappedXHR.getResponseHeader(header);
	                };
	                this.getAllResponseHeaders = function () {
	                    return this.wrappedXHR.getAllResponseHeaders();
	                };

	                this.wrappedXHR.onreadystatechange = function () {
	                    self.changeReadyState(self.wrappedXHR.readyState);
	                };
	            }
	            return this.wrappedXHR.open(reqType, uri, isAsync, user, password);
	        }
	        else {
	            // x-wmapp1://app/www/page2.html
	            // need to work some magic on the actual url/filepath
	            var newUrl = uri;
	            if (newUrl.indexOf(":/") > -1) {
	                newUrl = newUrl.split(":/")[1];
	            }

	            if (newUrl.lastIndexOf("/") === newUrl.length - 1) {
	                newUrl += "index.html"; // default page is index.html, when call is to a dir/ ( why not ...? )
	            }
	            this._url = newUrl;
	        }
	    },
	    statusText: "",
	    changeReadyState: function (newState) {
	        this.readyState = newState;
	        if (this.onreadystatechange) {
	            this.onreadystatechange();
	        }
	    },
	    setRequestHeader: function (header, value) {
	        if (this.wrappedXHR) {
	            this.wrappedXHR.setRequestHeader(header, value);
	        }
	    },
	    getResponseHeader: function (header) {
	        return this.wrappedXHR ? this.wrappedXHR.getResponseHeader(header) : "";
	    },
	    getAllResponseHeaders: function () {
	        return this.wrappedXHR ? this.wrappedXHR.getAllResponseHeaders() : "";
	    },
	    responseText: "",
	    responseXML: "",
	    onResult: function (res) {
	        this.status = 200;
	        this.responseText = res;

	        Object.defineProperty(this, "responseXML", { get: function () {
	            var parser = new DOMParser();
	            return parser.parseFromString(this.responseText, "text/xml");
	        }
	        });
	        this.changeReadyState(this.DONE);
	    },
	    onError: function (err) {
	        console.log("Wrapped XHR received Error from FileAPI :: " + err);
	        this.status = 404;
	        this.changeReadyState(this.DONE);
	    },

	    abort: function () {
	        if (this.wrappedXHR) {
	            return this.wrappedXHR.abort();
	        }
	    },

	    send: function (data) {
	        if (this.wrappedXHR) {
	            return this.wrappedXHR.send(data);
	        }
	        else {
	            this.changeReadyState(this.OPENED);

	            var alias = this;

	            function fail(evt) {
	                console.log("fail :: " + JSON.stringify(evt));

	                alias.onError(evt.code);
	            }

	            function gotFile(file) {
	                console.log("got file");
	                var reader = new FileReader();
	                reader.onloadend = function (evt) {
	                    console.log("Read as text");
	                    alias.onResult(evt.target.result);
	                };
	                reader.readAsText(file);
	            }

	            function gotEntry(entry) {
	                console.log("got entry");
	                entry.file(gotFile, fail);
	            }

	            function gotFS(fs) {
	                console.log("got filesystem");
	                fs.root.getFile(alias._url, null, gotEntry, fail);
	            }

	            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

	        }
	    },
	    status: 404
	};
} // if doc domain 

// end closure wrap
})(window, document); 

module.exports = null;

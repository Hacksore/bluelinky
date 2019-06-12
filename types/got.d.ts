export = index;
declare function index(url: any, options: any): any;
declare namespace index {
  class CacheError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(error: any, options: any);
    name: any;
  }
  class CancelError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(reason: any);
    name: any;
  }
  class GotError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(message: any, error: any, options: any);
    name: any;
    code: any;
  }
  class HTTPError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(response: any, options: any);
    name: any;
    statusCode: any;
    statusMessage: any;
    headers: any;
    body: any;
  }
  class MaxRedirectsError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(statusCode: any, redirectUrls: any, options: any);
    name: any;
    statusCode: any;
    statusMessage: any;
    redirectUrls: any;
  }
  class ParseError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(error: any, statusCode: any, options: any, data: any);
    name: any;
    statusCode: any;
    statusMessage: any;
  }
  class ReadError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(error: any, options: any);
    name: any;
  }
  class RequestError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(error: any, options: any);
    name: any;
  }
  class TimeoutError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(error: any, options: any);
    name: any;
    event: any;
  }
  class UnsupportedProtocolError {
    static captureStackTrace(p0: any, p1: any): any;
    static stackTraceLimit: number;
    constructor(options: any);
    name: any;
  }
  function create(defaults: any): any;
  namespace defaults {
    function handler(options: any, next: any): void;
    const mutableDefaults: boolean;
    const options: {
      cache: boolean;
      decompress: boolean;
      followRedirect: boolean;
      form: boolean;
      headers: {
        "user-agent": string;
      };
      hooks: {
        afterResponse: any[];
        beforeError: any[];
        beforeRedirect: any[];
        beforeRequest: any[];
        beforeRetry: any[];
        init: any[];
      };
      json: boolean;
      retry: {
        errorCodes: Set;
        methods: Set;
        retries: number;
        statusCodes: Set;
      };
      stream: boolean;
      throwHttpErrors: boolean;
      useElectronNet: boolean;
    };
  }
  function extend(options: any): any;
  function get(url: any, options: any): void;
  function head(url: any, options: any): void;
  function mergeInstances(args: any): void;
  function mergeOptions(sources: any): any;
  function patch(url: any, options: any): void;
  function post(url: any, options: any): void;
  function put(url: any, options: any): void;
  function stream(url: any, options: any): void;
  namespace stream {
    function get(url: any, options: any): void;
    function head(url: any, options: any): void;
    function patch(url: any, options: any): void;
    function post(url: any, options: any): void;
    function put(url: any, options: any): void;
  }
}

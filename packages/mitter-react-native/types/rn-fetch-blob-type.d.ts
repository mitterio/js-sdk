declare module 'rn-fetch-blob' {

  export const RNFetchBlob: RnFetchBlobType
  export type  RNFetchBlob = RnFetchBlobType
  export default RNFetchBlob

  interface RnFetchBlobType {
    wrap(path: string):  string
    fetch(method: string, url: string, headers?: { [key: string]: string[] }, body?: any
      | null): StatefulPromise<FetchBlobResponse>;
    base64: { encode(input: string): string; decode(input: string): string };
    config(options: RNFetchBlobConfig): RnFetchBlobType;
    session(name: string): RNFetchBlobSession;
    wrap(path: string): string;
  }


  export interface RNFetchBlobConfig {
    /**
     * When this property is true, the downloaded data will overwrite the existing file. (true by default)
     */
    overwrite?: boolean;

    /**
     * Set timeout of the request (in milliseconds).
     */
    timeout?: number;

    /**
     * Set this property to true to display a network indicator on status bar, this feature is only supported on IOS.
     */
    indicator?: boolean;

    /**
     * Set this property to true will allow the request create connection with server have self-signed SSL
     * certification. This is not recommended to use in production.
     */
    trusty?: boolean;

    /**
     * Set this property to true will makes response data of the fetch stored in a temp file, by default the temp
     * file will stored in App's own root folder with file name template RNFetchBlob_tmp${timestamp}.
     */
    fileCache?: boolean;

    /**
     * Set this property to change temp file extension that created by fetch response data.
     */
    appendExt?: string;

    /**
     * When this property has value, fetch API will try to store response data in the path ignoring fileCache and
     * appendExt property.
     */
    path?: string;

    session?: string;

    addAndroidDownloads?: AddAndroidDownloads;

    /**
     * Fix IOS request timeout issue #368 by change default request setting to defaultSessionConfiguration, and make backgroundSessionConfigurationWithIdentifier optional
     */
    IOSBackgroundTask?: boolean;
  }

  export interface AddAndroidDownloads {
    /**
     * download file using Android download manager or not.
     */
    useDownloadManager?: boolean;
    /**
     * title of the file
     */
    title?: string;
    /**
     * File description of the file.
     */
    description?: string;
    /**
     * The destination which the file will be downloaded, it SHOULD be a location on external storage (DCIMDir).
     */
    path?: string;
    /**
     * MIME type of the file. By default is text/plain
     */
    mime?: string;
    /**
     * A boolean value, see Officail Document
     * (https://developer.android.com/reference/android/app/DownloadManager.html#addCompletedDownload(java.lang.String, java.lang.String, boolean, java.lang.String, java.lang.String, long, boolean))
     */
    mediaScannable?: boolean;
    /**
     * A boolean value decide whether show a notification when download complete.
     */
    notification?: boolean;
  }

  export  namespace PolyfillBlob {
    function clearCache(): void;

    function build(data: any, cType: any): Promise<PolyfillBlob>;

    function setLog(level: number): void;
  }

  export interface StatefulPromise<T> extends Promise<T> {
    /**
     * Cancel the request when invoke this method.
     */
    cancel(cb?: (reason: any) => void): StatefulPromise<FetchBlobResponse>;

    /**
     * Add an event listener which triggers when data receiving from server.
     */
    progress(callback: (received: number, total: number) => void): StatefulPromise<FetchBlobResponse>;

    /**
     * Add an event listener with custom configuration
     */
    progress(config: { count?: number, interval?: number }, callback: (received: number, total: number) => void): StatefulPromise<FetchBlobResponse>;

    /**
     * Add an event listener with custom configuration.
     */
    uploadProgress(callback: (sent: number, total: number) => void): StatefulPromise<FetchBlobResponse>;

    /**
     * Add an event listener with custom configuration
     */
    uploadProgress(config: { count?: number, interval?: number }, callback: (sent: number, total: number) => void): StatefulPromise<FetchBlobResponse>;

    /**
     * An IOS only API, when IOS app turns into background network tasks will be terminated after ~180 seconds,
     * in order to handle these expired tasks, you can register an event handler, which will be called after the
     * app become active.
     */
    expire(callback: () => void): StatefulPromise<void>;
  }

  export  class PolyfillBlob extends EventTarget {
    /**
     * RNFetchBlob Blob polyfill, create a Blob directly from file path, BASE64
     * encoded data, and string. The conversion is done implicitly according to
     * given `mime`. However, the blob creation is asynchronously, to register
     * event `onCreated` is need to ensure the Blob is creadted.
     *
     * @param data Content of Blob object
     * @param cType Content type settings of Blob object, `text/plain` by default
     * @param defer When this argument set to `true`, blob constructor will not invoke blob created event automatically.
     */
    constructor(data: any, cType: any, defer: boolean);

    /**
     * Since Blob content will asynchronously write to a file during creation,
     * use this method to register an event handler for Blob initialized event.
     * @param  fn An event handler invoked when Blob created
     * @return The Blob object instance itself
     */
    onCreated(fn: () => void): PolyfillBlob;

    markAsDerived(): void;

    /**
     * Get file reference of the Blob object.
     * @return Blob file reference which can be consumed by RNFetchBlob fs
     */
    getRNFetchBlobRef(): string;

    /**
     * Create a Blob object which is sliced from current object
     * @param  start    Start byte number
     * @param  end      End byte number
     * @param  contentType Optional, content type of new Blob object
     */
    slice(start?: number, end?: number, contentType?: string): PolyfillBlob;

    /**
     * Read data of the Blob object, this is not standard method.
     * @param  encoding Read data with encoding
     */
    readBlob(encoding: string): Promise<any>;

    /**
     * Release the resource of the Blob object.
     * @nonstandard
     */
    close(): Promise<void>;
  }

  export interface FetchBlobResponse {
    taskId: string;
    /**
     * get path of response temp file
     * @return File path of temp file.
     */
    path(): string;
    type: "base64" | "path" | "utf8";
    data: any;
    /**
     * Convert result to javascript RNFetchBlob object.
     * @return Return a promise resolves Blob object.
     */
    blob(contentType: string, sliceSize: number): Promise<PolyfillBlob>;
    /**
     * Convert result to text.
     * @return Decoded base64 string.
     */
    text(): string | Promise<any>;
    /**
     * Convert result to JSON object.
     * @return Parsed javascript object.
     */
    json(): any;
    /**
     * Return BASE64 string directly.
     * @return BASE64 string of response body.
     */
    base64(): any;
    /**
     * Remove cahced file
     */
    flush(): void;
    respInfo: RNFetchBlobResponseInfo;
    session(name: string): RNFetchBlobSession | null;
    /**
     * Read file content with given encoding, if the response does not contains
     * a file path, show warning message
     * @param  encode Encode type, should be one of `base64`, `ascrii`, `utf8`.
     */
    readFile(encode: Encoding): Promise<any> | null;
    /**
     * Start read stream from cached file
     * @param  encode Encode type, should be one of `base64`, `ascrii`, `utf8`.
     */
    readStream(encode: Encoding): RNFetchBlobStream | null;
  }

  type Encoding = "utf8" | "ascii" | "base64";

  export interface RNFetchBlobResponseInfo {
    taskId: string;
    state: number;
    headers: any;
    status: number;
    respType: "text" | "blob" | "" | "json";
    rnfbEncode: "path" | "base64" | "ascii" | "utf8";
  }

  export interface RNFetchBlobStream {
    onData(): void;
    onError(): void;
    onEnd(): void;
  }

  export  class RNFetchBlobSession {
    constructor(name: string, list: string[]);

    add(path: string): RNFetchBlobSession;

    remove(path: string): RNFetchBlobSession;

    dispose(): Promise<void>;

    list(): string[];

    name: string;

    static getSession(name: string): any;

    static setSession(name: string): void;

    static removeSession(name: string): void;
  }


}

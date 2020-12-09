import nodeFetch from 'node-fetch';
import User from '../user';
export interface Continuation {
    nextContinuationData: {
        continuation: string;
        clickTrackingParams: string;
    };
}
export interface ParserResponse<T> {
    content: T[];
    continuation?: Continuation;
}
interface FeedExtractorOptions {
    baseUrl: string;
    user: User;
    findInitialDataFromHtml?: boolean;
    fetch?: typeof nodeFetch;
    headers?: {
        [key: string]: string;
    };
}
export interface FetchResponse<T> {
    nextContUrl: string | null;
    data: T[];
}
export default abstract class FeedExtractor<T> {
    private iteration;
    private _fetch;
    private user;
    protected headers: {
        [key: string]: string;
    };
    protected baseUrl: string;
    protected findInitialDataFromHtml: boolean;
    constructor({ baseUrl, user, findInitialDataFromHtml, fetch, headers }: FeedExtractorOptions);
    protected abstract parse(text: string, iteration?: number): ParserResponse<T>;
    fetch(nextContUrl?: string): Promise<FetchResponse<T>>;
    private processFetchResponse;
    protected getIdentityToken(string: string): string;
    protected getInitialData(string: string): string;
    protected getContinuation(string: string): any;
    protected getContinuationUrl(continuations: Continuation): string;
}
export {};

import nodeFetch from 'node-fetch';
import { applyRegex } from '../utils/regex';
import User from '../user';

export interface Continuation {
    nextContinuationData: {
        continuation: string;
        clickTrackingParams: string;
    }
};

export interface ParserResponse<T> {
    content: T[]; continuation?: Continuation;
}

interface FeedExtractorOptions {
    baseUrl: string;
    user: User;
    findInitialDataFromHtml?: boolean;
    fetch?: typeof nodeFetch;
    headers?: {[key: string]: string };
}

export interface FetchResponse<T> {
    nextContUrl: string | null,
    data: T[];
}

export default abstract class FeedExtractor<T> {
    private _fetch: typeof nodeFetch;
    private user: User;

    protected headers: { [key: string]: string } = { 
        'X-YouTube-Client-Name': '1',
        'X-YouTube-Client-Version': '2.20201125.03.02'
    };
    protected baseUrl: string;
    protected findInitialDataFromHtml: boolean;

    constructor({ baseUrl, user, findInitialDataFromHtml = true, fetch = nodeFetch, headers }: FeedExtractorOptions) {
        this.baseUrl = baseUrl;
        this.user = user;
        this.findInitialDataFromHtml = findInitialDataFromHtml;
        this._fetch = fetch;
        this.headers = { ...this.headers, ...headers };
    }

    protected abstract parse(text: string, iteration ?: number): ParserResponse<T>;

    async fetch(nextContUrl?: string): Promise<FetchResponse<T>> {
        const url = (nextContUrl) ? nextContUrl : this.baseUrl;

        if (!url) {
            console.debug("Empty feed url. No more continuations?")

            return {
                nextContUrl: null,
                data: []
            }
        }

        const headers = {
            ...this.user.headers,
            ...this.headers
        }

        try {
            const responseText = await this._fetch(url, { headers })
                .then(res => res.text());

            return this.processFetchResponse(responseText, url === this.baseUrl);
        } catch (err) {
            console.error(`Failed to fetch feed from ${url}`);
            throw err;
        }
    }

    private processFetchResponse(responseText: string, baseUrlRequest: boolean): FetchResponse<T> {
        let validatedResponseText: string = responseText;

        try {
            const identityToken = JSON.parse(`"${this.getIdentityToken(responseText)}"`)
            this.headers['X-Youtube-Identity-Token'] = identityToken;
        } catch (err) {  }

        if (baseUrlRequest && this.findInitialDataFromHtml) {
            validatedResponseText = this.getInitialData(responseText);
        }

        let { content, continuation } = this.parse(validatedResponseText);

        if (!continuation) { // manually find continuations
            continuation = this.getContinuation(validatedResponseText);
        }

        const nextContUrl = this.getContinuationUrl(continuation);

        return {
            nextContUrl,
            data: content
        }
    }

    protected getIdentityToken(string: string) {
        return applyRegex({
            string,
            regex: /"ID_TOKEN"\s?:\s?"([^"]+)/,
            onError: () => { throw new Error("Can't find ID_TOKEN") }
        });
    }

    protected getInitialData(string: string) {
        return applyRegex({
            string,
            // probably fails with JS-like titles
            regex: /(?:var\sytInitialData|window\["ytInitialData"\])\s?=\s?(\{.*?\});/,
            onError: () => { throw new Error("Can't get initial data") }
        });
    }

    protected getContinuation(string: string) {
        return JSON.parse(applyRegex({
            string,
            regex: /"continuations":(\[.*?\])/,
            onError: () => { throw new Error("Couldn't find continuations") }
        }));
    }

    protected getContinuationUrl(continuations: Continuation) {
        if (!continuations || !continuations.nextContinuationData) {
            return null;
        }

        const { continuation, clickTrackingParams } = continuations.nextContinuationData;

        if (!continuation || !clickTrackingParams) {
            return null;
        }

        return `https://www.youtube.com/browse_ajax?ctoken=${continuation}&continuation=${continuation}&itct=${clickTrackingParams}`;
    }
}


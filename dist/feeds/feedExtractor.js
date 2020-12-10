"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const regex_1 = require("../utils/regex");
;
class FeedExtractor {
    constructor({ baseUrl, user, findInitialDataFromHtml = true, fetch = node_fetch_1.default, headers }) {
        this.headers = {
            'X-YouTube-Client-Name': '1',
            'X-YouTube-Client-Version': '2.20201125.03.02'
        };
        this.baseUrl = baseUrl;
        this.user = user;
        this.findInitialDataFromHtml = findInitialDataFromHtml;
        this._fetch = fetch;
        this.headers = Object.assign(Object.assign({}, this.headers), headers);
    }
    fetch(nextContUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = (nextContUrl) ? nextContUrl : this.baseUrl;
            if (!url) {
                console.debug("Empty feed url. No more continuations?");
                return {
                    nextContUrl: null,
                    data: []
                };
            }
            const headers = Object.assign(Object.assign({}, this.user.headers), this.headers);
            try {
                const responseText = yield this._fetch(url, { headers })
                    .then(res => res.text());
                return this.processFetchResponse(responseText, url === this.baseUrl);
            }
            catch (err) {
                console.error(`Failed to fetch feed from ${url}`);
                throw err;
            }
        });
    }
    processFetchResponse(responseText, baseUrlRequest) {
        let validatedResponseText = responseText;
        try {
            const identityToken = JSON.parse(`"${this.getIdentityToken(responseText)}"`);
            this.headers['X-Youtube-Identity-Token'] = identityToken;
        }
        catch (err) { }
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
        };
    }
    getIdentityToken(string) {
        return regex_1.applyRegex({
            string,
            regex: /"ID_TOKEN"\s?:\s?"([^"]+)/,
            onError: () => { throw new Error("Can't find ID_TOKEN"); }
        });
    }
    getInitialData(string) {
        return regex_1.applyRegex({
            string,
            // probably fails with JS-like titles
            regex: /(?:var\sytInitialData|window\["ytInitialData"\])\s?=\s?(\{.*?\});/,
            onError: () => { throw new Error("Can't get initial data"); }
        });
    }
    getContinuation(string) {
        return JSON.parse(regex_1.applyRegex({
            string,
            regex: /"continuations":(\[.*?\])/,
            onError: () => { throw new Error("Couldn't find continuations"); }
        }));
    }
    getContinuationUrl(continuations) {
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
exports.default = FeedExtractor;

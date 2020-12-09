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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayabilityError = exports.ExtractionError = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const p_memoize_1 = __importDefault(require("p-memoize"));
const regexp_match_indices_1 = __importDefault(require("regexp-match-indices"));
regexp_match_indices_1.default.config.mode = 'spec-compliant';
const json_1 = require("../utils/json");
const regex_1 = require("../utils/regex");
const signatureDecoderExtractor_1 = __importDefault(require("./signatureDecoderExtractor"));
class ExtractionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExtractionError';
    }
}
exports.ExtractionError = ExtractionError;
class PlayabilityError extends Error {
    constructor(playabilityStatus) {
        super(playabilityStatus.reason);
        this.playabilityStatus = playabilityStatus;
        this.name = 'PlayabilityError';
    }
}
exports.PlayabilityError = PlayabilityError;
;
class VideoExtractor {
    constructor(options) {
        const { streamingDataExtractionOptions, signatureDecoderExtractor, user } = Object.assign({}, {
            streamingDataExtractionOptions: {
                formatOptions: {
                    formats: true,
                    adaptiveFormats: true,
                },
                skipExtractionIfLivestream: true,
                filterUnusableFormats: true
            },
        }, options);
        this.streamingDataExtractionOptions = streamingDataExtractionOptions;
        this.signatureDecoderExtractor = signatureDecoderExtractor !== null && signatureDecoderExtractor !== void 0 ? signatureDecoderExtractor : new signatureDecoderExtractor_1.default({
            getBaseJs: p_memoize_1.default(this.fetchBaseJs.bind(this))
        });
        this.user = user;
    }
    extractVideo(stringContainingId, streamingDataExtractionOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const videoId = VideoExtractor.extractVideoId(stringContainingId);
            const html = yield node_fetch_1.default(`https://www.youtube.com/watch?v=${videoId}`, { headers: this.getHeaders() })
                .then(res => res.text());
            const playerResponse = VideoExtractor.extractPlayerConfig(html);
            const newStreamingData = yield this.extractStreamingData({ html, playerResponse, streamingDataExtractionOptions });
            return Object.assign(Object.assign({}, playerResponse), { streamingData: newStreamingData });
        });
    }
    getHeaders() {
        return (this.user !== undefined) ? this.user.headers : {};
    }
    extractStreamingData({ html, playerResponse, streamingDataExtractionOptions }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { streamingData, videoDetails } = playerResponse;
            if (streamingData === undefined) {
                throw new ExtractionError("Can't extract streamingData, no player_response has no streamingData");
            }
            const { skipExtractionIfLivestream, formatOptions } = Object.assign(Object.assign({}, this.streamingDataExtractionOptions), streamingDataExtractionOptions);
            if (videoDetails.isLive && skipExtractionIfLivestream) {
                return;
            }
            const baseJsUrl = VideoExtractor.extractJsBaseUrl(html);
            const getDecoder = p_memoize_1.default(() => this.signatureDecoderExtractor.getSignatureDecoder(baseJsUrl));
            const { formats: decipherFormats, adaptiveFormats: decipherAdaptiveFormats, } = formatOptions;
            const [formats, adaptiveFormats] = yield Promise.all([
                this.extractStreamingDataHelper({
                    arg: streamingData.formats,
                    extractFunc: (format) => __awaiter(this, void 0, void 0, function* () { return yield this.decipherFormats(format, getDecoder); }),
                    options: decipherFormats,
                }),
                this.extractStreamingDataHelper({
                    arg: streamingData.adaptiveFormats,
                    extractFunc: (format) => __awaiter(this, void 0, void 0, function* () { return yield this.decipherFormats(format, getDecoder); }),
                    options: decipherAdaptiveFormats,
                }),
            ]);
            return Object.assign(Object.assign({}, streamingData), { formats,
                adaptiveFormats });
        });
    }
    extractStreamingDataHelper({ arg, extractFunc, options }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options || arg === undefined) {
                return arg;
            }
            return yield extractFunc(arg);
        });
    }
    decipherFormats(formats, getDecoder) {
        return __awaiter(this, void 0, void 0, function* () {
            if (formats === undefined) {
                return undefined;
            }
            const decoded = [];
            const ciphered = [];
            for (let format of formats) {
                if (format.signatureCipher) {
                    const unparsed = Object.fromEntries(format.signatureCipher.split('&').map((pair) => pair.split('=')));
                    format = Object.assign({}, format, unparsed);
                }
                format.url = decodeURIComponent(format.url);
                if (format.url.includes('signature')
                    || (!format.s
                        && (format.url.includes("&sig=") || format.url.includes("&lsig=")))) {
                    decoded.push(format);
                    continue;
                }
                ciphered.push(format);
            }
            if (ciphered.length !== 0) {
                const signatureDecoder = yield getDecoder();
                const cipheredDecoded = ciphered.map((_a) => {
                    var { s, url } = _a, rest = __rest(_a, ["s", "url"]);
                    return (Object.assign(Object.assign({}, rest), { url: url + '&sig=' + signatureDecoder.decode(s) }));
                });
                return [...decoded, ...cipheredDecoded];
            }
            return decoded;
        });
    }
    fetchBaseJs(baseJsUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return node_fetch_1.default(baseJsUrl, { headers: this.getHeaders() }).then(res => res.text());
        });
    }
    static extractJsBaseUrl(html) {
        const match = html.match(/"PLAYER_JS_URL":"(.*?base\.js)"/);
        if (!match) {
            throw new ExtractionError("Couldn't extract js base url");
        }
        return 'https://youtube.com' + match[1];
    }
    static extractVideoId(stringContainingId) {
        const videoIdRegex = `[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]`;
        const regexes = [
            `^(?:https?://)(?:www\\.?)?(?:m\\.?)?youtube\.com/.*?v=(${videoIdRegex})`,
            `^(${videoIdRegex})$` // just id
        ];
        const match = regex_1.matchRegexes(stringContainingId, regexes, { returnOnFirstMatch: true });
        if (match === null) {
            throw new ExtractionError('Unable to extract videoId');
        }
        return match[1];
    }
    static extractPlayabilityStatus(html) {
        const match = html.match(/playabilityStatus":{.*?(?:"status":"(.*?)").*?(?:"reason":"(.*?)")/);
        if (!match) {
            throw new ExtractionError("Couldn't extract playabilityStatus");
        }
        return {
            status: match[1],
            reason: match[2]
        };
    }
    static extractPlayerConfig(html) {
        const playerConfigRegexes = [
            [/;ytplayer\.config\s?=\s?({.+?});/, (json) => {
                    json.args.player_response = JSON.parse(json.args.player_response);
                    return json.args.player_response;
                }],
            [/var\sytInitialPlayerResponse\s?=\s?({.+?});/, (json) => json]
        ];
        for (let [regex, transformFunc] of playerConfigRegexes) {
            const match = regexp_match_indices_1.default(regex, html);
            if (match === null) {
                continue;
            }
            const [startIndex] = match.indices[1];
            const endIndex = json_1.findEndingJsonBracket(html, startIndex);
            if (endIndex === -1) {
                throw new ExtractionError(`Coudln't find the json end index, regex: ${regex}`);
            }
            const jsonText = html.substring(startIndex, endIndex + 1);
            const json = JSON.parse(jsonText);
            return transformFunc(json);
        }
        const playabilityStatus = VideoExtractor.extractPlayabilityStatus(html);
        throw new PlayabilityError(playabilityStatus);
        //throw new ExtractionError('Unable to extract video config');
    }
}
exports.default = VideoExtractor;

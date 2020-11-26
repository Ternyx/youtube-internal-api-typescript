import fetch from 'node-fetch';
import { Format, AdaptiveFormat, StreamingData, PlayerResponse } from './types/youtubePlayerConfig';
import SignatureDecoderExtractor from './signatureDecoderExtractor';
import SignatureDecoder from './signatureDecoder';
import pMemoize from 'p-memoize';
import { matchRegexes } from '../utils/regex';

export class ExtractionError extends Error {
    public name = 'ExtractionError';
    constructor(message: string) {
        super(message);
    }
}

export class PlayabilityError extends Error {
    name = 'PlayabilityError';
    constructor(readonly playabilityStatus: PlayabilityStatus) {
        super(playabilityStatus.reason);
    }
}

export interface StreamingDataExtractionOptions {
    formatOptions?: FormatOptions;
    skipExtractionIfLivestream?: boolean;
    filterUnusableFormats?: boolean;
}

export interface FormatOptions {
    formats?: boolean;
    adaptiveFormats?: boolean;
    //dashFormats?: boolean;
}

export interface PlayabilityStatus {
    status: string;
    reason: string;
};

export interface VideoExtractorOptions {
    streamingDataExtractionOptions?: StreamingDataExtractionOptions;
    signatureDecoderExtractor?: SignatureDecoderExtractor;
}

interface ExtractStreamingDataHelperOptions<T> {
    arg: T | undefined;
    extractFunc: (arg: T) => any;
    options: boolean;
}

interface ExtractStreamingData {
    html: string,
    playerResponse: PlayerResponse;
    streamingDataExtractionOptions: StreamingDataExtractionOptions;
}

export default class VideoExtractor {
    private streamingDataExtractionOptions: StreamingDataExtractionOptions;
    private signatureDecoderExtractor: SignatureDecoderExtractor;

    constructor(options?: VideoExtractorOptions) {
        const { streamingDataExtractionOptions, signatureDecoderExtractor } = Object.assign({}, {
            streamingDataExtractionOptions: {
                formatOptions: {
                    formats: true,
                    adaptiveFormats: true,
                    //dashFormats: true
                },
                skipExtractionIfLivestream: true,
                filterUnusableFormats: true
            },
        }, options);

        this.streamingDataExtractionOptions = streamingDataExtractionOptions;
        this.signatureDecoderExtractor = signatureDecoderExtractor ?? new SignatureDecoderExtractor({
            getBaseJs: pMemoize<string[], string, string>(this.fetchBaseJs)
        });
    }

    async extractVideo(stringContainingId: string, streamingDataExtractionOptions?: StreamingDataExtractionOptions) {
        const videoId = VideoExtractor.extractVideoId(stringContainingId);
        const html = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
            .then(res => res.text());
        const playerResponse = VideoExtractor.extractPlayerConfig(html);
        const newStreamingData = await this.extractStreamingData({ html, playerResponse, streamingDataExtractionOptions });

        return {
            ...playerResponse,
            streamingData: newStreamingData
        }
    }

    protected async extractStreamingData({ html, playerResponse, streamingDataExtractionOptions }: ExtractStreamingData) {
        const { streamingData, videoDetails } = playerResponse;

        if (streamingData === undefined) {
            throw new ExtractionError("Can't extract streamingData, no player_response has no streamingData");
        }

        const { skipExtractionIfLivestream, formatOptions } = {
            ...this.streamingDataExtractionOptions,
            ...streamingDataExtractionOptions
        };

        if(videoDetails.isLive && skipExtractionIfLivestream) {
            return;
        }

        const baseJsUrl = VideoExtractor.extractJsBaseUrl(html);
        const getDecoder = pMemoize(() => this.signatureDecoderExtractor.getSignatureDecoder(baseJsUrl));

        const { 
            formats: decipherFormats,
            adaptiveFormats: decipherAdaptiveFormats,
            //dashFormats: decipherDashFormats
        } = formatOptions;

        const [ formats, adaptiveFormats ] = await Promise.all([
            this.extractStreamingDataHelper({
                arg: streamingData.formats,
                extractFunc: async (format) => await this.decipherFormats(format, getDecoder),
                options: decipherFormats,
            }),
            this.extractStreamingDataHelper({
                arg: streamingData.adaptiveFormats,
                extractFunc: async (format) => await this.decipherFormats(format, getDecoder),
                options: decipherAdaptiveFormats,
            }),
            // no dash for now since I can't find a video that actually uses dash
            //this.extractStreamingDataHelper({
                //arg: streamingData.dashManifestUrl,
                //extractFunc: (url) => url, 
                //options: false,
            //}),
        ]);

        return {
            ...streamingData,
            formats,
            adaptiveFormats
        }
    }

    protected async extractStreamingDataHelper<T extends StreamingData[keyof StreamingData]>({
        arg,
        extractFunc,
        options
    }: ExtractStreamingDataHelperOptions<T>) {
        if (!options || arg === undefined) {
            return arg;
        }
        return await extractFunc(arg);
    }

    protected async decipherFormats(formats: Format[] | AdaptiveFormat[], getDecoder: () => Promise<SignatureDecoder>) {
        if (formats === undefined) {
            return undefined;
        }

        const decoded = [];
        const ciphered = [];

        for (let format of formats) {
            if (format.signatureCipher) {
                const unparsed = Object.fromEntries(format.signatureCipher.split('&').map((pair: string) => pair.split('=')));
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
            const signatureDecoder = await getDecoder();

            const cipheredDecoded = ciphered.map(({ s, url, ...rest }) => ({
                ...rest,
                url: url + '&sig=' + signatureDecoder.decode(s)
            }));

            return [...decoded, ...cipheredDecoded];
        }

        return decoded;
    }

    protected async fetchBaseJs(baseJsUrl: string) {
        return fetch(baseJsUrl).then(res => res.text());
    }

    protected static extractJsBaseUrl(html: string) {
        const match = html.match(/"PLAYER_JS_URL":"(.*?base\.js)"/);

        if (!match) {
            throw new ExtractionError("Couldn't extract js base url");
        }
        return 'https://youtube.com' + match[1];
    }

    protected static extractVideoId(stringContainingId: string) {
        const videoIdRegex = `[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]`;
        const regexes = [
            `^(?:https?://)(?:www\\.?)?(?:m\\.?)?youtube\.com/.*?v=(${videoIdRegex})`, // from url
            `^(${videoIdRegex})$` // just id
        ];

        const match = matchRegexes(stringContainingId, regexes, { returnOnFirstMatch: true });

        if (match === null) {
            throw new ExtractionError('Unable to extract videoId');
        } 

        return match[1];
    }

    protected static extractPlayabilityStatus(html: string): PlayabilityStatus {
        const match = html.match(/playabilityStatus":{.*?(?:"status":"(.*?)").*?(?:"reason":"(.*?)")/);

        if (!match) {
            throw new ExtractionError("Couldn't extract playabilityStatus")
        }

        return {
            status: match[1],
            reason: match[2]
        }
    }

    protected static extractPlayerConfig(html: string): PlayerResponse {
        const playerConfigRegexes = [
            /;ytplayer\.config\s?=\s?({.+?});ytplayer/,
            /;ytplayer\.config\s?=\s?({.+?});/,
            /var ytInitialPlayerResponse\s?=\s?({.+?});/
        ];

        let i: number;
        let match: RegExpMatchArray;
        for (i = 0; i < playerConfigRegexes.length; i++) {
            match = html.match(playerConfigRegexes[i]);
            if (match) {
                break;
            }
        }

        if (match === null) {
            const playabilityStatus = VideoExtractor.extractPlayabilityStatus(html);
            throw new PlayabilityError(playabilityStatus);
            //throw new ExtractionError('Unable to extract video config');
        }

        const json = JSON.parse(match[1]);
        if (i < 2) {
            json.args.player_response = JSON.parse(json.args.player_response);
            return json.args.player_response as PlayerResponse;
        } else {
            return json as PlayerResponse;
        }
    }
}


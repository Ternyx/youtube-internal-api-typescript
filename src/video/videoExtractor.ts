import fetch from 'node-fetch';
import YoutubePlayerConfig , { StreamingData } from './types/youtubePlayerConfig';
import { matchRegexes } from '../utils/regex';

export class ExtractionError extends Error {
    public name = 'ExtractionError';
    constructor(message: string) {
        super(message);
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
    dashFormats?: boolean;
}

export interface VideoExtractorOptions {
    streamingDataExtractionOptions?: StreamingDataExtractionOptions;
}

export default class VideoExtractor {
    private streamingDataExtractionOptions: StreamingDataExtractionOptions;

    constructor(options?: VideoExtractorOptions) {
        const { streamingDataExtractionOptions } = Object.assign({
            streamingDataExtractionOptions: {
                formatOptions: {
                    formats: true,
                    adaptiveFormats: true,
                    dashFormats: true
                },
                skipExtractionIfLivestream: true,
                filterUnusableFormats: true
            },
        }, options);
        
        this.streamingDataExtractionOptions = streamingDataExtractionOptions;
    }

    async extractVideo(stringContainingId: string, streamingDataExtractionOptions?: StreamingDataExtractionOptions) {
        const videoId = VideoExtractor.extractVideoId(stringContainingId);
        const html = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
            .then(res => res.text());
        const config = VideoExtractor.extractPlayerConfig(html);
    }

    protected static extractVideoId(stringContainingId: string) {
        const videoIdRegex = `[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]`;
        const regexes = [
            `^(?:https?://)(?:www\\.?)?(?:m\\.?)?youtube\.com/.*v=(${videoIdRegex})`, // from url
            `^(${videoIdRegex})$` // just id
        ];

        const match = matchRegexes(stringContainingId, regexes, { returnOnFirstMatch: true });

        if (match === null) {
            throw new ExtractionError('Unable to extract videoId');
        } 

        return match[1];
    }

    protected static extractPlayerConfig(html: string) {
        const playerConfigRegex = /ytplayer\.config\s?=\s?({.+?});ytplayer/;

        const match = html.match(playerConfigRegex);

        if (match === null) {
            throw new ExtractionError('Unable to extract video config');
        }

        const playerConfig = JSON.parse(match[1]);
        playerConfig.args.player_response = JSON.parse(playerConfig.args.player_response);

        return playerConfig as YoutubePlayerConfig;
    }
}

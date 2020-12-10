import { Format, AdaptiveFormat, StreamingData, PlayerResponse } from './types/youtubePlayerConfig';
import SignatureDecoderExtractor from './signatureDecoderExtractor';
import SignatureDecoder from './signatureDecoder';
import User from '../user';
export declare class ExtractionError extends Error {
    name: string;
    constructor(message: string);
}
export declare class PlayabilityError extends Error {
    readonly playabilityStatus: PlayabilityStatus;
    name: string;
    constructor(playabilityStatus: PlayabilityStatus);
}
export interface StreamingDataExtractionOptions {
    formatOptions?: FormatOptions;
    skipExtractionIfLivestream?: boolean;
    filterUnusableFormats?: boolean;
}
export interface FormatOptions {
    formats?: boolean;
    adaptiveFormats?: boolean;
}
export interface PlayabilityStatus {
    status: string;
    reason: string;
}
export interface VideoExtractorOptions {
    streamingDataExtractionOptions?: StreamingDataExtractionOptions;
    signatureDecoderExtractor?: SignatureDecoderExtractor;
    user?: User;
}
interface ExtractStreamingDataHelperOptions<T> {
    arg: T | undefined;
    extractFunc: (arg: T) => any;
    options: boolean;
}
interface ExtractStreamingData {
    html: string;
    playerResponse: PlayerResponse;
    streamingDataExtractionOptions: StreamingDataExtractionOptions;
}
export default class VideoExtractor {
    private streamingDataExtractionOptions;
    private signatureDecoderExtractor;
    private user;
    constructor(options?: VideoExtractorOptions);
    extractVideo(stringContainingId: string, streamingDataExtractionOptions?: StreamingDataExtractionOptions): Promise<PlayerResponse>;
    private getHeaders;
    protected extractStreamingData({ html, playerResponse, streamingDataExtractionOptions }: ExtractStreamingData): Promise<{
        formats: any;
        adaptiveFormats: any;
        expiresInSeconds: string;
        dashManifestUrl?: string;
    }>;
    protected extractStreamingDataHelper<T extends StreamingData[keyof StreamingData]>({ arg, extractFunc, options }: ExtractStreamingDataHelperOptions<T>): Promise<any>;
    protected decipherFormats(formats: Format[] | AdaptiveFormat[], getDecoder: () => Promise<SignatureDecoder>): Promise<({
        url: string;
        itag: number;
        mimeType: string;
        bitrate: number;
        width: number;
        height: number;
        lastModified: string;
        contentLength: string;
        quality: string;
        fps: number;
        qualityLabel: string;
        projectionType: string;
        averageBitrate: number;
        audioQuality: string;
        approxDurationMs: string;
        audioSampleRate: string;
        audioChannels: number;
        signatureCipher?: any;
    } | {
        url: string;
        itag: number;
        mimeType: string;
        bitrate: number;
        width: number;
        height: number;
        initRange: import("./types/youtubePlayerConfig").InitRange;
        indexRange: import("./types/youtubePlayerConfig").IndexRange;
        lastModified: string;
        contentLength: string;
        quality: string;
        fps: number;
        qualityLabel: string;
        projectionType: string;
        averageBitrate: number;
        approxDurationMs: string;
        colorInfo: import("./types/youtubePlayerConfig").ColorInfo;
        highReplication?: boolean;
        audioQuality: string;
        audioSampleRate: string;
        audioChannels?: number;
        loudnessDb?: number;
        signatureCipher?: any;
    })[]>;
    protected fetchBaseJs(baseJsUrl: string): Promise<string>;
    protected static extractJsBaseUrl(html: string): string;
    protected static extractVideoId(stringContainingId: string): any;
    protected static extractPlayabilityStatus(html: string): PlayabilityStatus;
    protected static extractPlayerConfig(html: string): PlayerResponse;
}
export {};

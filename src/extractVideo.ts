import fetch from 'node-fetch';
import YoutubePlayerConfig from './types/youtubePlayerConfig';

class ExtractionError extends Error {
    public name = 'ExtractionError';
    constructor(message: string) {
        super(message);
    }
}

const extractVideoId = (stringContainingId: string) => {
    const videoIdRegex = `[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]`;
    const completeVideoIdRegex = [
        `^(?:https?://)(?:www\\.?)?(?:m\\.?)?youtube\.com/.*v=(${videoIdRegex})`, // from url
        `^(${videoIdRegex})$` // just id
    ].join('|');

    const match = stringContainingId.match(completeVideoIdRegex);

    if (match === null) {
        throw new ExtractionError('Unable to extract videoId');
    } 

    return match[1];
} 
const extractPlayerConfig = (html: string) => {
    const playerConfigRegex = /ytplayer\.config\s?=\s?({.+?});ytplayer/;

    const match = html.match(playerConfigRegex);

    if (match === null) {
        throw new ExtractionError('Unable to extract video config');
    }

    const jsonFilters = new Set([
        'attestation',
        'auxiliaryUi',
        'microformat',
        'playbackTracking',
        'responseContext',
        'storyboards',
        'videoQualityPromoSupportedRenderers'
    ]);

    const playerResponseReviver = (key: any, value: any) => (jsonFilters.has(key)) ? undefined : value;

    const playerConfig = JSON.parse(match[1]);
    playerConfig.args.player_response = JSON.parse(playerConfig.args.player_response, playerResponseReviver);

    return playerConfig as YoutubePlayerConfig;
} 

export default async function extractVideo(stringContainingId: string) {
    const videoId = extractVideoId(stringContainingId);
    const html = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
        .then(res => res.text());
    const config = extractPlayerConfig(html);
}


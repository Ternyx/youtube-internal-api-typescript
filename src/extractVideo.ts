import fetch from 'node-fetch';

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

const extractVideoConfig = (html: string) => {
    const videoConfigRegex = /ytplayer\.config\s?=\s?({.*?});/;

    const match = html.match(videoConfigRegex);

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

    return JSON.parse(match[1], (key, value) => (key === 'player_response') 
        ? JSON.parse(value, (key, value) => (jsonFilters.has(key) ? undefined : value)) : value);
} 

export default async function extractVideo(stringContainingId: string) {
    const videoId = extractVideoId(stringContainingId);
    const html = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
        .then(res => res.text());
    const config = extractVideoConfig(html);
}

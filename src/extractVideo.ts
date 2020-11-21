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

export default async function extractVideo(stringContainingId: string) {
    const videoId = extractVideoId(stringContainingId);
}

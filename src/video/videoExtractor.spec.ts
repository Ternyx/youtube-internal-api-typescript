import http from 'https';
import VideoExtractor from './videoExtractor';

const testVideoUrl = (url: string): Promise<Boolean> => new Promise((resolve, reject) => {
    const req = http.request(url, {}, res => {
        res.on('data', () => { // if at least a single chunk is received, assume that the url works
            res.destroy();
            resolve(true);
        });
        res.on('end', () => resolve(false));
    });
    req.on('error', e => {
        console.debug(`Failed to fetch ${url}, error: ${e}`)
        reject(e);
    });
    req.end();
});

test('Generic use_cipher_signature video', (async () => {
    jest.setTimeout(30000);
    const videoId = 'UxxajLWwzqY';

    const { streamingData } = await new VideoExtractor().extractVideo(videoId);
    const { formats, adaptiveFormats } = streamingData;

    const promises = [...formats, ...adaptiveFormats].map(({ url }) => testVideoUrl(url));

    (await Promise.all(promises)).forEach(result => {
        expect(result).toBe(true);
    });
}));

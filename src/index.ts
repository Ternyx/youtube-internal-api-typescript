import fetch from 'node-fetch';
import VideoExtractor from './video/videoExtractor';

(async () => {
    const url = 'UxxajLWwzqY';
    new VideoExtractor().extractVideo(url);
})();

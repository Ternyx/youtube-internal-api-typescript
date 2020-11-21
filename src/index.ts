import fetch from 'node-fetch';
import extractVideo from './extractVideo';

(async () => {
    await extractVideo('https://www.m.youtube.com/watch?v=iJrpfUG5rKc');
})();

import User from '../user';
import SubscriptionFeed from './subscriptionFeed';

let youtubeCookie = (process.env['YOUTUBE_COOKIE'] as string);
const testIfHasCookie = youtubeCookie !== undefined ? test : (...args: Parameters<typeof test.skip>) => {
    console.warn(`No valid YOUTUBE_COOKIE found in env, skipping ${args[0]}`);
    test.skip(...args);
}

testIfHasCookie('Fetch subscription feed (subfeed has to have at least > 50 videos)', async () => {
    jest.setTimeout(30000);
    const user = new User(youtubeCookie);
    const subFeed = new SubscriptionFeed({ user });

    const { nextContUrl, data } = await subFeed.fetch();
    expect(data.length).toBeGreaterThan(0);

    const browseAjaxRes = await subFeed.fetch(nextContUrl);
    expect(browseAjaxRes.data.length).toBeGreaterThan(0);
});

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

    const htmlRes = await subFeed.fetch();
    expect(htmlRes.length).toBeGreaterThan(0);

    const browseAjaxRes = await subFeed.fetch();
    expect(browseAjaxRes.length).toBeGreaterThan(0);

    expect(subFeed.content.length).toEqual(htmlRes.length + browseAjaxRes.length);
});

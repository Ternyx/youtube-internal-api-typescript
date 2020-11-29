import User from './user';
import VideoExtractor from './video/videoExtractor';
import SubscriptionFeed from './feeds/subscriptionFeed';

interface YoutubeOptions {
    userCookieString: string; 
}

export default function youtubeUser({ userCookieString }: YoutubeOptions) {
    const user = new User(userCookieString)
    const videoExtractor = new VideoExtractor({ user });
    const subscriptionFeed =  new SubscriptionFeed({ user });

    return {
        user,
        videoExtractor,
        subscriptionFeed
    }

}

export { 
    SubscriptionFeed,
    User,
    VideoExtractor,
};


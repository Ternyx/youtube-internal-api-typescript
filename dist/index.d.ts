import User from './user';
import VideoExtractor from './video/videoExtractor';
import SubscriptionFeed from './feeds/subscriptionFeed';
interface YoutubeOptions {
    userCookieString: string;
}
export default function youtubeUser({ userCookieString }: YoutubeOptions): {
    user: User;
    videoExtractor: VideoExtractor;
    subscriptionFeed: SubscriptionFeed<import("./feeds/types/subscriptionFeedResponse").SubscriptionFeedResponse>;
};
export * from './user';
export * from './video/videoExtractor';
export * from './feeds/subscriptionFeed';
export { User, VideoExtractor, SubscriptionFeed };

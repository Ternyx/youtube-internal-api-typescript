import FeedExtractor, { ParserResponse } from "./feedExtractor";
import User from '../user';
import nodeFetch from 'node-fetch';
import { SubscriptionFeedResponse } from './types/subscriptionFeedResponse';
export interface SubscriptionFeedOptions {
    user: User;
    findInitialDataFromHtml?: boolean;
    fetch?: typeof nodeFetch;
}
export default class SubscriptionFeed<T extends SubscriptionFeedResponse> extends FeedExtractor<T> {
    constructor(options: SubscriptionFeedOptions);
    protected parse(text: string, iteration?: number): ParserResponse<T>;
}

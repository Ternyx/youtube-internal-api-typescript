import FeedExtractor, { ParserResponse } from "./feedExtractor";
import User from '../user';
import nodeFetch from 'node-fetch';
export interface SubscriptionFeedOptions {
    user: User;
    findInitialDataFromHtml?: boolean;
    fetch?: typeof nodeFetch;
}
export default class SubscriptionFeed<T extends any> extends FeedExtractor<T> {
    constructor(options: SubscriptionFeedOptions);
    protected parse(text: string): ParserResponse<T>;
}

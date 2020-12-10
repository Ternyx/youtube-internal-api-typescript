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
    constructor(options: SubscriptionFeedOptions) {
        super({
            baseUrl: 'https://www.youtube.com/feed/subscriptions?flow=1',
            ...options
        });
    }

    protected parse(text: string, iteration?: number): ParserResponse<T> {
        const json = JSON.parse(text);
        let res;

        if (Array.isArray(json)) {
            if (!json[1].response) {
                return { content: [], continuation: undefined };
            }
            res = json[1].response.continuationContents.sectionListContinuation;
        } else {
            const cont = json.contents;
            const columnBrowswer = cont.twoColumnBrowseResultsRenderer || cont.singleColumnBrowseResultsRenderer;
            res = columnBrowswer.tabs[0].tabRenderer.content.sectionListRenderer;
        }
        
        const contentArr = res.contents[0].itemSectionRenderer.contents[0].shelfRenderer.content.gridRenderer.items;
        const videoArr = contentArr.map(({ gridVideoRenderer }: any) => gridVideoRenderer);

        return {
            content: videoArr,
            continuation: res.continuations[0]
        }
    }
}

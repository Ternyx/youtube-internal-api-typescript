import FeedExtractor, { ParserResponse } from "./feedExtractor";
import User from '../user';
import nodeFetch from 'node-fetch';

interface SubscriptionFeedOptions {
    user: User;
    findInitialDataFromHtml?: boolean;
    fetch?: typeof nodeFetch;
}


// TODO proper response types
export default class SubscriptionFeed extends FeedExtractor<any> {
    constructor(options: SubscriptionFeedOptions) {
        super({
            baseUrl: 'https://www.youtube.com/feed/subscriptions?flow=1',
            ...options
        });
    }

    parse(text: string, iteration?: number): ParserResponse<any> {
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
        
        const keySet = ['videoId', 'thumbnail', 'title', 'shortBylineText'];
        const contentArr = res.contents[0].itemSectionRenderer.contents[0].shelfRenderer.content.gridRenderer.items;

        const videoArr = contentArr
            .map(({ gridVideoRenderer }: any) => keySet.reduce((obj: any, key) => {
                if (gridVideoRenderer[key]) {
                    obj[key] = gridVideoRenderer[key];
                } else {
                    console.debug(`Missing key${key}`);
                }
                return obj;
            }, {}));


        return {
            content: videoArr,
            continuation: res.continuations[0]
        }
    }
}
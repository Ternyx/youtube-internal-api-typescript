"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feedExtractor_1 = __importDefault(require("./feedExtractor"));
class SubscriptionFeed extends feedExtractor_1.default {
    constructor(options) {
        super(Object.assign({ baseUrl: 'https://www.youtube.com/feed/subscriptions?flow=1' }, options));
    }
    parse(text) {
        const json = JSON.parse(text);
        let res;
        if (Array.isArray(json)) {
            if (!json[1].response) {
                return { content: [], continuation: undefined };
            }
            res = json[1].response.continuationContents.sectionListContinuation;
        }
        else {
            const cont = json.contents;
            const columnBrowswer = cont.twoColumnBrowseResultsRenderer || cont.singleColumnBrowseResultsRenderer;
            res = columnBrowswer.tabs[0].tabRenderer.content.sectionListRenderer;
        }
        const contentArr = res.contents[0].itemSectionRenderer.contents[0].shelfRenderer.content.gridRenderer.items;
        const videoArr = contentArr.map(({ gridVideoRenderer }) => gridVideoRenderer);
        return {
            content: videoArr,
            continuation: res.continuations[0]
        };
    }
}
exports.default = SubscriptionFeed;

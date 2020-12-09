"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionFeed = exports.VideoExtractor = exports.User = void 0;
const user_1 = __importDefault(require("./user"));
exports.User = user_1.default;
const videoExtractor_1 = __importDefault(require("./video/videoExtractor"));
exports.VideoExtractor = videoExtractor_1.default;
const subscriptionFeed_1 = __importDefault(require("./feeds/subscriptionFeed"));
exports.SubscriptionFeed = subscriptionFeed_1.default;
function youtubeUser({ userCookieString }) {
    const user = new user_1.default(userCookieString);
    const videoExtractor = new videoExtractor_1.default({ user });
    const subscriptionFeed = new subscriptionFeed_1.default({ user });
    return {
        user,
        videoExtractor,
        subscriptionFeed
    };
}
exports.default = youtubeUser;
__exportStar(require("./user"), exports);
__exportStar(require("./video/videoExtractor"), exports);
__exportStar(require("./feeds/subscriptionFeed"), exports);

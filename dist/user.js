"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(cookieString) {
        this.headers = {
            'Cookie': User.validateCookieString(cookieString)
        };
    }
    static validateCookieString(cookieString) {
        const COOKIE_REGEX = /(?:APISID|SAPISID)=[\w/]+/g;
        if (!COOKIE_REGEX.test(cookieString)) {
            throw new Error("Invalid cookie string");
        }
        return cookieString;
    }
}
exports.default = User;

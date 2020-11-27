export default class User {
    headers: { [key: string]: string };

    constructor(cookieString: string) {
        this.headers = {
            'Cookie': User.validateCookieString(cookieString)
        }
    }

    private static validateCookieString(cookieString: string): string {
        const COOKIE_REGEX = /(?:APISID|SAPISID)=[\w/]+/g;

        if (!COOKIE_REGEX.test(cookieString)) {
            throw new Error("Invalid cookie string");
        }
        return cookieString;
    }
}

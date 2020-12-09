export default class User {
    headers: {
        [key: string]: string;
    };
    constructor(cookieString: string);
    private static validateCookieString;
}

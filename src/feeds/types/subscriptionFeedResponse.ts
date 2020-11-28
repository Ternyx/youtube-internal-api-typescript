export interface Thumbnail2 {
    url: string;
    width: number;
    height: number;
}

export interface Thumbnail {
    thumbnails: Thumbnail2[];
}

export interface Run {
    text: string;
}

export interface AccessibilityData {
    label: string;
}

export interface Accessibility {
    accessibilityData: AccessibilityData;
}

export interface Title {
    runs: Run[];
    accessibility: Accessibility;
}

export interface WebCommandMetadata {
    url: string;
    webPageType: string;
    rootVe: number;
}

export interface CommandMetadata {
    webCommandMetadata: WebCommandMetadata;
}

export interface BrowseEndpoint {
    browseId: string;
    canonicalBaseUrl: string;
}

export interface NavigationEndpoint {
    clickTrackingParams: string;
    commandMetadata: CommandMetadata;
    browseEndpoint: BrowseEndpoint;
}

export interface Run2 {
    text: string;
    navigationEndpoint: NavigationEndpoint;
}

export interface ShortBylineText {
    runs: Run2[];
}

export interface SubscriptionFeedResponse {
    videoId: string;
    thumbnail: Thumbnail;
    title: Title;
    shortBylineText: ShortBylineText;
}

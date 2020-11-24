// not 100% accurate, many fields are optional

export interface Attrs {
    id: string;
}

export interface MiniplayerRenderer {
    playbackMode: string;
}

export interface Miniplayer {
    miniplayerRenderer: MiniplayerRenderer;
}

export interface PlayabilityStatus {
    status: string;
    playableInEmbed: boolean;
    miniplayer: Miniplayer;
    contextParams: string;
}

export interface Format {
    itag: number;
    url: string;
    mimeType: string;
    bitrate: number;
    width: number;
    height: number;
    lastModified: string;
    contentLength: string;
    quality: string;
    fps: number;
    qualityLabel: string;
    projectionType: string;
    averageBitrate: number;
    audioQuality: string;
    approxDurationMs: string;
    audioSampleRate: string;
    audioChannels: number;
}

export interface InitRange {
    start: string;
    end: string;
}

export interface IndexRange {
    start: string;
    end: string;
}

export interface ColorInfo {
    primaries: string;
    transferCharacteristics: string;
    matrixCoefficients: string;
}

export interface AdaptiveFormat {
    itag: number;
    url: string;
    mimeType: string;
    bitrate: number;
    width: number;
    height: number;
    initRange: InitRange;
    indexRange: IndexRange;
    lastModified: string;
    contentLength: string;
    quality: string;
    fps: number;
    qualityLabel: string;
    projectionType: string;
    averageBitrate: number;
    approxDurationMs: string;
    colorInfo: ColorInfo;
    highReplication?: boolean;
    audioQuality: string;
    audioSampleRate: string;
    audioChannels?: number;
    loudnessDb?: number;
}

export interface StreamingData {
    expiresInSeconds: string;
    formats: Format[];
    adaptiveFormats: AdaptiveFormat[];
    dashFormats: string;
}

export interface PlayerCaptionsRenderer {
    baseUrl: string;
    visibility: string;
}

export interface Name {
    simpleText: string;
}

export interface CaptionTrack {
    baseUrl: string;
    name: Name;
    vssId: string;
    languageCode: string;
    kind: string;
    isTranslatable: boolean;
}

export interface AudioTrack {
    captionTrackIndices: number[];
}

export interface LanguageName {
    simpleText: string;
}

export interface TranslationLanguage {
    languageCode: string;
    languageName: LanguageName;
}

export interface PlayerCaptionsTracklistRenderer {
    captionTracks: CaptionTrack[];
    audioTracks: AudioTrack[];
    translationLanguages: TranslationLanguage[];
    defaultAudioTrackIndex: number;
}

export interface Captions {
    playerCaptionsRenderer: PlayerCaptionsRenderer;
    playerCaptionsTracklistRenderer: PlayerCaptionsTracklistRenderer;
}

export interface Thumbnail2 {
    url: string;
    width: number;
    height: number;
}

export interface Thumbnail {
    thumbnails: Thumbnail2[];
}

export interface VideoDetails {
    videoId: string;
    title: string;
    lengthSeconds: string;
    channelId: string;
    isOwnerViewing: boolean;
    shortDescription: string;
    isCrawlable: boolean;
    thumbnail: Thumbnail;
    averageRating: number;
    allowRatings: boolean;
    viewCount: string;
    author: string;
    isPrivate: boolean;
    isUnpluggedCorpus: boolean;
    isLiveContent: boolean;
}

export interface AudioConfig {
    loudnessDb: number;
    perceptualLoudnessDb: number;
    enablePerFormatLoudness: boolean;
}

export interface StreamSelectionConfig {
    maxBitrate: string;
}

export interface DaiConfig {
    enableServerStitchedDai: boolean;
}

export interface DynamicReadaheadConfig {
    maxReadAheadMediaTimeMs: number;
    minReadAheadMediaTimeMs: number;
    readAheadGrowthRateMs: number;
}

export interface MediaCommonConfig {
    dynamicReadaheadConfig: DynamicReadaheadConfig;
}

export interface WebCommandMetadata {
    url: string;
    sendPost: boolean;
    apiUrl: string;
}

export interface CommandMetadata {
    webCommandMetadata: WebCommandMetadata;
}

export interface WebPlayerShareEntityServiceEndpoint {
    serializedShareEntity: string;
}

export interface GetSharePanelCommand {
    clickTrackingParams: string;
    commandMetadata: CommandMetadata;
    webPlayerShareEntityServiceEndpoint: WebPlayerShareEntityServiceEndpoint;
}

export interface WebCommandMetadata2 {
    url: string;
    sendPost: boolean;
    apiUrl: string;
}

export interface CommandMetadata2 {
    webCommandMetadata: WebCommandMetadata2;
}

export interface SubscribeEndpoint {
    channelIds: string[];
    params: string;
}

export interface SubscribeCommand {
    clickTrackingParams: string;
    commandMetadata: CommandMetadata2;
    subscribeEndpoint: SubscribeEndpoint;
}

export interface WebCommandMetadata3 {
    url: string;
    sendPost: boolean;
    apiUrl: string;
}

export interface CommandMetadata3 {
    webCommandMetadata: WebCommandMetadata3;
}

export interface UnsubscribeEndpoint {
    channelIds: string[];
    params: string;
}

export interface UnsubscribeCommand {
    clickTrackingParams: string;
    commandMetadata: CommandMetadata3;
    unsubscribeEndpoint: UnsubscribeEndpoint;
}

export interface WebCommandMetadata4 {
    url: string;
    sendPost: boolean;
    apiUrl: string;
}

export interface CommandMetadata4 {
    webCommandMetadata: WebCommandMetadata4;
}

export interface Action {
    addedVideoId: string;
    action: string;
}

export interface PlaylistEditEndpoint {
    playlistId: string;
    actions: Action[];
}

export interface AddToWatchLaterCommand {
    clickTrackingParams: string;
    commandMetadata: CommandMetadata4;
    playlistEditEndpoint: PlaylistEditEndpoint;
}

export interface WebCommandMetadata5 {
    url: string;
    sendPost: boolean;
    apiUrl: string;
}

export interface CommandMetadata5 {
    webCommandMetadata: WebCommandMetadata5;
}

export interface Action2 {
    action: string;
    removedVideoId: string;
}

export interface PlaylistEditEndpoint2 {
    playlistId: string;
    actions: Action2[];
}

export interface RemoveFromWatchLaterCommand {
    clickTrackingParams: string;
    commandMetadata: CommandMetadata5;
    playlistEditEndpoint: PlaylistEditEndpoint2;
}

export interface WebPlayerActionsPorting {
    getSharePanelCommand: GetSharePanelCommand;
    subscribeCommand: SubscribeCommand;
    unsubscribeCommand: UnsubscribeCommand;
    addToWatchLaterCommand: AddToWatchLaterCommand;
    removeFromWatchLaterCommand: RemoveFromWatchLaterCommand;
}

export interface WebPlayerConfig {
    webPlayerActionsPorting: WebPlayerActionsPorting;
}

export interface PlayerConfig {
    audioConfig: AudioConfig;
    streamSelectionConfig: StreamSelectionConfig;
    daiConfig: DaiConfig;
    mediaCommonConfig: MediaCommonConfig;
    webPlayerConfig: WebPlayerConfig;
}

export interface Thumbnail3 {
    url: string;
    width: number;
    height: number;
}

export interface Icon {
    thumbnails: Thumbnail3[];
}

export interface Run {
    text: string;
}

export interface MessageText {
    runs: Run[];
}

export interface Run2 {
    text: string;
}

export interface Text {
    runs: Run2[];
}

export interface WebCommandMetadata6 {
    url: string;
    sendPost: boolean;
    apiUrl: string;
}

export interface CommandMetadata6 {
    webCommandMetadata: WebCommandMetadata6;
}

export interface UiActions {
    hideEnclosingContainer: boolean;
}

export interface FeedbackEndpoint {
    feedbackToken: string;
    uiActions: UiActions;
}

export interface ServiceEndpoint {
    clickTrackingParams: string;
    commandMetadata: CommandMetadata6;
    feedbackEndpoint: FeedbackEndpoint;
}

export interface WebCommandMetadata7 {
    url: string;
    webPageType: string;
    rootVe: number;
}

export interface CommandMetadata7 {
    webCommandMetadata: WebCommandMetadata7;
}

export interface BrowseEndpoint {
    browseId: string;
    params: string;
}

export interface NavigationEndpoint {
    clickTrackingParams: string;
    commandMetadata: CommandMetadata7;
    browseEndpoint: BrowseEndpoint;
}

export interface ButtonRenderer {
    style: string;
    size: string;
    text: Text;
    serviceEndpoint: ServiceEndpoint;
    navigationEndpoint: NavigationEndpoint;
    trackingParams: string;
}

export interface ActionButton {
    buttonRenderer: ButtonRenderer;
}

export interface Run3 {
    text: string;
}

export interface Text2 {
    runs: Run3[];
}

export interface WebCommandMetadata8 {
    url: string;
    sendPost: boolean;
    apiUrl: string;
}

export interface CommandMetadata8 {
    webCommandMetadata: WebCommandMetadata8;
}

export interface UiActions2 {
    hideEnclosingContainer: boolean;
}

export interface FeedbackEndpoint2 {
    feedbackToken: string;
    uiActions: UiActions2;
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string;
    commandMetadata: CommandMetadata8;
    feedbackEndpoint: FeedbackEndpoint2;
}

export interface ButtonRenderer2 {
    style: string;
    size: string;
    text: Text2;
    serviceEndpoint: ServiceEndpoint2;
    trackingParams: string;
}

export interface DismissButton {
    buttonRenderer: ButtonRenderer2;
}

export interface WebCommandMetadata9 {
    url: string;
    sendPost: boolean;
    apiUrl: string;
}

export interface CommandMetadata9 {
    webCommandMetadata: WebCommandMetadata9;
}

export interface UiActions3 {
    hideEnclosingContainer: boolean;
}

export interface FeedbackEndpoint3 {
    feedbackToken: string;
    uiActions: UiActions3;
}

export interface ImpressionEndpoint {
    clickTrackingParams: string;
    commandMetadata: CommandMetadata9;
    feedbackEndpoint: FeedbackEndpoint3;
}

export interface Run4 {
    text: string;
}

export interface MessageTitle {
    runs: Run4[];
}

export interface MealbarPromoRenderer {
    icon: Icon;
    messageTexts: MessageText[];
    actionButton: ActionButton;
    dismissButton: DismissButton;
    triggerCondition: string;
    style: string;
    trackingParams: string;
    impressionEndpoints: ImpressionEndpoint[];
    isVisible: boolean;
    messageTitle: MessageTitle;
}

export interface Message {
    mealbarPromoRenderer: MealbarPromoRenderer;
}

export interface PlayerResponse {
    playabilityStatus: PlayabilityStatus;
    streamingData: StreamingData;
    captions: Captions;
    videoDetails: VideoDetails;
    playerConfig: PlayerConfig;
    trackingParams: string;
    messages: Message[];
}

export interface Args {
    enablecsi: string;
    c: string;
    enablejsapi: string;
    use_miniplayer_ui: string;
    external_fullscreen: boolean;
    cr: string;
    gapi_hint_params: string;
    innertube_api_key: string;
    cos: string;
    transparent_background: string;
    show_miniplayer_button: string;
    hl: string;
    player_response: PlayerResponse;
    innertube_context_client_version: string;
    host_language: string;
    watermark: string;
    ps: string;
    loaderUrl: string;
    csi_page_type: string;
    vss_host: string;
    innertube_api_version: string;
    use_fast_sizing_on_watch_default: boolean;
    cver: string;
}

export interface Assets {
    js: string;
    css: string;
    player_canary_state: string;
}

export default interface YoutubePlayerConfig {
    attrs?: Attrs;
    args: Args;
    assets?: Assets;
}

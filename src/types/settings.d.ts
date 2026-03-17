export interface Settings {
    // input settings
    main_domain: string
    news_rss_feed: string

    // checkbox settings
    inject_css?: boolean

    launcher_module?: boolean
    launcher_module_shortcut?: boolean

    news_search_module?: boolean
    recents_list_module?: boolean

    record_post_history?: boolean
    record_setting_active?: boolean

    // typescript likes to do its own thing sometimes
    [key: string]: string | boolean | undefined
}

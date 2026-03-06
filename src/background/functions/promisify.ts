export const get_tabs_async = (opts: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> => {
    return new Promise<chrome.tabs.Tab[]>((resolve, reject) => {
        try {
            chrome.tabs.query(opts, tabs => {
                resolve(tabs)
            })
        } catch (err) {
            reject(err)
        }
    })
}

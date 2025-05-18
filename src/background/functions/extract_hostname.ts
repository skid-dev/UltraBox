export function extract_hostnames(
    current_tab_url: string,
    main_domain: string | undefined
): { current_domain?: string; main_domain_hostname?: string; is_homepage?: boolean } {
    let current_domain: string | undefined
    let main_domain_hostname: string | undefined
    let is_homepage: boolean

    let urlObj: URL
    try {
        urlObj = new URL(current_tab_url)
        current_domain = urlObj.hostname
    } catch (e) {
        console.error("Invalid tab URL, cannot extract hostname:", current_tab_url, e)
        return {}
    }

    if (!main_domain) return {}

    try {
        const domain_to_parse =
            main_domain.startsWith("http://") || main_domain.startsWith("https://")
                ? main_domain
                : `http://${main_domain}`
        main_domain_hostname = new URL(domain_to_parse).hostname
    } catch (e) {
        console.error("Invalid main_domain format in settings:", main_domain, e)
        return {}
    }

    // Check if the current page is the homepage (root page)
    is_homepage = urlObj.pathname === "/" || urlObj.pathname === ""

    return { current_domain, main_domain_hostname, is_homepage }
}

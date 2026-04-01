import type { Settings } from "../../../types/settings"
import { extract_hostnames } from "../extract_hostname"

// promisify getting settings from storagesync
export const get_stored_settings = (): Promise<Settings | undefined> =>
    new Promise(resolve => {
        chrome.storage.sync.get("settings", result => {
            resolve(result.settings as Settings | undefined)
        })
    })

export async function check_in_schoolbox_domain(current_url: string): Promise<boolean> {
    const user_settings = await get_stored_settings()
    if (!user_settings?.main_domain) return false

    // check if the current url is the users schoolbox domain
    const { current_domain, main_domain_hostname } = extract_hostnames(
        current_url,
        user_settings.main_domain
    )
    if (!main_domain_hostname || current_domain !== main_domain_hostname) {
        return false
    }

    return true
}

export async function is_page(current_url: string, target_url_path: string): Promise<boolean> {
    const in_schoolbox_domain = await check_in_schoolbox_domain(current_url)
    if (!in_schoolbox_domain) return false

    // if the current url path includes the target url path, return true
    const current_url_path = new URL(current_url).pathname
    return (
        (current_url_path.endsWith("/") ? current_url_path : current_url_path + "/") ===
        (target_url_path.endsWith("/") ? target_url_path : target_url_path + "/")
    )
}

export async function url_begins_with(
    current_url: string,
    target_url_path: string
): Promise<boolean> {
    const in_schoolbox_domain = await check_in_schoolbox_domain(current_url)
    if (!in_schoolbox_domain) return false

    // if the current url path includes the target url path, return true
    const current_url_path = new URL(current_url).pathname
    return (current_url_path.endsWith("/") ? current_url_path : current_url_path + "/").startsWith(
        target_url_path.endsWith("/") ? target_url_path : target_url_path + "/"
    )
}

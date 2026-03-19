import { get_news_item } from "../../../storage/get"
import { get_revision } from "../../../storage/revisions/revision_get"
import { remove_null_revisions } from "../../../storage/revisions/revision_set"
import { RevisionHistoryEntry } from "../../../types/rev_history"

async function fetch_versions(guid: string): Promise<RevisionHistoryEntry[]> {
    // get the url of the post without fragments / query params
    const url = new URL(guid)
    url.hash = ""
    url.search = ""

    const base_guid = url.toString()

    // get the item from local storage
    const news_item = await get_news_item("news", base_guid)

    if (!news_item || !news_item.rev_history_uuids) {
        console.log("No news item found for guid:", base_guid)
        return []
    }

    let revisions: RevisionHistoryEntry[] = []

    for (let rev_id of news_item.rev_history_uuids) {
        const data = await get_revision(rev_id)
        if (!data) {
            console.log("Null pointer for revision id:", rev_id)
            await remove_null_revisions(base_guid)
            continue
        }
        revisions.push(data)
    }
    return revisions
}

function create_diff_elements(rev: RevisionHistoryEntry): HTMLDivElement {
    const parent_div = document.createElement("div")
    parent_div.classList.add("ub-diff-container")

    const add_div = document.createElement("div")
    add_div.classList.add("ub-diff-add")
    add_div.textContent = `+${rev.diff_new_size}`

    const modify_div = document.createElement("div")
    modify_div.classList.add("ub-diff-modify")
    modify_div.textContent = `~${rev.diff_modified_size}`

    const delete_div = document.createElement("div")
    delete_div.classList.add("ub-diff-delete")
    delete_div.textContent = `-${rev.diff_delete_size}`

    parent_div.appendChild(add_div)
    parent_div.appendChild(modify_div)
    parent_div.appendChild(delete_div)

    return parent_div
}

function format_timestamp(timestamp: number): string {
    const time = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(timestamp))
    return time.toString()
}

export async function setup(): Promise<void> {
    const news_row_elem = document.querySelector(".news-post")

    const history_div = document.createElement("div")
    history_div.id = "ultrabox-history-container"

    news_row_elem?.appendChild(history_div)

    const revisions = await fetch_versions(window.location.href)

    const history_div_title = document.createElement("div")
    history_div_title.id = "ub-history-title"
    history_div_title.textContent = "Edit History"
    history_div.appendChild(history_div_title)

    if (revisions.length === 0) {
        history_div.innerHTML += "<i>No edit history found for this post.</i>"
        return
    }

    // sort revisions to most recent first
    revisions.sort((a, b) => b.update_timestamp - a.update_timestamp)

    // most recent version first (top)
    for (let i = 0; i < revisions.length; i++) {
        const rev = revisions[i]
        const rev_wrapper = document.createElement("div")
        rev_wrapper.classList.add("ultrabox-revision-wrapper")

        const timestamp = format_timestamp(rev.update_timestamp)
        const title_elem = document.createElement("div")
        title_elem.classList.add("ub-rev-title")
        title_elem.textContent = timestamp.toString()
        rev_wrapper.appendChild(title_elem)

        // show current version text for the most recent revision
        if (i === 0) {
            rev_wrapper.classList.add("ub-revision-current")

            const latest_span = document.createElement("div")
            latest_span.classList.add("ub-latest-span")
            latest_span.textContent = "Current version"
            rev_wrapper.appendChild(latest_span)
        }

        const diff_elem = create_diff_elements(rev)

        const view_text_button = document.createElement("button")
        view_text_button.classList.add("ub-view-text-button")
        if (i !== 0) {
            view_text_button.textContent = "[View this version]"
            view_text_button.setAttribute("data-rev-id", revisions[i - 1].rev_id)
            view_text_button.addEventListener("click", on_click)
            diff_elem.appendChild(view_text_button)
        }

        rev_wrapper.appendChild(diff_elem)
        history_div.appendChild(rev_wrapper)
    }

    // create the element for the "initial version"
    const initial_wrapper = document.createElement("div")
    initial_wrapper.classList.add("ultrabox-revision-wrapper")

    const title_elem = document.createElement("div")
    title_elem.classList.add("ub-rev-title")
    title_elem.textContent = "Initial creation"
    initial_wrapper.appendChild(title_elem)

    const view_text_button = document.createElement("button")
    view_text_button.classList.add("ub-view-text-button")
    view_text_button.textContent = "[View initial]"
    view_text_button.setAttribute("data-rev-id", revisions[revisions.length - 1].rev_id)
    view_text_button.addEventListener("click", on_click)
    initial_wrapper.appendChild(view_text_button)

    history_div.appendChild(initial_wrapper)

    news_row_elem?.appendChild(history_div)
}

async function on_click(ev: MouseEvent): Promise<void> {
    let target = ev.target as HTMLElement
    const rev_id = target.getAttribute("data-rev-id")

    if (!rev_id) {
        console.error("Revision ID not found on button")
        return
    }

    const revision = await get_revision(rev_id)

    const news_elem = document.querySelector(".content article")
    if (!news_elem) {
        console.error("News article element not found")
        return
    }

    // TODO: Fix xss vulnerability here by sanitizing the content before inserting into the page
    const content = (revision?.data.content ?? "").replace(/^\s*<img[^>]*>/i, "")
    news_elem.innerHTML = content

    if (!revision) {
        console.error("Revision data not found for rev ID:", rev_id)
        return
    }
}

import { get_news_item } from "../../../storage/get"
import { get_revision } from "../../../storage/revisions/revision_get"
import { remove_null_revisions } from "../../../storage/revisions/revision_set"
import { RevisionHistoryEntry } from "../../../types/rev_history"
import { Diff } from "@ali-tas/htmldiff-js"

const differ_instance = differ()

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

function setup_history_sticky(history_div: HTMLDivElement, history_anchor: HTMLDivElement): void {
    if (history_div.dataset.stickyInitialized === "true") {
        return
    }

    history_div.dataset.stickyInitialized = "true"
    const sticky_top_offset = 28

    let frame_pending = false

    const update_position = () => {
        frame_pending = false

        const anchor_rect = history_anchor.getBoundingClientRect()

        if (anchor_rect.top <= sticky_top_offset) {
            history_anchor.style.height = `${history_div.offsetHeight}px`
            history_div.classList.add("ub-history-fixed")
            history_div.style.left = `${anchor_rect.left}px`
            history_div.style.width = `${anchor_rect.width}px`
            history_div.style.top = `${sticky_top_offset}px`
            return
        }

        history_anchor.style.height = ""
        history_div.classList.remove("ub-history-fixed")
        history_div.style.left = ""
        history_div.style.top = ""
        history_div.style.width = ""
    }

    const request_update = () => {
        if (frame_pending) {
            return
        }

        frame_pending = true
        window.requestAnimationFrame(update_position)
    }

    document.addEventListener("scroll", request_update, true)
    window.addEventListener("resize", request_update)
    window.addEventListener("load", request_update)
    request_update()
}

function create_view_button({
    rev_id,
    button_text,
    callback_fnc,
}: {
    rev_id: string
    button_text?: string
    callback_fnc: ((ev: MouseEvent) => Promise<void>) | ((ev: MouseEvent) => void)
}): HTMLButtonElement {
    const view_text_button = document.createElement("button")
    view_text_button.classList.add("ub-view-text-button")
    view_text_button.textContent = button_text ?? "View"
    view_text_button.setAttribute("data-rev-id", rev_id)
    view_text_button.addEventListener("click", callback_fnc)

    return view_text_button
}

export async function setup(): Promise<void> {
    const news_row_elem = document.querySelector(".news-post")
    if (!(news_row_elem instanceof HTMLElement)) {
        return
    }

    // setup the container elements
    const history_anchor = document.createElement("div")
    history_anchor.id = "ultrabox-history-anchor"

    const history_div = document.createElement("div")
    history_div.id = "ultrabox-history-container"
    history_anchor.appendChild(history_div)

    // setup the diff status display
    const diff_status_display = document.createElement("div")
    diff_status_display.id = "ub-diff-status-display"
    diff_status_display.style.display = "none"
    differ_instance.set_status_display(diff_status_display)
    history_div.appendChild(diff_status_display)

    news_row_elem.appendChild(history_anchor)

    // populate revision history list
    const edit_history_list_container = document.createElement("div")
    edit_history_list_container.id = "ub-edit-history-list-container"
    history_div.appendChild(edit_history_list_container)

    const revisions = await fetch_versions(window.location.href)

    const history_div_title = document.createElement("div")
    history_div_title.id = "ub-history-title"
    history_div_title.textContent = "Edit History"
    edit_history_list_container.appendChild(history_div_title)

    if (revisions.length === 0) {
        edit_history_list_container.innerHTML += "<i>No edit history found for this post.</i>"
        setup_history_sticky(history_div, history_anchor)
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
        let view_text_button: HTMLButtonElement
        var view_text_diff_button: HTMLButtonElement | null = null

        if (i !== 0) {
            view_text_button = create_view_button({
                rev_id: revisions[i - 1].rev_id,
                callback_fnc: view_text_raw,
            })
            view_text_diff_button = create_view_button({
                rev_id: revisions[i - 1].rev_id,
                button_text: "Diff",
                callback_fnc: view_text_diff,
            })
        } else {
            // reloading the page to show the current version
            // lazy shortcut to avoid having to implement a separate function to fetch the current version's content
            view_text_button = create_view_button({
                rev_id: rev.rev_id,
                button_text: "View latest",
                callback_fnc: () => {
                    window.location.reload()
                },
            })
        }

        diff_elem.appendChild(view_text_button)
        if (view_text_diff_button) {
            diff_elem.appendChild(view_text_diff_button)
        }

        rev_wrapper.appendChild(diff_elem)
        edit_history_list_container.appendChild(rev_wrapper)
    }

    // create the element for the "initial version"
    const initial_wrapper = document.createElement("div")
    initial_wrapper.classList.add("ultrabox-revision-wrapper")

    const title_elem = document.createElement("div")
    title_elem.classList.add("ub-rev-title")
    title_elem.textContent = "Initial creation"
    initial_wrapper.appendChild(title_elem)

    const buttons_wrapper = document.createElement("div")
    buttons_wrapper.classList.add("ub-initial-buttons")

    buttons_wrapper.appendChild(
        create_view_button({
            rev_id: revisions[revisions.length - 1].rev_id,
            button_text: "View initial",
            callback_fnc: view_text_raw,
        })
    )

    buttons_wrapper.appendChild(
        create_view_button({
            rev_id: revisions[revisions.length - 1].rev_id,
            button_text: "Diff",
            callback_fnc: view_text_diff,
        })
    )

    initial_wrapper.appendChild(buttons_wrapper)
    edit_history_list_container.appendChild(initial_wrapper)
    setup_history_sticky(history_div, history_anchor)
}

// date is unix timestamp in milliseconds
async function show_warning(date: number): Promise<void> {
    // add some text that tells the user they're viewing an old version
    const insert_before = document.querySelector(".banner.content")
    if (!insert_before) {
        console.error("Insert before element not found")
        return
    }

    const warning_div =
        document.querySelector("#ub-old-version-warning") ?? document.createElement("div")
    warning_div.id = "ub-old-version-warning"

    const version_time = format_timestamp(date)

    warning_div.textContent = `You are viewing a previous version of this post captured on ${version_time}.`

    insert_before.parentNode?.insertBefore(warning_div, insert_before)
}

function clean_html(raw: string): string {
    return raw.replace(/^\s*<img[^>]*>/i, "")
}

async function view_text_raw(ev: MouseEvent): Promise<void> {
    let target = ev.target as HTMLElement
    const rev_id = target.getAttribute("data-rev-id")

    if (!rev_id) {
        console.error("Revision ID not found on button")
        return
    }

    const revision = await get_revision(rev_id)

    if (!revision) {
        console.error("Revision data not found for rev ID:", rev_id)
        return
    }

    const news_elem = document.querySelector(".content article")
    if (!news_elem) {
        console.error("News article element not found")
        return
    }

    // TODO: Fix xss vulnerability here by sanitizing the content before inserting into the page
    const content = clean_html(revision.data.content ?? "")
    news_elem.innerHTML = content
    differ_instance.hide_status_display()
    show_warning(revision.update_timestamp)
}

async function view_text_diff(ev: MouseEvent): Promise<void> {
    const target = ev.target as HTMLElement
    const rev_id = target.getAttribute("data-rev-id")
    if (!rev_id) {
        console.error("Revision ID not found on button")
        return
    }

    const revision = await get_revision(rev_id)
    if (!revision) {
        console.error("Revision data not found for rev ID:", rev_id)
        return
    }

    const news_elem = document.querySelector(".content article") as HTMLDivElement
    if (!news_elem) {
        console.error("News article element not found")
        return
    }

    differ_instance.set_left(clean_html(revision.data.content), revision.update_timestamp)
    if (!differ_instance.right) {
        const post = await get_news_item("news", revision.parent_guid)
        if (!post) return
        differ_instance.set_right(clean_html(post.content), -1)
    }

    differ_instance.render(news_elem)
    differ_instance.show_status_display()
    show_warning(revision.update_timestamp)
}

interface Differ {
    left: string
    right: string
    set_left: (rev_id: string, date: number) => void
    set_right: (rev_id: string, date: number) => void
    set_status_display: (element: HTMLDivElement) => void
    show_status_display: () => void
    hide_status_display: () => void
    render: (element: HTMLDivElement) => void
}

// TODO: Move this into its own file.
function differ(): Differ {
    let left = ""
    let right = ""

    let left_date: number | null = null
    let right_date: number | null = null

    let status_display: HTMLDivElement | null = null

    function set_left(rev: string, date: number): void {
        left = rev
        left_date = date
    }

    function set_right(rev: string, date: number): void {
        right = rev
        right_date = date
    }

    function __update_status(): void {
        if (!status_display || left_date === null || right_date === null) {
            return
        }

        status_display.innerHTML = "<b id='ub-diff-title'>Viewing Diff</b>"

        const diff_versions_display = document.createElement("div")
        diff_versions_display.id = "ub-diff-versions-display"

        const left_status = document.createElement("div")
        left_status.textContent = left_date === -1 ? "Current" : format_timestamp(left_date)

        const right_status = document.createElement("div")
        right_status.textContent = right_date === -1 ? "Current" : format_timestamp(right_date)

        const center_icon = document.createElement("div")
        center_icon.textContent = "↔"

        diff_versions_display.appendChild(left_status)
        diff_versions_display.appendChild(center_icon)
        diff_versions_display.appendChild(right_status)

        status_display.appendChild(diff_versions_display)
    }

    function set_status_display(element: HTMLDivElement): void {
        status_display = element
    }

    function show_status_display(): void {
        if (status_display) {
            status_display.style.display = "block"
        }
    }

    function hide_status_display(): void {
        if (status_display) {
            status_display.style.display = "none"
        }
    }

    function render(element: HTMLDivElement): void {
        // TODO: Fix xss maybe?
        element.innerHTML = Diff.execute(left, right)
        __update_status()
    }

    return {
        left,
        right,
        set_left,
        set_right,
        set_status_display,
        show_status_display,
        hide_status_display,
        render,
    }
}

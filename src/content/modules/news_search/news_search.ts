type NewsItem = {
    elem: HTMLLIElement
    category_string?: string | null
}

let news_tabs_categories: string[] = []
const news_tabs_wrapper = document.querySelector("#news-component dl")
let news_items: NewsItem[] = []

function collect_news_categories(): void {
    news_tabs_categories = Array.from(document.querySelectorAll(".tabs dd>a")).map(i => {
        return (i as HTMLAnchorElement).innerText.trim()
    })
}

function collect_news_items(): void {
    news_items = Array.from(
        document.querySelectorAll(".information-list .actions-small-1")
    ).map(elem => {
        return {
            elem: elem as HTMLLIElement,
            category_string: elem.querySelector(`a[href^="/news?topic"]`)?.textContent?.trim() ?? null,
        }
    })
}

collect_news_categories()

let current_category = "All"
let active_category_index = -1
let is_keyboard_navigation_active = false

const news_search_autocomplete = document.createElement("div")
news_search_autocomplete.id = "ultrabox-news-search-autocomplete"
news_search_autocomplete.setAttribute("role", "listbox")
document.body.appendChild(news_search_autocomplete)

function get_matching_categories(search_term: string): string[] {
    return news_tabs_categories.filter(cat => cat.toLowerCase().includes(search_term))
}

function get_autocomplete_items(): HTMLElement[] {
    return Array.from(
        news_search_autocomplete.getElementsByClassName(
            "ultrabox-news-search-autocomplete-item"
        )
    ) as HTMLElement[]
}

function set_keyboard_navigation_active(is_active: boolean): void {
    is_keyboard_navigation_active = is_active
    news_search_autocomplete.classList.toggle(
        "ultrabox-news-search-autocomplete-keyboard-active",
        is_keyboard_navigation_active
    )
}

function clear_active_category(): void {
    get_autocomplete_items().forEach(item => {
        item.classList.remove("ultrabox-news-search-autocomplete-item-active")
        item.removeAttribute("aria-selected")
    })

    active_category_index = -1
}

function set_active_category(index: number): boolean {
    const items = get_autocomplete_items()

    if (items.length === 0) {
        clear_active_category()
        return false
    }

    const normalized_index = ((index % items.length) + items.length) % items.length

    items.forEach((item, current_index) => {
        if (current_index === normalized_index) {
            item.classList.add("ultrabox-news-search-autocomplete-item-active")
            item.setAttribute("aria-selected", "true")
        } else {
            item.classList.remove("ultrabox-news-search-autocomplete-item-active")
            item.removeAttribute("aria-selected")
        }
    })

    active_category_index = normalized_index
    return true
}

function move_active_category(delta: number): boolean {
    const items = get_autocomplete_items()

    if (items.length === 0) {
        clear_active_category()
        return false
    }

    set_keyboard_navigation_active(true)

    if (active_category_index === -1) {
        return set_active_category(delta > 0 ? 0 : items.length - 1)
    }

    return set_active_category(active_category_index + delta)
}

function get_active_category(): string | null {
    const items = get_autocomplete_items()
    const active_item =
        active_category_index >= 0 && active_category_index < items.length
            ? items[active_category_index]
            : null

    return active_item?.dataset.category ?? null
}

function hide_category_dropdown(): void {
    news_search_autocomplete.innerHTML = ""
    news_search_autocomplete.style.display = "none"
    set_keyboard_navigation_active(false)
    clear_active_category()
}

function position_category_dropdown(search_input: HTMLInputElement): void {
    const rect = search_input.getBoundingClientRect()
    news_search_autocomplete.style.position = "absolute"
    news_search_autocomplete.style.left = `${rect.left}px`
    news_search_autocomplete.style.top = `${rect.bottom + window.scrollY}px`
}

function select_category(
    category: string,
    search_input: HTMLInputElement,
    category_display: HTMLDivElement
): void {
    category_display.innerText = category
    current_category = category
    search_input.value = ""
    hide_category_dropdown()
    update_results(category, null)
}

function render_category_dropdown(
    categories: string[],
    search_input: HTMLInputElement,
    category_display: HTMLDivElement
): void {
    news_search_autocomplete.innerHTML = ""
    set_keyboard_navigation_active(false)
    clear_active_category()

    for (let [index, category] of categories.entries()) {
        const category_elem = document.createElement("div")
        category_elem.className = "ultrabox-news-search-autocomplete-item"
        category_elem.id = `ultrabox-news-search-autocomplete-item-${index}`
        category_elem.dataset.category = category
        category_elem.setAttribute("role", "option")

        const category_label = document.createElement("span")
        category_label.className = "ultrabox-news-search-autocomplete-label"
        category_label.innerText = category

        const keyboard_hint = document.createElement("span")
        keyboard_hint.className = "ultrabox-news-search-autocomplete-hint"
        keyboard_hint.innerText = "[tab] to select"

        category_elem.append(category_label, keyboard_hint)
        category_elem.addEventListener("click", () => {
            select_category(category, search_input, category_display)
        })
        news_search_autocomplete.appendChild(category_elem)
    }

    news_search_autocomplete.style.display = categories.length > 0 ? "block" : "none"

    if (categories.length > 0) {
        position_category_dropdown(search_input)
    }
}

function set_news_tabs_html() {
    if (!news_tabs_wrapper) {
        return
    }

    news_tabs_wrapper.innerHTML = `<dd class="active" style="width: 100%;"><div>
    <div id="ultrabox-news-tabs" style="width: 100%;">
        <div id="ultrabox-news-category-display">All</div>
        <input id="ultrabox-news-search" placeholder="Search news articles..." />
    </div>
    </div></dd>`

    const search_input = document.getElementById("ultrabox-news-search") as HTMLInputElement
    search_input.setAttribute("aria-controls", "ultrabox-news-search-autocomplete")
    search_input.setAttribute("aria-autocomplete", "list")
    const category_display = document.getElementById(
        "ultrabox-news-category-display"
    ) as HTMLDivElement

    search_input.addEventListener("input", e => {
        const search_term = (e.target as HTMLInputElement).value.toLowerCase()

        if (search_term.length === 0) {
            hide_category_dropdown()
            update_results(current_category, null)
            return
        }

        const available_categories = get_matching_categories(search_term)
        render_category_dropdown(available_categories, search_input, category_display)

        update_results(current_category, search_term)
    })

    search_input.addEventListener("keydown", e => {
        if (e.key === "ArrowDown") {
            if (move_active_category(1)) {
                e.preventDefault()
            }
            return
        }

        if (e.key === "ArrowUp") {
            if (move_active_category(-1)) {
                e.preventDefault()
            }
            return
        }

        if (e.key === "Tab") {
            const active_category = get_active_category()

            if (active_category) {
                select_category(active_category, search_input, category_display)
                e.preventDefault()
            }
            return
        }

        if (e.key === "Enter") {
            const search_term = (e.target as HTMLInputElement).value.toLowerCase()
            const available_categories = get_matching_categories(search_term)
            const category_to_select = get_active_category() ?? available_categories[0]

            if (category_to_select) {
                select_category(category_to_select, search_input, category_display)
            }
            e.preventDefault()
        }
    })
}

function update_results(category_filter: string | null, search_term: string | null) {
    if (news_items.length === 0) {
        collect_news_items()
    }

    if (news_items.length === 0) {
        return
    }

    for (let news_item of news_items) {
        let show_item = true
        if (category_filter && category_filter !== "All") {
            if (news_item.category_string !== category_filter) {
                show_item = false
            }
        }
        if (search_term) {
            const item_text = news_item.elem.innerText.toLowerCase()
            if (!item_text.includes(search_term.toLowerCase())) {
                show_item = false
            }
        }
        news_item.elem.style.display = show_item ? "block" : "none"
    }
}

function run_when_ready(): boolean {
    if (news_tabs_categories.length === 0) {
        collect_news_categories()
    }

    if (news_tabs_categories.length === 0) {
        return false  // don't load if there are no categories yet
    }

    if (document.querySelector("#ultrabox-news-search")) {
        return true
    }

    const is_loading = document.querySelector(".information-list .skeleton")
    if (is_loading) {
        return false
    }

    collect_news_items()

    if (news_items.length === 0) {
        return false
    }

    set_news_tabs_html()
    return true
}

let run_interval = setInterval(() => {
    if (run_when_ready()) {
        clearInterval(run_interval)
    }
}, 500)

export {}

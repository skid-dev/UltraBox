let news_tabs_categories = Array.from(document.querySelectorAll(".tabs dd>a")).map(i => {
    return (i as HTMLAnchorElement).innerText.trim()
})
console.log(news_tabs_categories)
const news_tabs_wrapper = document.querySelector("#news-component dl")
const news_items = Array.from(document.querySelectorAll(".information-list .actions-small-1")).map(
    elem => {
        return {
            elem: elem as HTMLLIElement,
            category_string: elem.querySelector(`a[href^="/news?topic"]`)?.textContent.trim(),
        }
    }
)

let current_category = "All"

const news_search_autocomplete = document.createElement("div")
news_search_autocomplete.id = "ultrabox-news-search-autocomplete"
document.body.appendChild(news_search_autocomplete)

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
    const category_display = document.getElementById(
        "ultrabox-news-category-display"
    ) as HTMLDivElement

    search_input.addEventListener("input", e => {
        const search_term = (e.target as HTMLInputElement).value.toLowerCase()

        if (search_term.length === 0) {
            news_search_autocomplete.innerHTML = ""
            news_search_autocomplete.style.display = "none"
            update_results(current_category, null)
            return
        }

        const available_categories = news_tabs_categories.filter(cat =>
            cat.toLowerCase().includes(search_term)
        )
        console.log(search_term, news_tabs_categories, available_categories)

        news_search_autocomplete.innerHTML = ""
        for (let category of available_categories) {
            const category_elem = document.createElement("div")
            category_elem.className = "ultrabox-news-search-autocomplete-item"
            category_elem.innerText = category
            category_elem.addEventListener("click", () => {
                category_display.innerText = category
                search_input.value = ""
                news_search_autocomplete.innerHTML = ""
                news_search_autocomplete.style.display = "none"
            })
            news_search_autocomplete.appendChild(category_elem)
        }
        news_search_autocomplete.style.display = available_categories.length > 0 ? "block" : "none"

        // move the autocomplete div below the search input
        const rect = search_input.getBoundingClientRect()
        news_search_autocomplete.style.position = "absolute"
        news_search_autocomplete.style.left = `${rect.left}px`
        news_search_autocomplete.style.top = `${rect.bottom + window.scrollY}px`

        update_results(current_category, search_term)
    })

    // on enter, select the first category that matches
    search_input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            const search_term = (e.target as HTMLInputElement).value.toLowerCase()
            const available_categories = news_tabs_categories.filter(cat =>
                cat.toLowerCase().includes(search_term)
            )

            if (available_categories.length > 0) {
                category_display.innerText = available_categories[0]
                search_input.value = ""
                news_search_autocomplete.innerHTML = ""
                news_search_autocomplete.style.display = "none"
                update_results(available_categories[0], null)
                current_category = available_categories[0]
            }

            e.preventDefault()
        }
    })
}

function update_results(category_filter: string | null, search_term: string | null) {
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

function run_when_ready() {
    if (document.querySelector("#ultrabox-news-search")) {
        return
    }
    if (!document.querySelector(".information-list .skeleton")) {
        // don't load before news items have loaded in
        set_news_tabs_html()
    }
}

let run_interval = setInterval(() => {
    run_when_ready()
    clearInterval(run_interval)
}, 500)

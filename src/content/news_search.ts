const news_items = Array.from(document.querySelectorAll(".tabs dd>a")).map(i =>
    (i as HTMLAnchorElement).innerText.trim()
)
const news_tabs_wrapper = document.querySelector("#news-component dl")

function set_news_tabs_html() {
    if (!news_tabs_wrapper) {
        return 
    }

    news_tabs_wrapper.innerHTML = `<dd class="active"><div>
    <div id="ultrabox-news-tabs">
        <div id="ultrabox-news-category-display"></div>
        <input id="ultrabox-news-search" />
    </div>
    </div></dd>`
}

set_news_tabs_html()

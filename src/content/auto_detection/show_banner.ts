interface BannerOptions {
    id: string
    top: string
    title: string
    body_html: string
    auto_hide_ms?: number
}

export function show_detection_banner(opts: BannerOptions): void {
    const banner = document.createElement("div")
    banner.id = opts.id
    banner.style.position = "fixed"
    banner.style.top = opts.top
    banner.style.right = "20px"
    banner.style.backgroundColor = "#e3ffe4"
    banner.style.border = "2px solid #4CAF50"
    banner.style.borderLeftWidth = "8px"
    banner.style.color = "black"
    banner.style.padding = "15px"
    banner.style.borderRadius = "5px"
    banner.style.zIndex = "10000"

    banner.innerHTML = `
        <p style="font-weight: bold;">${opts.title}</p>
        ${opts.body_html}
        <p>Incorrectly detected? <a href='https://github.com/skid-dev/UltraBox' target='_blank'>Submit a bug report</a></p>
    `

    document.body.appendChild(banner)

    const auto_hide_ms = opts.auto_hide_ms ?? 10000
    setTimeout(() => {
        banner.remove()
    }, auto_hide_ms)
}

import { convert } from "html-to-text"

export function convert_to_plaintext(html: string): string {
    return convert(html, {
        selectors: [
            {
                selector: "a",
                format: "inline",
                options: {
                    ignoreHref: true
                }
            }
        ]
    }).replaceAll("\n", " ").replaceAll(/\[[^\]]*\]/g, " ")
}

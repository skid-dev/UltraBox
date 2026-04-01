export function rgb_to_hex(rgb: string): string {
    const m = rgb.match(/rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)(?:\s*,\s*[\d.]+\s*)?\)/i)
    if (!m) {
        throw new Error("Invalid RGB color format. Expected 'rgb(...)' or 'rgba(...)'.")
    }

    const parseChannel = (v: string) => {
        if (v.endsWith("%")) {
            return Math.round((parseFloat(v) / 100) * 255)
        }
        return Math.round(parseFloat(v))
    }

    const r = parseChannel(m[1])
    const g = parseChannel(m[2])
    const b = parseChannel(m[3])

    const toHex = (v: number) => v.toString(16).padStart(2, "0")
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Determines if a background color is "light" or "dark".
 * Useful for deciding whether to use black or white text over a dynamic background.
 * * @param hexColor - The background color in hex format (e.g., "#FFFFFF", "FFF", "123456")
 * @returns 'light' (suggesting dark text) or 'dark' (suggesting light text).
 */
export function get_theme(hexColor: string): "light" | "dark" {
    // 1. Strip the leading hash if it exists
    const hex = hexColor.replace(/^#/, "")

    // 2. Parse the hex string into RGB integer values
    let r: number, g: number, b: number

    if (hex.length === 3) {
        // Handle 3-character hex (e.g., #FFF -> #FFFFFF)
        r = parseInt(hex[0] + hex[0], 16)
        g = parseInt(hex[1] + hex[1], 16)
        b = parseInt(hex[2] + hex[2], 16)
    } else if (hex.length === 6) {
        // Handle standard 6-character hex
        r = parseInt(hex.substring(0, 2), 16)
        g = parseInt(hex.substring(2, 4), 16)
        b = parseInt(hex.substring(4, 6), 16)
    } else {
        throw new Error("Invalid hex color format. Please provide a 3 or 6 character hex string.")
    }

    // 3. Calculate perceived brightness using the YIQ formula
    const yiq = (r * 299 + g * 587 + b * 114) / 1000

    // 4. Return the theme based on the 128 midpoint threshold
    return yiq >= 128 ? "light" : "dark"
}

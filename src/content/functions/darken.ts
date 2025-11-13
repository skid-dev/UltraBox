export function darken(color: string, percent: number): string {
    // clamp helper
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))

    let r: number | null = null
    let g: number | null = null
    let b: number | null = null

    const hexLike = color.replace(/\s+/g, "")
    // hex: #rgb or #rrggbb or plain rrggbb
    if (/^#?[0-9a-fA-F]{3}$/.test(hexLike) || /^#?[0-9a-fA-F]{6}$/.test(hexLike)) {
        let hex = hexLike.replace("#", "")
        if (hex.length === 3) {
            hex = hex.split("").map(x => x + x).join("")
        }
        const num = parseInt(hex, 16)
        r = (num >> 16) & 0xff
        g = (num >> 8) & 0xff
        b = num & 0xff
    } else {
        // rgb(...) or rgba(...), support numeric and percentage values
        const m = color.match(/rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)(?:\s*,\s*[\d.]+\s*)?\)/i)
        if (m) {
            const parseChannel = (v: string) => {
                if (v.endsWith("%")) {
                    return (parseFloat(v) / 100) * 255
                }
                return parseFloat(v)
            }
            r = parseChannel(m[1])
            g = parseChannel(m[2])
            b = parseChannel(m[3])
        } else {
            // unknown format: return original
            return color
        }
    }

    // compute darkened values
    const dr = clamp((r as number) - (r as number) * percent)
    const dg = clamp((g as number) - (g as number) * percent)
    const db = clamp((b as number) - (b as number) * percent)

    const toHex = (v: number) => v.toString(16).padStart(2, "0")
    return `#${toHex(dr)}${toHex(dg)}${toHex(db)}`
}

export function darken(color: string, percent: number): string {
    let hex = color.replace("#", "")
    if (hex.length === 3) {
        hex = hex
            .split("")
            .map(x => x + x)
            .join("")
    }
    const num = parseInt(hex, 16)
    let r = (num >> 16) - Math.round((num >> 16) * percent)
    let g = ((num >> 8) & 0x00ff) - Math.round(((num >> 8) & 0x00ff) * percent)
    let b = (num & 0x0000ff) - Math.round((num & 0x0000ff) * percent)
    r = Math.max(0, r)
    g = Math.max(0, g)
    b = Math.max(0, b)
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

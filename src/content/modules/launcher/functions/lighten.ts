// thanks chatgpt

export function lighten(color: string, percent: number): string {
    let hex = color.replace("#", "")
    if (hex.length === 3) {
        hex = hex
            .split("")
            .map(x => x + x)
            .join("")
    }
    const num = parseInt(hex, 16)
    let r = (num >> 16) + Math.round((255 - (num >> 16)) * percent)
    let g = ((num >> 8) & 0x00ff) + Math.round((255 - ((num >> 8) & 0x00ff)) * percent)
    let b = (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * percent)
    r = Math.min(255, r)
    g = Math.min(255, g)
    b = Math.min(255, b)
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

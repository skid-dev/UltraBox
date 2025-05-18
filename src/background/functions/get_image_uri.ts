export function find_first_storage_image_link(input_string: string): string | null {
    const match = input_string.match(/https?:\/\/[^\s"'<>]*storage\/image\.php[^\s"'<>]*/i)
    return match ? match[0] : null
}

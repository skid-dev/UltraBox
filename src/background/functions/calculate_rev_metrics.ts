import { RevisionData } from "../../types/rev_history"

export async function calculate_new_metrics(old_data: RevisionData, new_data: RevisionData) {
    const old_title = old_data.title || ""
    const new_title = new_data.title || ""

    let new_lines = 0
    let modified_lines = 0
    let deleted_lines = 0

    if (old_title != new_title) {
        modified_lines++
    }

    // split into individual chars
    const old_text = [...old_data.content.toLowerCase()]
    const new_text = [...new_data.content.toLowerCase()]

    const m = old_text.length
    const n = new_text.length

    // create a DP table of size (m+1) x (n+1)
    // dp[i][j] represents the edit distance between old_text[0..i-1] and new_text[0..j-1]
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

    // base cases
    for (let i = 0; i <= m; i++) {
        dp[i][0] = i // deleting all lines from old_text
    }
    for (let j = 0; j <= n; j++) {
        dp[0][j] = j // adding all lines from new_text
    }

    // build the DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (old_text[i - 1] === new_text[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] // no change
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1, // delete old line
                    dp[i][j - 1] + 1, // add new line
                    dp[i - 1][j - 1] + 1 // modify line
                )
            }
        }
    }

    // backtrack to count the number of new, modified, and deleted lines
    let i = m
    let j = n
    while (i > 0 && j > 0) {
        if (old_text[i - 1] === new_text[j - 1]) {
            // if lines are the same, move diagonally
            i--
            j--
        } else if (dp[i][j] === dp[i - 1][j] + 1) {
            // line deleted from old_text
            deleted_lines++
            i--
        } else if (dp[i][j] === dp[i][j - 1] + 1) {
            // line added in new_text
            new_lines++
            j--
        } else {
            modified_lines++
            i--
            j--
        }
    }

    // if there are remaining lines in old_text, they are deleted
    while (i > 0) {
        deleted_lines++
        i--
    }

    // if there are remaining lines in new_text, they are added
    while (j > 0) {
        new_lines++
        j--
    }

    return { new_lines, modified_lines, deleted_lines }
}

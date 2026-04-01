import { poll_feed } from "../../../background/pull_feed"

// news itens aren't saved (for some reason) when pull feed is called
// from background.ts
async function main() {
    console.log("Pulling")
    await poll_feed()
}

main().then(() => {
})
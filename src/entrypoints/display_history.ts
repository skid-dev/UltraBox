import { setup } from "../content/modules/post_history_tracking/setup"

export default defineUnlistedScript(() => {
    async function main() {
        await setup()
    }

    if (
        document.querySelector(".meta") &&
        !document.querySelector("#ultrabox-history-container")
    ) {
        main()
    }
})

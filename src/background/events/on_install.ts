import { init_settings } from "../set_default_settings";

export default async function on_install() {
    await init_settings()
}
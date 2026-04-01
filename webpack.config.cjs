const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === "development"

    return {
        mode: isDevelopment ? "development" : "production",
        devtool: isDevelopment ? "cheap-module-source-map" : "source-map",

        performance: {
            hints: false,
        },

        entry: {
            popup: "./src/popup/popup.ts",
            background: "./src/background/background.ts",
            launcher_homepage: "./src/content/modules/launcher/launch_homepage.ts",
            launcher_shortcut: "./src/content/modules/launcher/launch_shortcut.ts",
            get_textbooks: "./src/content/modules/launcher/getters/get_textbooks.ts",
            inject_css_tools: "./src/content/inject_css_tools.ts",
            news_search_main: "./src/content/modules/news_search/news_search.ts",
            display_history: "./src/content/modules/post_history_tracking/content.ts",
            history_puller: "./src/content/modules/post_history_tracking/puller.ts",
            detect_domain: "./src/content/auto_detection/detect_domain.ts",
            detect_rss_feed: "./src/content/auto_detection/detect_rss_feed.ts",
        },

        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name].js",
            clean: true,
        },

        resolve: {
            extensions: [".ts", ".js"],
        },

        module: {
            rules: [
                {
                    test: /\.(ts|js)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env", "@babel/preset-typescript"],
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: "asset/resource",
                    generator: {
                        filename: "images/[hash][ext][query]",
                    },
                },
            ],
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/popup/popup.html",
                filename: "popup.html",
                chunks: ["popup"],
                inject: "body",
            }),
            new CopyWebpackPlugin({
                patterns: [
                    // essential chrome extension files
                    {
                        from: "src/manifest.json",
                        to: "manifest.json",
                        noErrorOnMissing: false,
                    },
                    {
                        from: "src/icons",
                        to: "icons",
                        noErrorOnMissing: true,
                        globOptions: { ignore: ["**/.*"] },
                    },

                    // popup and stylessheet injects
                    {
                        from: "src/popup/styles.css",
                        to: "styles.css",
                        noErrorOnMissing: false,
                    },
                    {
                        from: "src/content/inject.css",
                        to: "inject.css",
                        noErrorOnMissing: false,
                    },

                    // modules -> launcher
                    {
                        from: "src/content/modules/launcher/launcher_styles.css",
                        to: "launcher_styles.css",
                        noErrorOnMissing: false,
                    },

                    // modules -> news search
                    {
                        from: "src/content/modules/news_search/news_search.css",
                        to: "news_search_styles.css",
                        noErrorOnMissing: false,
                    },

                    // modules -> post history tracking
                    {
                        from: "src/content/modules/post_history_tracking/news_history.css",
                        to: "news_history.css",
                        noErrorOnMissing: false,
                    },

                    // schooltape compatibility CSS
                    {
                        from: "src/content/schooltape/launcher_styles.css",
                        to: "schooltape/launcher_styles.css",
                        noErrorOnMissing: false,
                    },
                    {
                        from: "src/content/schooltape/post_history_styles.css",
                        to: "schooltape/post_history_styles.css",
                        noErrorOnMissing: false,
                    },
                    {
                        from: "src/content/schooltape/news_search_styles.css",
                        to: "schooltape/news_search_styles.css",
                        noErrorOnMissing: false,
                    },
                ],
            }),
        ],
    }
}

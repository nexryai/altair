import * as fs from "fs";
import { defineConfig } from "vite";

import pluginVue from "@vitejs/plugin-vue";
import ReactivityTransform from "@vue-macros/reactivity-transform/vite";
import locales from "../../locales";
import meta from "../../package.json";
import pluginJson5 from "./vite.json5";
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".json5", ".svg", ".sass", ".scss", ".css", ".vue"];

export default defineConfig(({ command, mode }) => {
    fs.mkdirSync(__dirname + "/../../built", { recursive: true });
    fs.writeFileSync(__dirname + "/../../built/meta.json", JSON.stringify({ version: meta.version }), "utf-8");

    return {
        base: "/assets/",

        plugins: [
            ReactivityTransform(),
            pluginJson5(),
            pluginVue(),
        ],

        resolve: {
            extensions,
            alias: {
                "@/": __dirname + "/src/",
                "/client-assets/": __dirname + "/assets/",
                "/static-assets/": __dirname + "/../backend/assets/",
                "misskey-js": __dirname + "/../misskey-js/"
            },
        },

        define: {
            _VERSION_: JSON.stringify(meta.version),
            _LANGS_: JSON.stringify(Object.entries(locales).map(([k, v]) => [k, v._lang_])),
            _ENV_: JSON.stringify(process.env.NODE_ENV),
            _DEV_: process.env.NODE_ENV !== "production",
            _PERF_PREFIX_: JSON.stringify("Misskey:"),
            _DATA_TRANSFER_DRIVE_FILE_: JSON.stringify("mk_drive_file"),
            _DATA_TRANSFER_DRIVE_FOLDER_: JSON.stringify("mk_drive_folder"),
            _DATA_TRANSFER_DECK_COLUMN_: JSON.stringify("mk_deck_column"),
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false,
        },

        optimizeDeps: {
            include: ["misskey-js"],
        },

        build: {
            target: [
                "chrome100",
                "firefox100",
                "safari15",
                "es2017", // TODO: そのうち消す
            ],
            manifest: "manifest.json",
            rollupOptions: {
                input: {
                    app: "./src/init.ts",
                },
                output: {
                    manualChunks: {
                        vue: ["vue"],
                    },
                },
            },
            cssCodeSplit: true,
            outDir: __dirname + "/../../built/_client_dist_",
            assetsDir: ".",
            emptyOutDir: false,
            sourcemap: process.env.NODE_ENV !== "production",
            reportCompressedSize: false,
            commonjsOptions: {
                include: [/misskey-js/, /node_modules/],
            },
        },
    };
});

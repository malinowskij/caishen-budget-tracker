import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import builtins from 'builtin-modules';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';

    return {
        plugins: [
            svelte({
                preprocess: vitePreprocess(),
                compilerOptions: {
                    dev: !isProduction,
                    css: 'injected', // Inject CSS into JS instead of separate file
                },
                emitCss: false, // Don't emit separate CSS file
            }),
        ],
        build: {
            lib: {
                entry: 'src/main.ts',
                formats: ['cjs'],
                fileName: () => 'main.js',
            },
            rollupOptions: {
                output: {
                    entryFileNames: 'main.js',
                },
                external: [
                    'obsidian',
                    'electron',
                    '@codemirror/autocomplete',
                    '@codemirror/collab',
                    '@codemirror/commands',
                    '@codemirror/language',
                    '@codemirror/lint',
                    '@codemirror/search',
                    '@codemirror/state',
                    '@codemirror/view',
                    '@lezer/common',
                    '@lezer/highlight',
                    '@lezer/lr',
                    ...builtins,
                ],
            },
            outDir: '.',
            emptyOutDir: false,
            sourcemap: isProduction ? false : 'inline',
            minify: isProduction,
        },
    };
});

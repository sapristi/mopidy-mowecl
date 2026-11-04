import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    base: "./",
    build: {
        // served by the Python package (see Extension.factory)
        outDir: "../mopidy_mowecl/static",
        emptyOutDir: true,
    },
    test: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
    },
})

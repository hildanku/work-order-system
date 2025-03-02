import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
const PROD = import.meta.env?.PROD ?? false

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: PROD ? '/' : 'http://localhost:1337',
                changeOrigin: true,
                secure: false, // if backend not use https protocol
                rewrite: (path) => path.replace(/^\/api/, '/api')
            },
            '/public': {
                target: PROD ? '/' : 'http://localhost:1337',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/public/, '/public')
            }
        }
    }
});

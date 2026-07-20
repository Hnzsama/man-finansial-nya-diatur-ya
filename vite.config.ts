import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Membaca environment variable (APP_ENV dari file .env)
    const env = loadEnv(mode, process.cwd(), '');
    const isProduction = env.APP_ENV === 'production' || mode === 'production';

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                refresh: true,
                fonts: [
                    bunny('Instrument Sans', {
                        weights: [400, 500, 600],
                    }),
                ],
            }),
            inertia(),
            react({
                babel: {
                    plugins: ['babel-plugin-react-compiler'],
                },
            }),
            tailwindcss(),
            wayfinder({
                formVariants: true,
            }),
        ],
        build: {
            // Jika production: keluar 1 tingkat ke root web (/man-finance-better/build)
            // Jika local: tetap di folder public proyek biasa (/public/build)
            outDir: isProduction 
                ? path.resolve(__dirname, '../build') 
                : 'public/build',
            emptyOutDir: true,
        },
    };
});
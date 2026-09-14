import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    // Carga las variables del archivo .env según el modo (development/production)
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [react()],
        server: {
            host: '0.0.0.0',
            port: 5173,
            proxy: {
                '/api': {
                    target: env.VITE_API_URL || 'http://localhost:3001',
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    }
})
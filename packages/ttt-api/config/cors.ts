import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
    enabled: true,
    origin: [
        'http://localhost:5173',
        'http://localhost:3333',
        'http://localhost',
        'http://31.97.155.246',
        'http://31.97.155.246:80',
        'https://trouve-ta-table.netlify.app',
    ],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: true,
    exposeHeaders: [],
    credentials: true,
    maxAge: 90,
})

export default corsConfig

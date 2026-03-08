export default function manifest() {
    return {
        name: 'iSocialMedia',
        short_name: 'iSocialMedia',
        description: 'Bio Pages Profissionais & Agendamento para Instagram',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#4f46e5',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}

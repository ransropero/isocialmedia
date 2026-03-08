export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isocialmedia.com.br';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/dashboard/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

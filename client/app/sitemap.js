export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isocialmedia.com.br';
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

    // Static routes
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
    ];

    // Dynamic bio page routes
    try {
        const res = await fetch(`${apiBase}/bio/all-slugs`, { cache: 'no-store' });
        if (res.ok) {
            const slugs = await res.json();
            const bioRoutes = slugs.map(slug => ({
                url: `${baseUrl}/${slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.6,
            }));
            return [...routes, ...bioRoutes];
        }
    } catch (error) {
        console.error('Error fetching slugs for sitemap:', error);
    }

    return routes;
}


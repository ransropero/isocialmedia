import BioPageClient from './BioPageClient';

async function getBioPage(slug) {
    const url = `http://127.0.0.1:5001/api/bio/slug/${slug}`;

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        const response = await res.json();
        // The API returns either { id, slug ... } OR { status, data: { ... } }
        // Based on curl, it returns the object directly.
        return response.slug ? response : response.data;
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const page = await getBioPage(slug);

    if (!page) {
        return {
            title: 'Página não encontrada | iSocialMidia',
        };
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const profileImg = page.profileImageUrl
        ? (page.profileImageUrl.startsWith('http') ? page.profileImageUrl : `${apiBase}${page.profileImageUrl}`)
        : null;

    return {
        title: `${page.title || `@${slug}`} | iSocialMidia`,
        description: page.description || 'Confira meus links e redes sociais.',
        icons: profileImg ? {
            icon: profileImg,
            apple: profileImg,
        } : undefined,
        openGraph: {
            title: page.title || `@${slug}`,
            description: page.description || 'Confira meus links e redes sociais.',
            images: profileImg ? [{ url: profileImg }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: page.title || `@${slug}`,
            description: page.description || 'Confira meus links e redes sociais.',
            images: profileImg ? [profileImg] : [],
        },
    };
}

export default async function BioPage({ params }) {
    const { slug } = await params;
    const page = await getBioPage(slug);

    if (!page) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-400">Página não encontrada</p>
                </div>
            </div>
        );
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

    return <BioPageClient page={page} slug={slug} apiBase={apiBase} />;
}

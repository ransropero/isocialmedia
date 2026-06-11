import BioPageClient from './BioPageClient';

async function getBioPage(slug) {
    const url = `http://127.0.0.1:5001/api/bio/slug/${slug}`;
    const maxRetries = 4;
    let delay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[getBioPage] Tentativa ${attempt} de buscar slug: ${slug}`);
            const res = await fetch(url, { cache: 'no-store' });
            
            if (res.ok) {
                const response = await res.json();
                return response.slug ? response : response.data;
            }
            
            // Se retornar 404 real do Express (slug não encontrado no banco de dados),
            // não adianta tentar novamente. Retorna null imediatamente.
            if (res.status === 404) {
                console.log(`[getBioPage] Página não encontrada (404) para o slug: ${slug}`);
                return null;
            }

            console.warn(`[getBioPage] Resposta não-ok (status ${res.status}) na tentativa ${attempt}.`);
            if (attempt === maxRetries) return null;
            
        } catch (error) {
            console.error(`[getBioPage] Erro de rede/conexão na tentativa ${attempt} para o slug: ${slug}:`, error.message);
            if (attempt === maxRetries) return null;
        }

        // Aguarda antes da próxima tentativa com backoff simples
        console.log(`[getBioPage] Aguardando ${delay}ms antes da tentativa ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay += 500;
    }

    return null;
}


export async function generateMetadata({ params }) {
    const { slug } = await params;
    const page = await getBioPage(slug);

    if (!page) {
        return {
            title: 'Página não encontrada | iSocialMedia',
        };
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const profileImg = page.profileImageUrl
        ? (page.profileImageUrl.startsWith('http') ? page.profileImageUrl : `${apiBase}${page.profileImageUrl}`)
        : null;

    return {
        title: `${page.title || `@${slug}`} | iSocialMedia`,
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
        alternates: {
            canonical: `/${slug}`,
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

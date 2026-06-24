import ShortLinkRedirectClient from './ShortLinkRedirectClient';

async function getShortLinkData(shortCode) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api';
    const url = `${apiBase}/short-links/resolve/${shortCode}`;

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
            return await res.json();
        }
    } catch (error) {
        console.error(`[getShortLinkData] Erro ao buscar shortCode ${shortCode}:`, error.message);
    }
    return null;
}

export async function generateMetadata({ params }) {
    const { shortCode } = await params;
    const linkData = await getShortLinkData(shortCode);

    if (!linkData || linkData.expired) {
        return {
            title: 'Link Indisponível | iSocialMedia',
            description: 'Este link não está mais disponível ou expirou.',
            openGraph: {
                title: 'Link Indisponível | iSocialMedia',
                description: 'Este link não está mais disponível ou expirou.',
                images: [],
            },
            twitter: {
                card: 'summary',
                title: 'Link Indisponível | iSocialMedia',
                description: 'Este link não está mais disponível ou expirou.',
                images: [],
            }
        };
    }

    // Obter o domínio de destino para exibir no título e descrição do compartilhamento
    let targetDomain = '';
    try {
        targetDomain = new URL(linkData.originalUrl).hostname;
    } catch (e) {
        targetDomain = linkData.originalUrl;
    }

    // Gerar um título limpo que foca na ação e destino, sem propaganda
    const cleanTitle = `Redirecionando para ${targetDomain}`;
    const cleanDescription = `Clique para abrir o link original de destino: ${linkData.originalUrl}`;

    return {
        title: cleanTitle,
        description: cleanDescription,
        // Forçar imagens e pré-visualização vazias ou usar um ícone genérico para evitar exibir o banner da Landing Page do iSocialMedia
        openGraph: {
            title: cleanTitle,
            description: cleanDescription,
            url: `https://isocialmedia.com.br/s/${shortCode}`,
            type: 'website',
            images: [], // Sem imagem de propaganda para não confundir o usuário
        },
        twitter: {
            card: 'summary',
            title: cleanTitle,
            description: cleanDescription,
            images: [],
        },
    };
}

export default async function ShortLinkPage({ params }) {
    const { shortCode } = await params;
    return <ShortLinkRedirectClient shortCode={shortCode} />;
}

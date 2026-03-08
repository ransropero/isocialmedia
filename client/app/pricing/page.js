import PricingClient from '@/components/PricingClient';

export const metadata = {
    title: "Planos e Preços | iSocialMedia",
    description: "Escolha o plano ideal para acelerar sua estratégia no Instagram. Do Gratuito ao Pro, temos a ferramenta certa para você crescer.",
    alternates: {
        canonical: 'https://isocialmedia.com.br/pricing',
    },
    openGraph: {
        title: "Planos e Preços | iSocialMedia",
        description: "Comece grátis e evolua sua presença digital com agendamento inteligente e Bio Pages premium.",
    }
};

export default function PricingPage() {
    return <PricingClient />;
}

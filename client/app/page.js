import HomeClient from '@/components/HomeClient';
import JsonLd from '@/components/JsonLd';

export const metadata = {
  title: "iSocialMedia | Bio Pages Profissionais & Agendamento para Instagram",
  description: "Crie sua Bio Page premium em minutos e agende posts de forma automática. A plataforma definitiva para profissionais e marcas no Instagram.",
  alternates: {
    canonical: 'https://isocialmedia.com.br',
  },
  openGraph: {
    title: "iSocialMedia | Bio Pages Profissionais & Agendamento",
    description: "Transforme sua bio em uma central de vendas. Agendamento inteligente e analytics completo.",
  }
};

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "iSocialMedia",
    "operatingSystem": "Web",
    "applicationCategory": "SocialNetworkingApplication",
    "description": "Plataforma de agendamento para Instagram e criação de Bio Pages profissionais.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "BRL"
    },
    "featureList": [
      "Agendamento Inteligente",
      "Bio Pages Profissionais",
      "Analytics em Tempo Real",
      "Links Protegidos"
    ]
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeClient />
    </>
  );
}

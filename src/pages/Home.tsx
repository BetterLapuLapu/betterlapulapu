import Hero from '../components/sections/Hero';
import ServicesSection from '../components/home/ServicesSection';
import GovernmentActivitySection from '../components/home/GovernmentActivitySection';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('common.home')}
        description={t('seo.homeDescription')}
        keywords="Lapu-Lapu City, Cebu, local government, city services, public services, BetterLapuLapu"
      />
      <Hero />
      <ServicesSection />
      <GovernmentActivitySection />
    </>
  );
};

export default Home;

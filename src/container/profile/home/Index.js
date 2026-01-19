import FinanceEngineSection from './components/FinanceEngineSection';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import ImpactStats from './components/ImpactStats';
import Marque from './components/Marque';
import Navbar from './components/Navbar';
import ScrollToTopButton from './components/ScrollToTopButton';
import ShiftToAISection from './components/ShiftToAISection';

function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Marque />
      <ShiftToAISection />
      <FinanceEngineSection />
      <ImpactStats />
      <Footer />
      <ScrollToTopButton />
    </>
  );
}

export default Home;

import { NuqsAdapter } from 'nuqs/adapters/react';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PhaseBanner from './components/layout/PhaseBanner';
import Home from './pages/Home';
import ScrollToTop from './components/ui/ScrollToTop';
import Services from './pages/Services';
import Document from './pages/Document';
import Government from './pages/Government';
import Search from './pages/Search';
import Sitemap from './pages/Sitemap';
import Accessibility from './pages/Accessibility';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

// Charts (Recharts) load only when the reports dashboard is opened.
const Reports = lazy(() => import('./pages/reports/Reports'));
const reports = (
  <Suspense fallback={<div className="min-h-screen" />}>
    <Reports />
  </Suspense>
);

// FY 2027 budget projects, read live from the BetterGov.ph Budget API.
const BudgetLayout = lazy(() =>
  import('./components/budget/BudgetShell').then(m => ({
    default: m.BudgetLayout,
  }))
);
const BudgetProjects = lazy(() => import('./pages/budget/BudgetProjects'));
const BudgetProject = lazy(() => import('./pages/budget/BudgetProject'));
const BudgetAbout = lazy(() => import('./pages/budget/BudgetAbout'));
const budget = (
  <Suspense fallback={<div className="min-h-screen" />}>
    <BudgetLayout />
  </Suspense>
);

function App() {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <Router>
        <NuqsAdapter>
          <div className="min-h-screen flex flex-col">
            <a
              href="#main"
              className="type-small sr-only block py-2.5 px-[15px] underline focus:not-sr-only tablet:px-[30px]"
            >
              {t('common.skipToContent')}
            </a>
            <Navbar />
            <PhaseBanner />
            <ScrollToTop />
            <main
              id="main"
              tabIndex={-1}
              className="flex-grow focus:outline-none"
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services/:category" element={<Services />} />
                <Route path="/services" element={<Services />} />
                <Route
                  path="/services/:category/:documentSlug"
                  element={<Document categoryType="service" />}
                />
                <Route
                  path="/government/reports-and-statistics"
                  element={reports}
                />
                <Route
                  path="/government/reports-and-statistics/:section"
                  element={reports}
                />
                <Route path="/government/budget-projects" element={budget}>
                  <Route index element={<BudgetProjects />} />
                  <Route
                    path="projects/:dataset/:id"
                    element={<BudgetProject />}
                  />
                  <Route path="about-the-data" element={<BudgetAbout />} />
                </Route>
                <Route path="/government/:category" element={<Government />} />
                <Route path="/government" element={<Government />} />
                <Route
                  path="/government/:category/:documentSlug"
                  element={<Document categoryType="government" />}
                />
                <Route path="/search" element={<Search />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/accessibility" element={<Accessibility />} />
                <Route path="/:lang/:documentSlug" element={<Document />} />
                <Route path="/:documentSlug" element={<Document />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NuqsAdapter>
      </Router>
    </HelmetProvider>
  );
}

export default App;

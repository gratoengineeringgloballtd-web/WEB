import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, createHashRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { LangProvider, useLang } from './lib/i18n.jsx';
import Header from './components/Header.jsx';
import { Footer, QuickActions, CtaBand } from './components/Chrome.jsx';
import { LightboxProvider, useCloseLightboxOnRoute } from './components/Projects.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import { ServicesOverview, ServiceDetail } from './pages/Services.jsx';
import { ProjectsPage, CaseStudy } from './pages/Projects.jsx';
import { Partners, News, NewsArticle, Careers, Contact } from './pages/Other.jsx';
import NotFound from './pages/NotFound.jsx';
import { ShopProvider } from './shop/core.jsx';
import { SiteProvider } from './lib/site.jsx';
import './styles/content.css';
import { ShopPage, ProductPage } from './shop/Shop.jsx';
import { CartPage, CheckoutPage } from './shop/Checkout.jsx';
import { OrderPage, PayTestPage } from './shop/Order.jsx';
import { AccountPage } from './shop/Account.jsx';
import { ReferralPage } from './shop/Referral.jsx';
import './styles/shop.css';

const Admin = lazy(() => import('./admin/Admin.jsx'));

function Shell() {
  const { pathname } = useLocation();
  const { lang } = useLang();
  const bare = pathname.replace(/^\/fr(?=\/|$)/, '') || '/';
  const noCta = /^\/(contact|quote|careers|cart|checkout|account|admin)$/.test(bare) || /^\/shop\/(order|pay-test)\//.test(bare);
  useCloseLightboxOnRoute(pathname);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [pathname]);
  return (
    <SiteProvider>
    <ShopProvider>
    <LightboxProvider>
      <Header />
      <main id="main" key={lang + bare} className="page">
        <Outlet />
      </main>
      {!noCta && <CtaBand />}
      <Footer />
      <QuickActions />
    </LightboxProvider>
    </ShopProvider>
    </SiteProvider>
  );
}

const Layout = ({ lang }) => <LangProvider lang={lang}><Shell /></LangProvider>;

const pages = [
  { index: true, element: <Home /> },
  { path: 'about', element: <About /> },
  { path: 'services', element: <ServicesOverview /> },
  { path: 'services/:id', element: <ServiceDetail /> },
  { path: 'projects', element: <ProjectsPage /> },
  { path: 'projects/:slug', element: <CaseStudy /> },
  { path: 'partners', element: <Partners /> },
  { path: 'news', element: <News /> },
  { path: 'news/:slug', element: <NewsArticle /> },
  { path: 'careers', element: <Careers /> },
  { path: 'contact', element: <Contact /> },
  { path: 'quote', element: <Contact /> },
  { path: 'shop', element: <ShopPage /> },
  { path: 'shop/p/:slug', element: <ProductPage /> },
  { path: 'shop/order/:number', element: <OrderPage /> },
  { path: 'shop/pay-test/:number', element: <PayTestPage /> },
  { path: 'cart', element: <CartPage /> },
  { path: 'checkout', element: <CheckoutPage /> },
  { path: 'account', element: <AccountPage /> },
  { path: 'referral', element: <ReferralPage /> },
  { path: 'admin', element: <Suspense fallback={null}><Admin /></Suspense> },
  { path: '*', element: <NotFound /> },
];

const routes = [
  { path: '/fr', element: <Layout lang="fr" />, children: pages },
  { path: '/', element: <Layout lang="en" />, children: pages },
];

// Hash routing (#/about) is only for hosts that cannot rewrite URLs to index.html.
const router = import.meta.env.VITE_ROUTER === 'hash'
  ? createHashRouter(routes)
  : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' });

export default function App() {
  return <RouterProvider router={router} />;
}

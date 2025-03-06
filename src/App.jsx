import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BlogPage } from './components/blog/BlogPage';
import { GalleryPage } from './components/gallery';
import { EventsPage } from './components/events';
import { ContactPage } from './components/contact/ContactPage';
import { MetaHead } from './components/seo/MetaHead';
import { Navbar, Footer } from './components/layout';
import { Hero, FoodCarousel, Experience, Testimonials } from './components/home';
import { MenuCategories, MenuList, ProductDetail } from './components/menu';
import { StoryPage } from './components/story/StoryPage';
import { ReservationPage, ReservationDetails, ReservationConfirmation, ReservationLookup } from './components/reservation';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderConfirmation } from './components/checkout/OrderConfirmation';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TableList } from './components/admin/TableList';
import { ReservationList } from './components/admin/ReservationList';
import { OrderList } from './components/admin/OrderList';
import { MenuUploader } from './components/admin/MenuUploader';
import { ViewMenuJson } from './components/admin/ViewMenuJson';
import { ViewSiteContent } from './components/admin/ViewSiteContent';
import { ReservationConfig } from './components/admin/ReservationConfig';
import { AnalyticsDashboard } from './components/admin/analytics/AnalyticsDashboard';
import { LoginPage } from './components/auth/LoginPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useAuth, AuthProvider } from '@/context';

// Admin route wrapper component
function AdminRoute({ children }) {
  const { session, loading } = useAuth() || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return children;
}

// Layout wrapper for public routes
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
        <div className="min-h-screen">
          <MetaHead />
          <Routes>
             {/* Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
              <Route index element={<Navigate to="analytics" />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="tables" element={<TableList />} />
              <Route path="reservations" element={<ReservationList />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="reservation-config" element={<ReservationConfig />} />
              <Route path="menu-upload" element={<MenuUploader />} />
              <Route path="view-menu" element={<ViewMenuJson />} />
              <Route path="view-content" element={<ViewSiteContent />} />
            </Route>

            {/* Public Routes */}
            <Route path="/" element={
              <PublicLayout>
                <Hero />
                <section id="signature-dishes">
                  <FoodCarousel />
                </section>
                <section id="culinary-journey">
                  <Experience />
                </section>
                <section id="guest-testimonials">
                  <Testimonials />
                </section>
              </PublicLayout>
            } />
            <Route path="/menu" element={<PublicLayout><MenuCategories /></PublicLayout>} />
            <Route path="/menu/:categoryId" element={<PublicLayout><MenuList /></PublicLayout>} />
            <Route path="/menu/:categoryId/:itemId" element={<PublicLayout><ProductDetail /></PublicLayout>} />
            <Route path="/our-story" element={<PublicLayout><StoryPage /></PublicLayout>} />
            <Route path="/reservation" element={<PublicLayout><ReservationPage /></PublicLayout>} />
            <Route path="/reservation/details" element={<PublicLayout><ReservationDetails /></PublicLayout>} />
            <Route path="/reservation/confirmation" element={<PublicLayout><ReservationConfirmation /></PublicLayout>} />
            <Route path="/reservation/lookup" element={<PublicLayout><ReservationLookup /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
            <Route path="/checkout/confirmation" element={<PublicLayout><OrderConfirmation /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />

            {/* Catch-all route */}
           <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;

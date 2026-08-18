import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import Index from "./pages/Index.tsx";
import Story from "./pages/Story.tsx";
import Catering from "./pages/catering/page.tsx";
import Locations from "./pages/locations/page.tsx";
import Careers from "./pages/careers/page.tsx";
import Contact from "./pages/contact/page.tsx";
import MenuPage from "./pages/menu/page.tsx";
import ReviewsPublicPage from "./pages/reviews/page.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./pages/admin/layout.tsx";
import AdminLoginPage from "./pages/admin/login.tsx";
import AdminDashboard from "./pages/admin/dashboard/page.tsx";
import CategoriesPage from "./pages/admin/menu/categories/page.tsx";
import DishesPage from "./pages/admin/menu/dishes/page.tsx";
import LocationsAdminPage from "./pages/admin/locations/page.tsx";
import CateringContentPage from "./pages/admin/catering/content/page.tsx";
import CateringRequestsPage from "./pages/admin/catering/requests/page.tsx";
import MediaPage from "./pages/admin/media/page.tsx";
import VacanciesPage from "./pages/admin/careers/vacancies/page.tsx";
import ApplicationsPage from "./pages/admin/careers/applications/page.tsx";
import FaqPage from "./pages/admin/faq/page.tsx";
import SettingsPage from "./pages/admin/settings/page.tsx";
import ReviewsPage from "./pages/admin/reviews/page.tsx";
import PromotionsPage from "./pages/admin/promotions/page.tsx";
import RequestsPage from "./pages/admin/requests/page.tsx";
import PagesPage from "./pages/admin/pages/page.tsx";
import UsersPage from "./pages/admin/users/page.tsx";
import ActivityPage from "./pages/admin/activity/page.tsx";
import ProfilePage from "./pages/admin/profile/page.tsx";
import RoleGuard from "./pages/admin/_components/role-guard.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          {/* Public site */}
          <Route path="/" element={<Index />} />
          <Route path="/story" element={<Story />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reviews" element={<ReviewsPublicPage />} />

          {/* Admin login — public */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin panel — protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard: accessible to all authenticated roles */}
            <Route index element={<AdminDashboard />} />

            {/* Profile: accessible to all authenticated roles */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Content */}
            <Route
              path="pages"
              element={
                <RoleGuard section="pages">
                  <PagesPage />
                </RoleGuard>
              }
            />
            <Route
              path="menu/categories"
              element={
                <RoleGuard section="menu">
                  <CategoriesPage />
                </RoleGuard>
              }
            />
            <Route
              path="menu/dishes"
              element={
                <RoleGuard section="menu">
                  <DishesPage />
                </RoleGuard>
              }
            />
            <Route
              path="locations"
              element={
                <RoleGuard section="locations">
                  <LocationsAdminPage />
                </RoleGuard>
              }
            />
            <Route
              path="catering/content"
              element={
                <RoleGuard section="catering">
                  <CateringContentPage />
                </RoleGuard>
              }
            />
            <Route
              path="catering/requests"
              element={
                <RoleGuard section="catering">
                  <CateringRequestsPage />
                </RoleGuard>
              }
            />
            <Route
              path="media"
              element={
                <RoleGuard section="media">
                  <MediaPage />
                </RoleGuard>
              }
            />

            {/* Business */}
            <Route
              path="promotions"
              element={
                <RoleGuard section="promotions">
                  <PromotionsPage />
                </RoleGuard>
              }
            />
            <Route
              path="requests"
              element={
                <RoleGuard section="requests">
                  <RequestsPage />
                </RoleGuard>
              }
            />
            <Route
              path="careers/vacancies"
              element={
                <RoleGuard section="careers">
                  <VacanciesPage />
                </RoleGuard>
              }
            />
            <Route
              path="careers/applications"
              element={
                <RoleGuard section="careers">
                  <ApplicationsPage />
                </RoleGuard>
              }
            />
            <Route
              path="reviews"
              element={
                <RoleGuard section="reviews">
                  <ReviewsPage />
                </RoleGuard>
              }
            />

            {/* System */}
            <Route
              path="faq"
              element={
                <RoleGuard section="faq">
                  <FaqPage />
                </RoleGuard>
              }
            />
            <Route
              path="users"
              element={
                <RoleGuard section="users">
                  <UsersPage />
                </RoleGuard>
              }
            />
            <Route
              path="activity"
              element={
                <RoleGuard section="activity">
                  <ActivityPage />
                </RoleGuard>
              }
            />
            <Route
              path="settings"
              element={
                <RoleGuard section="settings">
                  <SettingsPage />
                </RoleGuard>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}

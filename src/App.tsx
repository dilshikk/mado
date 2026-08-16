import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import Index from "./pages/Index.tsx";
import Story from "./pages/Story.tsx";
import Catering from "./pages/catering/page.tsx";
import Locations from "./pages/locations/page.tsx";
import Careers from "./pages/careers/page.tsx";
import Contact from "./pages/contact/page.tsx";
import MenuPage from "./pages/menu/page.tsx";
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

          {/* Admin login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pages" element={<PagesPage />} />
            <Route path="menu/categories" element={<CategoriesPage />} />
            <Route path="menu/dishes" element={<DishesPage />} />
            <Route path="locations" element={<LocationsAdminPage />} />
            <Route path="catering/content" element={<CateringContentPage />} />
            <Route path="catering/requests" element={<CateringRequestsPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="careers/vacancies" element={<VacanciesPage />} />
            <Route path="careers/applications" element={<ApplicationsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}

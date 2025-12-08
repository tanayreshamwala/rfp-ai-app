import { Routes, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import RfpListPage from "../pages/RfpListPage";
import RfpCreatePage from "../pages/RfpCreatePage";
import RfpDetailPage from "../pages/RfpDetailPage";
import VendorListPage from "../pages/VendorListPage";
import ProposalComparisonPage from "../pages/ProposalComparisonPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<RfpListPage />} />
        <Route path="rfps" element={<RfpListPage />} />
        <Route path="rfps/create" element={<RfpCreatePage />} />
        <Route path="rfps/:id" element={<RfpDetailPage />} />
        <Route path="rfps/:id/compare" element={<ProposalComparisonPage />} />
        <Route path="vendors" element={<VendorListPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;


import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ChainsPage from "./components/council/ChainsPage";
import CouncilLayout from "./components/council/CouncilLayout";
import OCsPage from "./components/council/OCsPage";
import WarDetailsPage from "./components/council/war/WarDetailsPage";
import WarsListPage from "./components/council/war/WarsListPage";
import App from "./components/hof/App";

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/council" element={<CouncilLayout />}>
        <Route index element={<Navigate to="chains" replace />} />
        <Route path="chains" element={<ChainsPage />} />
        <Route path="wars" element={<WarsListPage />} />
        <Route path="wars/view/:id" element={<WarDetailsPage />} />
        <Route path="ocs" element={<OCsPage />} />
      </Route>
    </Routes>
  </Router>
);

export default AppRouter;

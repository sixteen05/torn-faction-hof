
import { Navigate, Route, HashRouter as Router, Routes } from "react-router-dom";
import ChainDetailsPage from "./components/council/chain/ChainDetailsPage";
import ChainsPage from "./components/council/chain/ChainsPage";
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
        <Route path="chain/:id" element={<ChainDetailsPage />} />
        <Route path="wars" element={<WarsListPage />} />
        <Route path="war/:id" element={<WarDetailsPage />} />
        <Route path="ocs" element={<OCsPage />} />
      </Route>
    </Routes>
  </Router>
);

export default AppRouter;

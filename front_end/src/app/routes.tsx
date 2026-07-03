import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { DiseaseDetection } from "./pages/DiseaseDetection";
import { AIChatbot } from "./pages/AIChatbot";
import { DiseaseHeatmap } from "./pages/DiseaseHeatmap";
import { FarmAnalytics } from "./pages/FarmAnalytics";
import { FertilizerPlanner } from "./pages/FertilizerPlanner";
import { Notifications } from "./pages/Notifications";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/app",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "disease-detection", Component: DiseaseDetection },
      { path: "chatbot", Component: AIChatbot },
      { path: "heatmap", Component: DiseaseHeatmap },
      { path: "analytics", Component: FarmAnalytics },
      { path: "fertilizer", Component: FertilizerPlanner },
      { path: "notifications", Component: Notifications },
      { path: "profile", Component: Profile },
    ],
  },
]);

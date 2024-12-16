import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WhiteBoardPage from "./pages/WhiteBoardPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import JoinRoomPage from "./pages/JoinRoomPage";
import CheckRoomPage from "./pages/CheckRoomPage";
import DashboardPage from "./pages/DashboardPage";
import UserDashBoardPage from "./pages/UserDashBoardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <h1>HEllo world</h1>,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/create-room",
    element: <CreateRoomPage />,
  },
  {
    path: "/join-room",
    element: <JoinRoomPage />,
  },
  {
    path: "/draw",
    element: <WhiteBoardPage />,
  },
  {
    path: "/check-room",
    element: <CheckRoomPage />,
  },
  {
    path: "/dashboard/:token",
    element: <DashboardPage />,
  },
  {
    path: "/dashboard/:room",
    element: <UserDashBoardPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

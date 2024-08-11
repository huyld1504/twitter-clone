import { Navigate, Route, Routes } from "react-router-dom";

import SignUpPage from "./pages/auth/SignUpPage";
import SignInPage from "./pages/auth/SignInPage";
import HomePage from "./pages/home/HomePage";
import Sidebar from "./components/common/Sidebar.jsx";
import RightPanel from "./components/common/RightPanel.jsx";
import NotificationPage from "./pages/notifiation/NotificationPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";

import { Toaster } from "react-hot-toast";

import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/profile", { method: "GET" });

        const result = await res.json();

        if (result.message) {
          return null;
        }

        if (!res.ok) {
          throw new Error(result.message || "Opps! Something went wrong");
        }

        return result;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      {authUser && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to={"/signup"} />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signin"
          element={!authUser ? <SignInPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/notifications"
          element={
            authUser ? <NotificationPage /> : <Navigate to={"/signup"} />
          }
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to={"/signup"} />}
        />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;

import { createBrowserRouter, Navigate } from "react-router";

import { Providers } from "@/Providers";
import Dashboard from "../pages/main/main";
import NotFoundRoute from "../pages/not-found/not-found";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Providers />,
      children: [
        {
          index: true,
          element: <Navigate to="/main" replace />,
        },
        {
          path: "/main",
          element: <Dashboard />,
        },
        {
          path: "*",
          element: <NotFoundRoute />,
        },
      ],
    },
  ],
  {
    basename: "/mytimetable",
  },
);

export default router;

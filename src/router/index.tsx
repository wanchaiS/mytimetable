import { createBrowserRouter, Navigate } from "react-router";

import { Providers } from "@/Providers";
import NotFoundRoute from "../pages/not-found/not-found";
import TimetablePlanner from "../pages/timetable-planner/timetable-planner";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Providers />,
      children: [
        {
          index: true,
          element: <Navigate to="/timetable-planner" replace />,
        },
        {
          path: "/timetable-planner",
          element: <TimetablePlanner />,
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

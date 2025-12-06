import { createBrowserRouter } from "react-router";

import { Providers } from "@/Providers";
import NotFoundRoute from "../pages/not-found/not-found";
import TimetablePlanner from "../pages/timetable-planner/TimetablePlanner";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Providers />,
      children: [
        {
          index: true,
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

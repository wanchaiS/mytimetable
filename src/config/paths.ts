export const paths = {
  home: {
    path: "/",
    getHref: () => "/",
  },

  // auth: {
  //   register: {
  //     path: '/auth/register',
  //     getHref: (redirectTo?: string | null | undefined) =>
  //       `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
  //   },
  //   login: {
  //     path: '/auth/login',
  //     getHref: (redirectTo?: string | null | undefined) =>
  //       `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
  //   },
  //},

  main: {
    root: {
      path: "/main",
      getHref: () => "/main",
    },
    dashboard: {
      path: "",
      getHref: () => "/main",
    },

    //   users: {
    //     path: 'users',
    //     getHref: () => '/app/users',
    //   },
    //   profile: {
    //     path: 'profile',
    //     getHref: () => '/app/profile',
    //   },
  },
} as const;

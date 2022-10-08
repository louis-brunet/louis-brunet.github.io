const routes = [
    {
        path: "/",
        component: () => import("src/layouts/Layout.vue"),
        children: [
            { path: "", component: () => import("pages/Index.vue") },
            { path: "contact", component: () => import("pages/Contact.vue") },
            { path: "projects", component: () => import("pages/Projects.vue") },
            { path: "tools", component: () => import("pages/Tools.vue") },
            {
                path: "education",
                component: () => import("pages/Education.vue"),
            },
            { path: "work", component: () => import("pages/Work.vue") },
        ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: "/:catchAll(.*)*",
        component: () => import("pages/Error404.vue"),
    },
];

export default routes;

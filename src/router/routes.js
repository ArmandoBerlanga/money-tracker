
const routes = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Login.vue') },
            {
                path: 'index',
                component: () => import('pages/IndexPage.vue'),
                beforeEnter: (to, from, next) => {
                    if (localStorage.getItem('UserID'))
                        next()
                    else
                        next('/')
                }
            },
            {
                path: 'records',
                component: () => import('src/pages/Records.vue'),
                beforeEnter: (to, from, next) => {
                    if (localStorage.getItem('UserID'))
                        next()
                    else
                        next('/')
                }
            },
        ]
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue')
    }
]

export default routes

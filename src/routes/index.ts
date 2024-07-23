import express from 'express';

const router = express.Router({ mergeParams: true });

// Import routes from other files
const routes = [
    {path: '/', router: require('./api') as express.Router},
    // {path: '/auth', router: require('./auth').default},
];

// Attach routes to router
routes.forEach((route) => {
    router.use(route.path, route.router);
});

export default routes;
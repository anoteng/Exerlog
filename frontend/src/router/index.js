import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from '../components/UserLogin.vue';
import UserDashboard from '../components/UserDashboard.vue';
import StartWorkout from '../components/StartWorkout.vue';
import UserWorkout from '../components/UserWorkout.vue'; // Endret import

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: UserLogin },
    { path: '/dashboard', component: UserDashboard, meta: { requiresAuth: true } },
    { path: '/start-workout', component: StartWorkout, meta: { requiresAuth: true } },
    { path: '/workouts/:id', component: UserWorkout, meta: { requiresAuth: true } }, // Oppdatert rute
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('token');

    if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
        next('/login');
    } else {
        next();
    }
});

export default router;

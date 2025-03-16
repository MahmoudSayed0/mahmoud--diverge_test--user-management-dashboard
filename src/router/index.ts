import { createRouter, createWebHistory } from 'vue-router';
import UserManagement from '@/pages/UserManagement.vue';
import UserDetail from '@/pages/UserDetail.vue';
import NotFound from '@/pages/NotFound.vue';
import Login from '@/pages/Login.vue';
import Unauthorized from '@/pages/Unauthorized.vue';
import { useAuthStore, UserRole } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/users'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: Unauthorized,
    meta: { requiresAuth: false }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { 
      requiresAuth: true,
      requiredRole: UserRole.VIEWER
    }
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: UserDetail,
    meta: { 
      requiresAuth: true,
      requiredRole: UserRole.EDITOR
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth !== false; // Default to requiring auth
  const requiredRole = to.meta.requiredRole;
  
  // Check if the route requires authentication
  if (requiresAuth) {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      // Try to restore session from sessionStorage
      const restored = authStore.checkAuth();
      
      if (!restored) {
        // Redirect to login if not authenticated
        return next({ 
          name: 'Login', 
          query: { redirect: to.fullPath } 
        });
      }
    }
    
    // Check if session has expired (more than 1 minute since last activity)
    const currentTime = Date.now();
    const lastActivity = authStore.lastActivity;
    const sessionTimeout = 60 * 1000; // 1 minute
    
    if (currentTime - lastActivity > sessionTimeout) {
      // Session expired, logout and redirect to login
      authStore.logout();
      return next({ 
        name: 'Login',
        query: { 
          redirect: to.fullPath,
          expired: 'true'
        } 
      });
    }
    
    // Update last activity timestamp
    authStore.updateActivity();
    
    // Check if the route requires a specific role
    if (requiredRole && !authStore.hasRole(requiredRole as UserRole)) {
      // Redirect to unauthorized page if user doesn't have required role
      return next({ name: 'Unauthorized' });
    }
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    // Redirect to home if already logged in and trying to access login page
    return next({ name: 'UserManagement' });
  }
  
  // Continue to the route
  next();
});

export default router; 
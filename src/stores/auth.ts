import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

// Define user roles and their hierarchy
export enum UserRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

// Role hierarchy for permission checks
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.VIEWER]: 0,
  [UserRole.EDITOR]: 1,
  [UserRole.MANAGER]: 2,
  [UserRole.ADMIN]: 3
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Session timeout in milliseconds (1 minute for demo purposes)
const SESSION_TIMEOUT = 60 * 1000;

export const useAuthStore = defineStore('auth', () => {
  // State
  const currentUser = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const token = ref<string | null>(null);
  const lastActivity = ref<number>(Date.now());
  const sessionTimeoutId = ref<number | null>(null);

  // Getters
  const userRole = computed(() => currentUser.value?.role || null);
  
  const hasRole = computed(() => {
    return (requiredRole: UserRole) => {
      if (!currentUser.value || !currentUser.value.role) return false;
      const userRoleLevel = roleHierarchy[currentUser.value.role];
      const requiredRoleLevel = roleHierarchy[requiredRole];
      return userRoleLevel >= requiredRoleLevel;
    };
  });

  // Actions
  function login(user: User, authToken: string) {
    currentUser.value = user;
    isAuthenticated.value = true;
    token.value = authToken;
    lastActivity.value = Date.now();
    
    // Store in sessionStorage for persistence
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', authToken);
    sessionStorage.setItem('lastActivity', lastActivity.value.toString());
    
    // Start session timeout
    startSessionTimeout();
  }

  function logout() {
    currentUser.value = null;
    isAuthenticated.value = false;
    token.value = null;
    
    // Clear sessionStorage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('lastActivity');
    
    // Clear session timeout
    if (sessionTimeoutId.value) {
      clearTimeout(sessionTimeoutId.value);
      sessionTimeoutId.value = null;
    }
  }

  function checkAuth() {
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');
    const storedLastActivity = sessionStorage.getItem('lastActivity');
    
    if (storedUser && storedToken && storedLastActivity) {
      try {
        const user = JSON.parse(storedUser) as User;
        const lastActivityTime = parseInt(storedLastActivity, 10);
        const currentTime = Date.now();
        
        // Check if session has expired
        if (currentTime - lastActivityTime > SESSION_TIMEOUT) {
          console.log('Session expired');
          logout();
          return false;
        }
        
        currentUser.value = user;
        isAuthenticated.value = true;
        token.value = storedToken;
        lastActivity.value = lastActivityTime;
        
        // Start session timeout
        startSessionTimeout();
        return true;
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        logout();
      }
    }
    
    return false;
  }

  function updateActivity() {
    lastActivity.value = Date.now();
    sessionStorage.setItem('lastActivity', lastActivity.value.toString());
    
    // Reset session timeout
    if (sessionTimeoutId.value) {
      clearTimeout(sessionTimeoutId.value);
    }
    startSessionTimeout();
  }

  function startSessionTimeout() {
    sessionTimeoutId.value = window.setTimeout(() => {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivity.value;
      
      if (inactiveTime >= SESSION_TIMEOUT) {
        console.log('Session timeout triggered');
        logout();
        // You could redirect to login page or show a session expired modal here
      }
    }, SESSION_TIMEOUT);
  }

  return {
    currentUser,
    isAuthenticated,
    token,
    lastActivity,
    userRole,
    hasRole,
    login,
    logout,
    checkAuth,
    updateActivity
  };
}); 
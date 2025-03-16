import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/lib/mockApi';
import type { Role, ApiError } from '@/lib/mockApi';

export const useRoleStore = defineStore('role', () => {
  // State
  const roles = ref<Role[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Computed
  const isRoleLoading = computed(() => isLoading.value);
  const hasError = computed(() => error.value !== null);
  const availableRoles = computed(() => {
    return [
      { label: 'All Roles', value: '' },
      ...roles.value.map(role => ({
        label: role.name,
        value: role.id
      }))
    ];
  });
  
  // Actions
  
  /**
   * Fetch all available roles
   */
  async function fetchRoles() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await api.getRoles();
      
      if (Array.isArray(response)) {
        roles.value = response;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to load roles';
      console.error('Error fetching roles:', err);
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Get a role by ID
   */
  function getRoleById(id: string): Role | undefined {
    return roles.value.find(role => role.id === id);
  }
  
  /**
   * Clear errors
   */
  function clearError() {
    error.value = null;
  }
  
  return {
    // State
    roles,
    isLoading,
    error,
    
    // Computed
    isRoleLoading,
    hasError,
    availableRoles,
    
    // Actions
    fetchRoles,
    getRoleById,
    clearError
  };
}); 
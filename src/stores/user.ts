import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/lib/mockApi';
import type { User, QueryParams, ApiError, PaginatedResponse } from '@/lib/mockApi';

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const isLoading = ref(false);
  const isUpdating = ref(false);
  const error = ref<string | null>(null);
  const totalItems = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  
  // Filter and sort state
  const searchQuery = ref('');
  const roleFilter = ref('');
  const statusFilter = ref('');
  const sortBy = ref('name');
  const sortDirection = ref<'asc' | 'desc'>('asc');
  
  // Optimistic update tracking
  const pendingOperations = ref<Map<number, { type: string; originalData?: User }>>(new Map());
  
  // Computed
  const isUserLoading = computed(() => isLoading.value);
  const hasError = computed(() => error.value !== null);
  const filteredUsers = computed(() => users.value);
  const hasPendingOperations = computed(() => pendingOperations.value.size > 0);
  
  // Actions
  
  /**
   * Fetch users with pagination, filtering, and sorting
   */
  async function fetchUsers() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const params: QueryParams = {
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        role: roleFilter.value || undefined,
        status: statusFilter.value || undefined,
        sortBy: sortBy.value,
        sortOrder: sortDirection.value
      };
      
      const response = await api.getUsers(params);
      
      if ('data' in response) {
        users.value = response.data;
        totalItems.value = response.meta.totalItems;
        totalPages.value = response.meta.totalPages;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to load users';
      console.error('Error fetching users:', err);
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Fetch a single user by ID
   */
  async function fetchUserById(id: number) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await api.getUser(id);
      
      if ('id' in response) {
        currentUser.value = response;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const apiError = err as ApiError;
      error.value = apiError.message || `Failed to load user with ID ${id}`;
      console.error('Error fetching user:', err);
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Create a new user with optimistic update
   */
  async function createUser(userData: Omit<User, 'id' | 'createdAt'>) {
    isUpdating.value = true;
    error.value = null;
    
    try {
      const response = await api.createUser(userData);
      
      if ('id' in response) {
        // Add the new user to the list if it would appear on the current page
        const shouldAddToCurrentPage = users.value.length < itemsPerPage.value || 
                                      totalItems.value < itemsPerPage.value * currentPage.value;
        
        if (shouldAddToCurrentPage) {
          users.value.push(response);
        }
        
        // Update total count
        totalItems.value++;
        totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value);
        
        return response;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to create user';
      console.error('Error creating user:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  }
  
  /**
   * Update a user with optimistic update
   */
  async function updateUser(id: number, userData: Partial<User>) {
    error.value = null;
    
    // Find the user in the current list
    const userIndex = users.value.findIndex(u => u.id === id);
    let originalUser: User | undefined;
    
    // Store the original user for rollback if needed
    if (userIndex !== -1) {
      originalUser = { ...users.value[userIndex] };
      
      // Apply optimistic update
      users.value[userIndex] = { ...users.value[userIndex], ...userData };
      
      // Track this operation
      pendingOperations.value.set(id, { 
        type: 'update', 
        originalData: originalUser 
      });
    }
    
    try {
      const response = await api.updateUser(id, userData);
      
      if ('id' in response) {
        // If the user is the current user, update it
        if (currentUser.value && currentUser.value.id === id) {
          currentUser.value = response;
        }
        
        // Update was successful, remove from pending operations
        pendingOperations.value.delete(id);
        
        return response;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const apiError = err as ApiError;
      error.value = apiError.message || `Failed to update user with ID ${id}`;
      console.error('Error updating user:', err);
      
      // Rollback optimistic update if the user was in the list
      if (userIndex !== -1 && originalUser) {
        users.value[userIndex] = originalUser;
      }
      
      // Remove from pending operations
      pendingOperations.value.delete(id);
      
      throw err;
    }
  }
  
  /**
   * Delete a user with optimistic update
   */
  async function deleteUser(id: number) {
    error.value = null;
    
    // Find the user in the current list
    const userIndex = users.value.findIndex(u => u.id === id);
    let originalUser: User | undefined;
    
    // Store the original user for rollback if needed
    if (userIndex !== -1) {
      originalUser = { ...users.value[userIndex] };
      
      // Apply optimistic update - remove from list
      users.value.splice(userIndex, 1);
      
      // Update total count
      totalItems.value--;
      totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value);
      
      // Track this operation
      pendingOperations.value.set(id, { 
        type: 'delete', 
        originalData: originalUser 
      });
    }
    
    try {
      const response = await api.deleteUser(id);
      
      if ('success' in response && response.success) {
        // Delete was successful, remove from pending operations
        pendingOperations.value.delete(id);
        
        return response;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const apiError = err as ApiError;
      error.value = apiError.message || `Failed to delete user with ID ${id}`;
      console.error('Error deleting user:', err);
      
      // Rollback optimistic update if the user was in the list
      if (userIndex !== -1 && originalUser) {
        users.value.splice(userIndex, 0, originalUser);
        totalItems.value++;
        totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value);
      }
      
      // Remove from pending operations
      pendingOperations.value.delete(id);
      
      throw err;
    }
  }
  
  /**
   * Set filter and sort parameters
   */
  function setFilters(filters: { search?: string; role?: string; status?: string }) {
    if (filters.search !== undefined) searchQuery.value = filters.search;
    if (filters.role !== undefined) roleFilter.value = filters.role;
    if (filters.status !== undefined) statusFilter.value = filters.status;
    currentPage.value = 1; // Reset to first page when filters change
  }
  
  /**
   * Set sort parameters
   */
  function setSort(column: string) {
    if (sortBy.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy.value = column;
      sortDirection.value = 'asc';
    }
  }
  
  /**
   * Set pagination parameters
   */
  function setPagination(page: number, perPage?: number) {
    currentPage.value = page;
    if (perPage) itemsPerPage.value = perPage;
  }
  
  /**
   * Clear all filters
   */
  function clearFilters() {
    searchQuery.value = '';
    roleFilter.value = '';
    statusFilter.value = '';
    currentPage.value = 1;
  }
  
  /**
   * Clear errors
   */
  function clearError() {
    error.value = null;
  }
  
  return {
    // State
    users,
    currentUser,
    isLoading,
    isUpdating,
    error,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    searchQuery,
    roleFilter,
    statusFilter,
    sortBy,
    sortDirection,
    
    // Computed
    isUserLoading,
    hasError,
    filteredUsers,
    hasPendingOperations,
    
    // Actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    setFilters,
    setSort,
    setPagination,
    clearFilters,
    clearError
  };
}); 
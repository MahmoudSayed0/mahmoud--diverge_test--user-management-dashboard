import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRoleStore } from '@/stores/role';
import { api } from '@/lib/mockApi';

// Mock the API
vi.mock('@/lib/mockApi', () => ({
  api: {
    getRoles: vi.fn()
  }
}));

describe('Role Store', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia());
    
    // Reset all mocks
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchRoles', () => {
    it('should fetch roles successfully', async () => {
      // Mock API response
      const mockRoles = [
        { 
          id: 'admin', 
          name: 'Administrator', 
          permissions: ['users.view', 'users.create', 'users.edit', 'users.delete'], 
          description: 'Full access' 
        },
        { 
          id: 'editor', 
          name: 'Editor', 
          permissions: ['users.view', 'users.edit'], 
          description: 'Can edit users' 
        }
      ];
      
      (api.getRoles as any).mockResolvedValue(mockRoles);
      
      const roleStore = useRoleStore();
      await roleStore.fetchRoles();
      
      // Verify API was called
      expect(api.getRoles).toHaveBeenCalled();
      
      // Verify store state was updated correctly
      expect(roleStore.roles).toEqual(mockRoles);
      expect(roleStore.isLoading).toBe(false);
      expect(roleStore.error).toBeNull();
    });

    it('should handle API errors', async () => {
      // Mock API error
      const errorMessage = 'Failed to fetch roles';
      (api.getRoles as any).mockRejectedValue({ message: errorMessage });
      
      const roleStore = useRoleStore();
      await roleStore.fetchRoles();
      
      // Verify error handling
      expect(roleStore.isLoading).toBe(false);
      expect(roleStore.error).toBe(errorMessage);
      expect(roleStore.roles).toEqual([]);
    });
  });

  describe('availableRoles', () => {
    it('should format roles for dropdown selection', async () => {
      // Setup initial state
      const roleStore = useRoleStore();
      roleStore.roles = [
        { 
          id: 'admin', 
          name: 'Administrator', 
          permissions: ['users.view', 'users.create', 'users.edit', 'users.delete'], 
          description: 'Full access' 
        },
        { 
          id: 'editor', 
          name: 'Editor', 
          permissions: ['users.view', 'users.edit'], 
          description: 'Can edit users' 
        }
      ];
      
      // Check computed property
      expect(roleStore.availableRoles).toEqual([
        { label: 'All Roles', value: '' },
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor', value: 'editor' }
      ]);
    });
  });

  describe('getRoleById', () => {
    it('should return the correct role by ID', () => {
      // Setup initial state
      const adminRole = { 
        id: 'admin', 
        name: 'Administrator', 
        permissions: ['users.view', 'users.create', 'users.edit', 'users.delete'], 
        description: 'Full access' 
      };
      
      const editorRole = { 
        id: 'editor', 
        name: 'Editor', 
        permissions: ['users.view', 'users.edit'], 
        description: 'Can edit users' 
      };
      
      const roleStore = useRoleStore();
      roleStore.roles = [adminRole, editorRole];
      
      // Test getting a role by ID
      expect(roleStore.getRoleById('admin')).toEqual(adminRole);
      expect(roleStore.getRoleById('editor')).toEqual(editorRole);
      expect(roleStore.getRoleById('nonexistent')).toBeUndefined();
    });
  });

  describe('clearError', () => {
    it('should clear the error state', () => {
      // Setup initial state
      const roleStore = useRoleStore();
      roleStore.error = 'Some error';
      
      // Clear error
      roleStore.clearError();
      
      // Verify error was cleared
      expect(roleStore.error).toBeNull();
    });
  });
}); 
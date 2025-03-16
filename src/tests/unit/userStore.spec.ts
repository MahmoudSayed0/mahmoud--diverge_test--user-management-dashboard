import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import { api } from '@/lib/mockApi';

// Mock the API
vi.mock('@/lib/mockApi', () => ({
  api: {
    getUsers: vi.fn(),
    getUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
  }
}));

describe('User Store', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia());
    
    // Reset all mocks
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchUsers', () => {
    it('should fetch users successfully', async () => {
      // Mock API response
      const mockResponse = {
        data: [
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', createdAt: '2023-01-01' }
        ],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10
        }
      };
      
      (api.getUsers as any).mockResolvedValue(mockResponse);
      
      const userStore = useUserStore();
      await userStore.fetchUsers();
      
      // Verify API was called with correct parameters
      expect(api.getUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        role: undefined,
        status: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      // Verify store state was updated correctly
      expect(userStore.users).toEqual(mockResponse.data);
      expect(userStore.totalItems).toBe(1);
      expect(userStore.totalPages).toBe(1);
      expect(userStore.isLoading).toBe(false);
      expect(userStore.error).toBeNull();
    });

    it('should handle API errors', async () => {
      // Mock API error
      const errorMessage = 'Failed to fetch users';
      (api.getUsers as any).mockRejectedValue({ message: errorMessage });
      
      const userStore = useUserStore();
      await userStore.fetchUsers();
      
      // Verify error handling
      expect(userStore.isLoading).toBe(false);
      expect(userStore.error).toBe(errorMessage);
      expect(userStore.users).toEqual([]);
    });
  });

  describe('fetchUserById', () => {
    it('should fetch a single user by ID', async () => {
      // Mock API response
      const mockUser = { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com', 
        role: 'admin', 
        status: 'active', 
        createdAt: '2023-01-01' 
      };
      
      (api.getUser as any).mockResolvedValue(mockUser);
      
      const userStore = useUserStore();
      await userStore.fetchUserById(1);
      
      // Verify API was called with correct parameters
      expect(api.getUser).toHaveBeenCalledWith(1);
      
      // Verify store state was updated correctly
      expect(userStore.currentUser).toEqual(mockUser);
      expect(userStore.isLoading).toBe(false);
      expect(userStore.error).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a user with optimistic update', async () => {
      // Mock API response
      const newUser = { 
        name: 'Jane Doe', 
        email: 'jane@example.com', 
        role: 'editor', 
        status: 'active' 
      };
      
      const createdUser = { 
        ...newUser, 
        id: 2, 
        createdAt: '2023-01-02' 
      };
      
      (api.createUser as any).mockResolvedValue(createdUser);
      
      const userStore = useUserStore();
      const result = await userStore.createUser(newUser);
      
      // Verify API was called with correct parameters
      expect(api.createUser).toHaveBeenCalledWith(newUser);
      
      // Verify result
      expect(result).toEqual(createdUser);
      
      // Verify store state was updated
      expect(userStore.users).toContainEqual(createdUser);
      expect(userStore.totalItems).toBe(1);
    });
  });

  describe('updateUser', () => {
    it('should update a user with optimistic update', async () => {
      // Setup initial state
      const initialUser = { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com', 
        role: 'admin', 
        status: 'active', 
        createdAt: '2023-01-01' 
      };
      
      const userStore = useUserStore();
      userStore.users = [initialUser];
      
      // Mock API response
      const updatedFields = { name: 'John Smith', role: 'manager' };
      const updatedUser = { ...initialUser, ...updatedFields };
      
      (api.updateUser as any).mockResolvedValue(updatedUser);
      
      // Update the user
      await userStore.updateUser(1, updatedFields);
      
      // Verify API was called with correct parameters
      expect(api.updateUser).toHaveBeenCalledWith(1, updatedFields);
      
      // Verify store state was updated optimistically
      expect(userStore.users[0]).toEqual(updatedUser);
    });

    it('should rollback optimistic update on error', async () => {
      // Setup initial state
      const initialUser = { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com', 
        role: 'admin', 
        status: 'active', 
        createdAt: '2023-01-01' 
      };
      
      const userStore = useUserStore();
      userStore.users = [initialUser];
      
      // Mock API error
      const updatedFields = { name: 'John Smith', role: 'manager' };
      (api.updateUser as any).mockRejectedValue({ message: 'Update failed' });
      
      // Attempt to update the user
      try {
        await userStore.updateUser(1, updatedFields);
      } catch (error) {
        // Expected to throw
      }
      
      // Verify store state was rolled back
      expect(userStore.users[0]).toEqual(initialUser);
      expect(userStore.error).toBe('Update failed');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user with optimistic update', async () => {
      // Setup initial state
      const user1 = { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com', 
        role: 'admin', 
        status: 'active', 
        createdAt: '2023-01-01' 
      };
      
      const user2 = { 
        id: 2, 
        name: 'Jane Doe', 
        email: 'jane@example.com', 
        role: 'editor', 
        status: 'active', 
        createdAt: '2023-01-02' 
      };
      
      const userStore = useUserStore();
      userStore.users = [user1, user2];
      userStore.totalItems = 2;
      
      // Mock API response
      (api.deleteUser as any).mockResolvedValue({ success: true });
      
      // Delete the user
      await userStore.deleteUser(1);
      
      // Verify API was called with correct parameters
      expect(api.deleteUser).toHaveBeenCalledWith(1);
      
      // Verify store state was updated optimistically
      expect(userStore.users).toEqual([user2]);
      expect(userStore.totalItems).toBe(1);
    });
  });

  describe('setFilters', () => {
    it('should update filter state and reset page', () => {
      const userStore = useUserStore();
      userStore.currentPage = 3;
      
      userStore.setFilters({ search: 'test', role: 'admin', status: 'active' });
      
      expect(userStore.searchQuery).toBe('test');
      expect(userStore.roleFilter).toBe('admin');
      expect(userStore.statusFilter).toBe('active');
      expect(userStore.currentPage).toBe(1); // Should reset to page 1
    });
  });

  describe('setSort', () => {
    it('should toggle sort direction when same column is selected', () => {
      const userStore = useUserStore();
      userStore.sortBy = 'name';
      userStore.sortDirection = 'asc';
      
      userStore.setSort('name');
      
      expect(userStore.sortBy).toBe('name');
      expect(userStore.sortDirection).toBe('desc');
      
      userStore.setSort('name');
      
      expect(userStore.sortDirection).toBe('asc');
    });

    it('should set new sort column and reset direction to asc', () => {
      const userStore = useUserStore();
      userStore.sortBy = 'name';
      userStore.sortDirection = 'desc';
      
      userStore.setSort('email');
      
      expect(userStore.sortBy).toBe('email');
      expect(userStore.sortDirection).toBe('asc');
    });
  });
}); 
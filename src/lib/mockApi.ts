// Mock API implementation for User Management Dashboard

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
  department?: string;
  location?: string;
  phone?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  department?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Configuration
const API_DELAY_MIN = 300; // Minimum delay in ms
const API_DELAY_MAX = 800; // Maximum delay in ms
const ITEMS_PER_PAGE_DEFAULT = 10;
let ERROR_RATE = 0.1; // 10% chance of error for testing error handling

// Utility functions
const randomDelay = (): number => {
  return Math.floor(Math.random() * (API_DELAY_MAX - API_DELAY_MIN + 1)) + API_DELAY_MIN;
};

const shouldFail = (): boolean => {
  return Math.random() < ERROR_RATE;
};

// Mock data - Roles
const roles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'roles.view', 'settings.edit'],
    description: 'Full system access with all permissions'
  },
  {
    id: 'manager',
    name: 'Manager',
    permissions: ['users.view', 'users.create', 'users.edit', 'roles.view'],
    description: 'Can manage users but cannot delete them or change system settings'
  },
  {
    id: 'editor',
    name: 'Editor',
    permissions: ['users.view', 'users.edit'],
    description: 'Can view and edit user information but cannot create or delete users'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    permissions: ['users.view'],
    description: 'Read-only access to user information'
  },
  {
    id: 'guest',
    name: 'Guest',
    permissions: [],
    description: 'Limited access with no user management capabilities'
  }
];

// Generate mock users
const generateMockUsers = (count: number): User[] => {
  const statuses: ('active' | 'inactive' | 'pending')[] = ['active', 'inactive', 'pending'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'Support', 'HR', 'Finance', 'Product', 'Design'];
  const locations = ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Remote'];
  
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    const firstName = ['John', 'Jane', 'Alex', 'Emma', 'Michael', 'Olivia', 'William', 'Sophia', 'James', 'Ava'][i % 10];
    const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][Math.floor(i / 10) % 10];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@example.com`;
    const roleIndex = i % roles.length;
    const role = roles[roleIndex].id;
    const statusIndex = i % statuses.length;
    const status = statuses[statusIndex];
    
    // Generate dates within the last year
    const createdAtDate = new Date();
    createdAtDate.setDate(createdAtDate.getDate() - (id * 7) % 365);
    const createdAt = createdAtDate.toISOString();
    
    const lastLoginDate = new Date();
    lastLoginDate.setDate(lastLoginDate.getDate() - (id * 3) % 30);
    const lastLogin = status === 'active' ? lastLoginDate.toISOString() : undefined;
    
    return {
      id,
      name,
      email,
      avatar: `https://i.pravatar.cc/150?u=${id}`,
      role,
      status,
      lastLogin,
      createdAt,
      department: departments[id % departments.length],
      location: locations[id % locations.length],
      phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    };
  });
};

// Initialize mock data
const users = generateMockUsers(55);

// API implementation
export const api = {
  // Get users with pagination, filtering, and sorting
  getUsers: async (params: QueryParams = {}): Promise<PaginatedResponse<User> | ApiError> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random failures
        if (shouldFail()) {
          reject({
            status: 500,
            message: 'Server error while fetching users',
            code: 'SERVER_ERROR'
          });
          return;
        }

        // Apply filters
        let filteredUsers = [...users];
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchLower) || 
            user.email.toLowerCase().includes(searchLower) ||
            (user.department && user.department.toLowerCase().includes(searchLower)) ||
            (user.location && user.location.toLowerCase().includes(searchLower))
          );
        }
        
        if (params.role) {
          filteredUsers = filteredUsers.filter(user => user.role === params.role);
        }
        
        if (params.status) {
          filteredUsers = filteredUsers.filter(user => user.status === params.status);
        }
        
        if (params.department) {
          filteredUsers = filteredUsers.filter(user => 
            user.department && user.department.toLowerCase() === params.department.toLowerCase()
          );
        }
        
        if (params.location) {
          filteredUsers = filteredUsers.filter(user => 
            user.location && user.location.toLowerCase() === params.location.toLowerCase()
          );
        }
        
        // Apply sorting
        if (params.sortBy) {
          const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
          filteredUsers.sort((a, b) => {
            const aValue = a[params.sortBy as keyof User];
            const bValue = b[params.sortBy as keyof User];
            
            if (aValue === undefined && bValue === undefined) return 0;
            if (aValue === undefined) return sortOrder;
            if (bValue === undefined) return -sortOrder;
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return sortOrder * aValue.localeCompare(bValue);
            }
            
            if (aValue < bValue) return -sortOrder;
            if (aValue > bValue) return sortOrder;
            return 0;
          });
        }
        
        // Apply pagination
        const page = params.page || 1;
        const limit = params.limit || ITEMS_PER_PAGE_DEFAULT;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        resolve({
          data: paginatedUsers,
          meta: {
            currentPage: page,
            totalPages: Math.ceil(filteredUsers.length / limit),
            totalItems: filteredUsers.length,
            itemsPerPage: limit
          }
        });
      }, randomDelay());
    });
  },
  
  // Get a specific user by ID
  getUser: async (id: number): Promise<User | ApiError> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail()) {
          reject({
            status: 500,
            message: `Server error while fetching user ${id}`,
            code: 'SERVER_ERROR'
          });
          return;
        }
        
        const user = users.find(u => u.id === id);
        
        if (!user) {
          reject({
            status: 404,
            message: `User with ID ${id} not found`,
            code: 'USER_NOT_FOUND'
          });
          return;
        }
        
        resolve(user);
      }, randomDelay());
    });
  },
  
  // Update a user
  updateUser: async (id: number, userData: Partial<User>): Promise<User | ApiError> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail()) {
          reject({
            status: 500,
            message: `Server error while updating user ${id}`,
            code: 'SERVER_ERROR'
          });
          return;
        }
        
        const userIndex = users.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
          reject({
            status: 404,
            message: `User with ID ${id} not found`,
            code: 'USER_NOT_FOUND'
          });
          return;
        }
        
        // Validate email uniqueness if changing email
        if (userData.email && userData.email !== users[userIndex].email) {
          const emailExists = users.some(u => u.id !== id && u.email === userData.email);
          if (emailExists) {
            reject({
              status: 400,
              message: 'Email address is already in use',
              code: 'EMAIL_ALREADY_EXISTS'
            });
            return;
          }
        }
        
        // Update user
        const updatedUser = {
          ...users[userIndex],
          ...userData,
          id // Ensure ID doesn't change
        };
        
        users[userIndex] = updatedUser;
        
        resolve(updatedUser);
      }, randomDelay());
    });
  },
  
  // Create a new user
  createUser: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User | ApiError> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail()) {
          reject({
            status: 500,
            message: 'Server error while creating user',
            code: 'SERVER_ERROR'
          });
          return;
        }
        
        // Validate required fields
        if (!userData.name || !userData.email || !userData.role || !userData.status) {
          reject({
            status: 400,
            message: 'Missing required fields',
            code: 'MISSING_REQUIRED_FIELDS'
          });
          return;
        }
        
        // Validate email uniqueness
        const emailExists = users.some(u => u.email === userData.email);
        if (emailExists) {
          reject({
            status: 400,
            message: 'Email address is already in use',
            code: 'EMAIL_ALREADY_EXISTS'
          });
          return;
        }
        
        // Create new user
        const newId = Math.max(...users.map(u => u.id)) + 1;
        const newUser: User = {
          ...userData,
          id: newId,
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        
        resolve(newUser);
      }, randomDelay());
    });
  },
  
  // Delete a user
  deleteUser: async (id: number): Promise<{ success: boolean } | ApiError> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail()) {
          reject({
            status: 500,
            message: `Server error while deleting user ${id}`,
            code: 'SERVER_ERROR'
          });
          return;
        }
        
        const userIndex = users.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
          reject({
            status: 404,
            message: `User with ID ${id} not found`,
            code: 'USER_NOT_FOUND'
          });
          return;
        }
        
        // Remove user
        users.splice(userIndex, 1);
        
        resolve({ success: true });
      }, randomDelay());
    });
  },
  
  // Get available roles
  getRoles: async (): Promise<Role[] | ApiError> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail()) {
          reject({
            status: 500,
            message: 'Server error while fetching roles',
            code: 'SERVER_ERROR'
          });
          return;
        }
        
        resolve([...roles]);
      }, randomDelay());
    });
  },
  
  // Toggle error simulation
  setErrorRate: (rate: number): void => {
    if (rate >= 0 && rate <= 1) {
      ERROR_RATE = rate;
    }
  }
};

export default api; 
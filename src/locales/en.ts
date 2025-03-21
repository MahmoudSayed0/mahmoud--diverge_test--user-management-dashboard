export default {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    noResults: 'No results found',
    actions: 'Actions',
    confirm: 'Confirm',
    back: 'Back to Users',
    next: 'Next',
    previous: 'Previous',
    rowsPerPage: 'Rows per page',
    showing: 'Showing {start}-{end} of {total} items',
    language: 'Language',
    english: 'English',
    arabic: 'Arabic',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    switchLanguage: 'Switch Language',
    openMenu: 'Open menu',
    notSpecified: 'Not specified',
    export: 'Export',
    exportCSV: 'Export as CSV',
    exportPDF: 'Export as PDF',
    exportDate: 'Export Date',
    exportSuccess: 'Export successful',
    exportFailed: 'Export failed',
  },
  validation: {
    required: '{field} is required',
    email: 'Please enter a valid email address',
    minLength: '{field} must be at least {min} characters',
    maxLength: '{field} must not exceed {max} characters',
    passwordMatch: 'Passwords do not match',
  },
  userManagement: {
    title: 'User Management',
    addUser: 'Add User',
    editUser: 'Edit User',
    viewUser: 'View User',
    deleteUser: 'Delete User',
    userDetails: 'User Details',
    createUser: 'Create User',
    userList: 'User List',
    userCreated: 'User created successfully',
    userUpdated: 'User updated successfully',
    userDeleted: 'User deleted successfully',
    confirmDelete: 'Are you sure you want to delete this user? This action cannot be undone.',
    searchUsers: 'Search users...',
    filterByRole: 'Filter by role',
    filterByStatus: 'Filter by status',
    clearFilters: 'Clear Filters',
    allRoles: 'All Roles',
    allStatuses: 'All Statuses',
    updateUserInfo: 'Update user information',
    userInfo: 'User Information',
    failedToLoadUser: 'Failed to load user data',
    failedToUpdateUser: 'Failed to update user',
    failedToDeleteUser: 'Failed to delete user',
  },
  userFields: {
    id: 'ID',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    status: 'Status',
    createdAt: 'Date Joined',
    lastLogin: 'Last Login',
    department: 'Department',
    location: 'Location',
    phone: 'Phone',
    avatar: 'Avatar',
  },
  roles: {
    admin: 'Administrator',
    user: 'User',
    manager: 'Manager',
    editor: 'Editor',
    viewer: 'Viewer',
  },
  statuses: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    suspended: 'Suspended',
  },
  filters: {
    title: 'Filters',
    role: 'Role',
    status: 'Status',
    search: 'Search',
    active: 'Active Filters',
    clearAll: 'Clear All',
    allRoles: 'All Roles',
    allStatuses: 'All Statuses',
  },
  userTable: {
    name: 'Name',
    email: 'Email',
    role: 'Role',
    status: 'Status',
    department: 'Department',
    location: 'Location',
    phone: 'Phone',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
  },
  userForm: {
    nameLabel: 'Name',
    namePlaceholder: 'Enter name',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter email',
    roleLabel: 'Role',
    rolePlaceholder: 'Select role',
    statusLabel: 'Status',
    statusPlaceholder: 'Select status',
    departmentLabel: 'Department',
    departmentPlaceholder: 'Enter department',
    locationLabel: 'Location',
    locationPlaceholder: 'Enter location',
    phoneLabel: 'Phone',
    phonePlaceholder: 'Enter phone number',
    requiredField: 'This field is required',
    invalidEmail: 'Please enter a valid email',
  },
  pagination: {
    previous: 'Previous',
    next: 'Next',
    of: 'of',
    showing: 'Showing',
    entries: 'entries',
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    forgotPassword: 'Forgot Password',
    resetPassword: 'Reset Password',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember Me',
    loginSuccess: 'Login successful',
    loginError: 'Invalid email or password',
    sessionExpired: 'Your session has expired. Please login again.',
    sessionTimeoutWarning: 'Session Timeout Warning',
    sessionAboutToExpire: 'Your session is about to expire due to inactivity.',
    autoLogoutWarning: 'You will be automatically logged out when the timer reaches zero.',
    logoutNow: 'Logout Now',
    continueSession: 'Continue Session',
    loginDescription: 'Enter your credentials to access the User Management Dashboard',
    demoCredentials: 'Demo Credentials',
    loggingIn: 'Logging in...',
  },
}; 
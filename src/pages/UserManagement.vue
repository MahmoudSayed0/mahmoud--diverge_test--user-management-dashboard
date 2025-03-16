<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '@/lib/mockApi';
import type { User, QueryParams } from '@/lib/mockApi';

// UI Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, UserPlus } from 'lucide-vue-next';

// User Components
import UserTable from '@/components/user/UserTable.vue';
import UserFilters from '@/components/user/UserFilters.vue';
import UserPagination from '@/components/user/UserPagination.vue';
import UserCreateSheet from '@/components/user/UserCreateSheet.vue';
import ExportMenu from '@/components/user/ExportMenu.vue';

const router = useRouter();
const { t } = useI18n();

// State management
const users = ref<User[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const totalItems = ref(0);
const totalPages = ref(0);

// Sheet state
const isCreateSheetOpen = ref(false);

// Search and filter state
const searchQuery = ref('');
const roleFilter = ref('');
const statusFilter = ref('');
const sortBy = ref('name');
const sortDirection = ref<'asc' | 'desc'>('asc');

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Available roles and statuses for filtering
const availableRoles = [
  { label: t('filters.allRoles'), value: '' },
  { label: t('roles.admin'), value: 'admin' },
  { label: t('roles.manager'), value: 'manager' },
  { label: t('roles.editor'), value: 'editor' },
  { label: t('roles.viewer'), value: 'viewer' },
  { label: t('roles.user'), value: 'user' }
];

const availableStatuses = [
  { label: t('filters.allStatuses'), value: '' },
  { label: t('statuses.active'), value: 'active' },
  { label: t('statuses.inactive'), value: 'inactive' },
  { label: t('statuses.pending'), value: 'pending' },
  { label: t('statuses.suspended'), value: 'suspended' }
];

// Fetch users from API
const fetchUsers = async () => {
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
    error.value = err.message || 'Failed to load users';
    console.error('Error fetching users:', err);
  } finally {
    isLoading.value = false;
  }
};

// Handle sorting
const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDirection.value = 'asc';
  }
};

// Handle filters
const handleFilter = (filters: { search: string; role: string; status: string }) => {
  searchQuery.value = filters.search;
  roleFilter.value = filters.role;
  statusFilter.value = filters.status;
  currentPage.value = 1; // Reset to first page when filters change
};

// Handle pagination
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// Handle items per page change
const handleItemsPerPageChange = (newItemsPerPage: number) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1; // Reset to first page when items per page changes
};

// View user details
const viewUserDetails = (userId: number) => {
  router.push(`/users/${userId}`);
};

// Edit user
const editUser = (userId: number) => {
  router.push(`/users/${userId}`);
};

// Add new user
const addNewUser = () => {
  isCreateSheetOpen.value = true;
};

// Handle user created
const handleUserCreated = () => {
  fetchUsers(); // Refresh the user list
};

// Watch for changes in filters and pagination
watch(
  [searchQuery, roleFilter, statusFilter, sortBy, sortDirection, currentPage, itemsPerPage],
  () => {
    fetchUsers();
  }
);

// Load data on component mount
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ t('userManagement.title') }}</h1>
      <div class="flex gap-2">
        <ExportMenu :users="users" fileName="users-list" />
        <Button @click="addNewUser">
          <UserPlus class="h-4 w-4 mr-2" />
          {{ t('userManagement.addUser') }}
        </Button>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="mb-6">
      <UserFilters 
        :availableRoles="availableRoles"
        :availableStatuses="availableStatuses"
        @filter-change="handleFilter" 
      />
    </div>
    
    <!-- Error state -->
    <Alert v-if="error" variant="destructive" class="mb-6">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>{{ t('common.error') }}</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>
    
    <!-- User table -->
    <div class="bg-card rounded-lg shadow overflow-hidden">
      <!-- Loading state -->
      <div v-if="isLoading" class="p-4">
        <div class="space-y-3">
          <Skeleton class="h-8 w-full" />
          <Skeleton class="h-8 w-full" />
          <Skeleton class="h-8 w-full" />
          <Skeleton class="h-8 w-full" />
          <Skeleton class="h-8 w-full" />
        </div>
      </div>
      
      <!-- Table -->
      <UserTable 
        v-else
        :users="users"
        :sortBy="sortBy"
        :sortDirection="sortDirection"
        :isLoading="isLoading"
        @sort="handleSort"
        @view="viewUserDetails"
        @edit="editUser"
      />
      
      <!-- Pagination -->
      <div class="p-4 border-t">
        <UserPagination
          :currentPage="currentPage"
          :itemsPerPage="itemsPerPage"
          :totalItems="totalItems"
          @page-change="handlePageChange"
          @items-per-page-change="handleItemsPerPageChange"
        />
      </div>
    </div>
    
    <!-- Create User Sheet -->
    <UserCreateSheet 
      v-model:open="isCreateSheetOpen"
      @created="handleUserCreated"
    />
  </div>
</template> 
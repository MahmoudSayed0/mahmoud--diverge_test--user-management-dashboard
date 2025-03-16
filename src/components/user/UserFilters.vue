<template>
  <div class="space-y-4">
    <!-- Filter Controls -->
    <div class="flex flex-col sm:flex-row gap-4" role="search" aria-label="User filters">
      <!-- Search Input -->
      <div class="flex-1">
        <Label for="search-input" class="text-sm font-medium mb-1.5 block">{{ t('filters.search') }}</Label>
        <Input
          id="search-input"
          v-model="searchQuery"
          :placeholder="t('userManagement.searchUsers')"
          class="w-full"
          aria-label="Search users"
          @keydown.enter="emitFilters"
        >
          <template #prefix>
            <Search class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </template>
        </Input>
      </div>

      <!-- Role Filter -->
      <div class="w-full sm:w-48">
        <Label for="role-filter" class="text-sm font-medium mb-1.5 block">{{ t('filters.role') }}</Label>
        <select
          id="role-filter"
          v-model="selectedRole"
          class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          @change="emitFilters"
          aria-label="Filter by role"
        >
          <option value="">{{ t('filters.allRoles') }}</option>
          <option v-for="role in props.availableRoles" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>
      </div>

      <!-- Status Filter -->
      <div class="w-full sm:w-48">
        <Label for="status-filter" class="text-sm font-medium mb-1.5 block">{{ t('filters.status') }}</Label>
        <select
          id="status-filter"
          v-model="selectedStatus"
          class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          @change="emitFilters"
          aria-label="Filter by status"
        >
          <option value="">{{ t('filters.allStatuses') }}</option>
          <option v-for="status in props.availableStatuses" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </div>

      <!-- Clear Filters Button -->
      <div class="w-full sm:w-auto self-end">
        <Button
          v-if="hasActiveFilters"
          variant="outline"
          @click="clearFilters"
          class="w-full"
          aria-label="Clear all filters"
        >
          {{ t('filters.clearAll') }}
          <X class="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
    
    <!-- Active Filter Badges -->
    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2" aria-live="polite" aria-atomic="true">
      <Label class="text-sm font-medium mb-1 block">{{ t('filters.active') }}:</Label>
      <!-- Search Badge -->
      <Badge v-if="searchQuery" variant="secondary" class="flex items-center gap-1">
        <span>{{ t('filters.search') }}: {{ truncateText(searchQuery, 20) }}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-4 w-4 p-0 ml-1" 
          @click="clearSearch"
          aria-label="Clear search filter"
        >
          <X class="h-3 w-3" aria-hidden="true" />
        </Button>
      </Badge>
      
      <!-- Role Badge -->
      <Badge v-if="selectedRole" variant="secondary" class="flex items-center gap-1">
        <span>{{ t('filters.role') }}: {{ getRoleLabel(selectedRole) }}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-4 w-4 p-0 ml-1" 
          @click="clearRole"
          aria-label="Clear role filter"
        >
          <X class="h-3 w-3" aria-hidden="true" />
        </Button>
      </Badge>
      
      <!-- Status Badge -->
      <Badge v-if="selectedStatus" variant="secondary" class="flex items-center gap-1">
        <span>{{ t('filters.status') }}: {{ getStatusLabel(selectedStatus) }}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-4 w-4 p-0 ml-1" 
          @click="clearStatus"
          aria-label="Clear status filter"
        >
          <X class="h-3 w-3" aria-hidden="true" />
        </Button>
      </Badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-vue-next';

const { t } = useI18n();

// Props for customization
const props = defineProps({
  availableRoles: {
    type: Array as () => { label: string; value: string }[],
    default: () => [
      { label: 'All Roles', value: '' },
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
      { label: 'Manager', value: 'manager' },
      { label: 'Developer', value: 'developer' },
      { label: 'Analyst', value: 'analyst' }
    ]
  },
  availableStatuses: {
    type: Array as () => { label: string; value: string }[],
    default: () => [
      { label: 'All Statuses', value: '' },
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending', value: 'pending' },
      { label: 'Suspended', value: 'suspended' }
    ]
  }
});

// Filter state
const searchQuery = ref('');
const selectedRole = ref('');
const selectedStatus = ref('');

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || 
         selectedRole.value !== '' || 
         selectedStatus.value !== '';
});

// Emit filter changes to parent component
const emit = defineEmits(['filter-change']);

const emitFilters = () => {
  emit('filter-change', {
    search: searchQuery.value,
    role: selectedRole.value,
    status: selectedStatus.value
  });
};

// Helper functions for filter badges
const getRoleLabel = (value: string) => {
  const role = props.availableRoles.find(r => r.value === value);
  return role ? role.label.replace(t('filters.allRoles').replace(/All /g, ''), '') : value;
};

const getStatusLabel = (value: string) => {
  const status = props.availableStatuses.find(s => s.value === value);
  return status ? status.label.replace(t('filters.allStatuses').replace(/All /g, ''), '') : value;
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Clear individual filters
const clearSearch = () => {
  searchQuery.value = '';
  emitFilters();
};

const clearRole = () => {
  selectedRole.value = '';
  emitFilters();
};

const clearStatus = () => {
  selectedStatus.value = '';
  emitFilters();
};

// Clear all filters
const clearFilters = () => {
  searchQuery.value = '';
  selectedRole.value = '';
  selectedStatus.value = '';
  emitFilters();
};

// Watch for changes in filter values
watch([searchQuery], () => {
  emitFilters();
}, { deep: true });
</script>

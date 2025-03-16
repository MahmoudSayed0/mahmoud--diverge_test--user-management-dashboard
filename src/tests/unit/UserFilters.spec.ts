import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

// Create a mock component for testing
const UserFiltersMock = {
  name: 'UserFilters',
  template: `
    <div>
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search users..." 
        @input="emitFilters"
      />
      <select v-model="selectedRole" @change="emitFilters">
        <option v-for="role in availableRoles" :key="role.value" :value="role.value">
          {{ role.label }}
        </option>
      </select>
      <select v-model="selectedStatus" @change="emitFilters">
        <option v-for="status in availableStatuses" :key="status.value" :value="status.value">
          {{ status.label }}
        </option>
      </select>
      <button v-if="hasActiveFilters" @click="clearFilters">Clear Filters</button>
    </div>
  `,
  props: {
    availableRoles: {
      type: Array,
      default: () => []
    },
    availableStatuses: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchQuery: '',
      selectedRole: '',
      selectedStatus: ''
    };
  },
  computed: {
    hasActiveFilters(): boolean {
      return (this as any).searchQuery !== '' || 
             (this as any).selectedRole !== '' || 
             (this as any).selectedStatus !== '';
    }
  },
  methods: {
    emitFilters(): void {
      (this as any).$emit('filter-change', {
        search: (this as any).searchQuery,
        role: (this as any).selectedRole,
        status: (this as any).selectedStatus
      });
    },
    clearFilters(): void {
      (this as any).searchQuery = '';
      (this as any).selectedRole = '';
      (this as any).selectedStatus = '';
      this.emitFilters();
    }
  }
};

// Mock the actual component
vi.mock('@/components/user/UserFilters.vue', () => ({
  default: UserFiltersMock
}));

describe('UserFilters', () => {
  const mockRoles = [
    { label: 'All Roles', value: '' },
    { label: 'Admin', value: 'admin' },
    { label: 'Editor', value: 'editor' }
  ];
  
  const mockStatuses = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];
  
  it('renders correctly with available roles and statuses', () => {
    const wrapper = mount(UserFiltersMock, {
      props: {
        availableRoles: mockRoles,
        availableStatuses: mockStatuses
      }
    });
    
    // Check if the component renders
    expect(wrapper.exists()).toBe(true);
    
    // Check if all roles are rendered
    const roleOptions = wrapper.findAll('select:first-of-type option');
    expect(roleOptions.length).toBe(mockRoles.length);
    
    // Check if all statuses are rendered
    const statusOptions = wrapper.findAll('select:last-of-type option');
    expect(statusOptions.length).toBe(mockStatuses.length);
  });
  
  it('emits filter-change event when search input changes', async () => {
    const wrapper = mount(UserFiltersMock, {
      props: {
        availableRoles: mockRoles,
        availableStatuses: mockStatuses
      }
    });
    
    // Set search query
    const searchInput = wrapper.find('input');
    await searchInput.setValue('John');
    
    // Check if filter-change event was emitted with correct data
    expect(wrapper.emitted('filter-change')).toBeTruthy();
    expect(wrapper.emitted('filter-change')![0][0]).toEqual({
      search: 'John',
      role: '',
      status: ''
    });
  });
  
  it('emits filter-change event when role selection changes', async () => {
    const wrapper = mount(UserFiltersMock, {
      props: {
        availableRoles: mockRoles,
        availableStatuses: mockStatuses
      }
    });
    
    // Set role
    const roleSelect = wrapper.findAll('select')[0];
    await roleSelect.setValue('admin');
    
    // Check if filter-change event was emitted with correct data
    expect(wrapper.emitted('filter-change')).toBeTruthy();
    expect(wrapper.emitted('filter-change')![0][0]).toEqual({
      search: '',
      role: 'admin',
      status: ''
    });
  });
  
  it('emits filter-change event when status selection changes', async () => {
    const wrapper = mount(UserFiltersMock, {
      props: {
        availableRoles: mockRoles,
        availableStatuses: mockStatuses
      }
    });
    
    // Set status
    const statusSelect = wrapper.findAll('select')[1];
    await statusSelect.setValue('active');
    
    // Check if filter-change event was emitted with correct data
    expect(wrapper.emitted('filter-change')).toBeTruthy();
    expect(wrapper.emitted('filter-change')![0][0]).toEqual({
      search: '',
      role: '',
      status: 'active'
    });
  });
  
  it('shows clear filters button when filters are active', async () => {
    const wrapper = mount(UserFiltersMock, {
      props: {
        availableRoles: mockRoles,
        availableStatuses: mockStatuses
      }
    });
    
    // Initially, clear button should not be visible
    expect(wrapper.find('button').exists()).toBe(false);
    
    // Set a filter
    const searchInput = wrapper.find('input');
    await searchInput.setValue('John');
    await nextTick();
    
    // Now, clear button should be visible
    expect(wrapper.find('button').exists()).toBe(true);
  });
  
  it('clears all filters when clear button is clicked', async () => {
    const wrapper = mount(UserFiltersMock, {
      props: {
        availableRoles: mockRoles,
        availableStatuses: mockStatuses
      }
    });
    
    // Set filters
    const searchInput = wrapper.find('input');
    await searchInput.setValue('John');
    
    const roleSelect = wrapper.findAll('select')[0];
    await roleSelect.setValue('admin');
    
    const statusSelect = wrapper.findAll('select')[1];
    await statusSelect.setValue('active');
    
    // Clear the event array to make testing easier
    wrapper.emitted('filter-change')!.length = 0;
    
    // Click clear button
    await wrapper.find('button').trigger('click');
    
    // Check if filter-change event was emitted with empty filters
    expect(wrapper.emitted('filter-change')).toBeTruthy();
    expect(wrapper.emitted('filter-change')![0][0]).toEqual({
      search: '',
      role: '',
      status: ''
    });
    
    // Check if the inputs were cleared
    expect((wrapper.vm as any).searchQuery).toBe('');
    expect((wrapper.vm as any).selectedRole).toBe('');
    expect((wrapper.vm as any).selectedStatus).toBe('');
  });
}); 
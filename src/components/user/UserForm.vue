<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '@/lib/mockApi';
import type { Role, User } from '@/lib/mockApi';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Save } from 'lucide-vue-next';

const props = defineProps<{
  user?: User;
  mode: 'create' | 'edit';
}>();

const emit = defineEmits<{
  (e: 'submit', userData: Partial<User>): void;
  (e: 'cancel'): void;
}>();

// State management
const roles = ref<Role[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Form state
const form = ref({
  name: props.user?.name || '',
  email: props.user?.email || '',
  role: props.user?.role || '',
  status: props.user?.status || 'active',
  department: props.user?.department || '',
  location: props.user?.location || '',
  phone: props.user?.phone || ''
});

// Form validation
const formErrors = ref({
  name: '',
  email: '',
  role: '',
  status: ''
});

// Validation rules
const validateForm = () => {
  let isValid = true;
  formErrors.value = {
    name: '',
    email: '',
    role: '',
    status: ''
  };

  if (!form.value.name.trim()) {
    formErrors.value.name = 'Name is required';
    isValid = false;
  }

  if (!form.value.email.trim()) {
    formErrors.value.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    formErrors.value.email = 'Please enter a valid email address';
    isValid = false;
  }

  if (!form.value.role) {
    formErrors.value.role = 'Role is required';
    isValid = false;
  }

  if (!form.value.status) {
    formErrors.value.status = 'Status is required';
    isValid = false;
  }

  return isValid;
};

// Fetch roles
const fetchRoles = async () => {
  isLoading.value = true;
  try {
    const rolesData = await api.getRoles();
    roles.value = rolesData as Role[];
  } catch (err: any) {
    console.error('Error fetching roles:', err);
  } finally {
    isLoading.value = false;
  }
};

// Submit form
const submitForm = () => {
  if (!validateForm()) {
    return;
  }
  
  const userData = {
    name: form.value.name,
    email: form.value.email,
    role: form.value.role,
    status: form.value.status as 'active' | 'inactive' | 'pending',
    department: form.value.department || undefined,
    location: form.value.location || undefined,
    phone: form.value.phone || undefined
  };
  
  emit('submit', userData);
};

// Button text based on mode
const buttonText = computed(() => {
  return props.mode === 'create' ? 'Create User' : 'Save Changes';
});

// Load roles on component mount
onMounted(() => {
  fetchRoles();
});
</script>

<template>
  <!-- Error state -->
  <Alert v-if="error" variant="destructive" class="mb-6">
    <AlertCircle class="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{{ error }}</AlertDescription>
  </Alert>

  <form @submit.prevent="submitForm" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Name field -->
      <div class="space-y-2">
        <Label for="name">Full Name</Label>
        <Input 
          id="name" 
          v-model="form.name" 
          :class="{ 'border-red-500': formErrors.name }"
        />
        <p v-if="formErrors.name" class="text-sm text-red-500">{{ formErrors.name }}</p>
      </div>
      
      <!-- Email field -->
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          v-model="form.email" 
          :class="{ 'border-red-500': formErrors.email }"
        />
        <p v-if="formErrors.email" class="text-sm text-red-500">{{ formErrors.email }}</p>
      </div>
      
      <!-- Role field -->
      <div class="space-y-2">
        <Label for="role">Role</Label>
        <Select v-model="form.role">
          <SelectTrigger :class="{ 'border-red-500': formErrors.role }">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="formErrors.role" class="text-sm text-red-500">{{ formErrors.role }}</p>
      </div>
      
      <!-- Status field -->
      <div class="space-y-2">
        <Label for="status">Status</Label>
        <Select v-model="form.status">
          <SelectTrigger :class="{ 'border-red-500': formErrors.status }">
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="formErrors.status" class="text-sm text-red-500">{{ formErrors.status }}</p>
      </div>
      
      <!-- Department field -->
      <div class="space-y-2">
        <Label for="department">Department</Label>
        <Input id="department" v-model="form.department" />
      </div>
      
      <!-- Location field -->
      <div class="space-y-2">
        <Label for="location">Location</Label>
        <Input id="location" v-model="form.location" />
      </div>
      
      <!-- Phone field -->
      <div class="space-y-2">
        <Label for="phone">Phone</Label>
        <Input id="phone" v-model="form.phone" />
      </div>
    </div>
    
    <div class="flex justify-between pt-4">
      <Button variant="outline" type="button" @click="emit('cancel')">
        Cancel
      </Button>
      <Button 
        type="submit" 
        :disabled="isLoading"
      >
        <Save class="h-4 w-4 mr-2" />
        {{ buttonText }}
      </Button>
    </div>
  </form>
</template>

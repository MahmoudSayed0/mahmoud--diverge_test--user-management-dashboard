<template>
  <Sheet v-model:open="isOpen">
    <SheetContent class="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Add New User</SheetTitle>
        <SheetDescription>
          Create a new user account in the system.
        </SheetDescription>
      </SheetHeader>
      
      <!-- Error state -->
      <Alert v-if="error" variant="destructive" class="mt-4">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
      
      <div class="py-4">
        <UserForm 
          mode="create"
          @submit="createUser"
          @cancel="closeSheet"
        />
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { api } from '@/lib/mockApi';
import type { User } from '@/lib/mockApi';

// UI Components
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-vue-next';

// Custom Components
import UserForm from '@/components/user/UserForm.vue';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'created'): void;
}>();

// Local state
const isOpen = ref(props.open);
const error = ref<string | null>(null);
const isSaving = ref(false);

// Watch for prop changes
watch(() => props.open, (newValue) => {
  isOpen.value = newValue;
});

// Watch for local state changes
watch(isOpen, (newValue) => {
  emit('update:open', newValue);
});

// Create new user
const createUser = async (userData: Partial<User>) => {
  isSaving.value = true;
  error.value = null;
  
  try {
    await api.createUser(userData as Omit<User, 'id' | 'createdAt'>);
    
    // Close sheet and notify parent
    isOpen.value = false;
    emit('created');
  } catch (err: any) {
    error.value = err.message || 'Failed to create user';
    console.error('Error creating user:', err);
  } finally {
    isSaving.value = false;
  }
};

// Close sheet
const closeSheet = () => {
  isOpen.value = false;
};
</script>

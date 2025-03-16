<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '@/lib/mockApi';
import type { User } from '@/lib/mockApi';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle2, ArrowLeft, Trash2 } from 'lucide-vue-next';

// Custom Components
import UserForm from '@/components/user/UserForm.vue';
import ExportMenu from '@/components/user/ExportMenu.vue';

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const userId = computed(() => Number(route.params.id));

// State management
const user = ref<User | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const showDeleteDialog = ref(false);

// Fetch user data
const fetchUser = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const userData = await api.getUser(userId.value);
    user.value = userData as User;
  } catch (err: any) {
    error.value = err.message || t('userManagement.failedToLoadUser');
    console.error('Error fetching user:', err);
  } finally {
    isLoading.value = false;
  }
};

// Save user changes
const saveUser = async (userData: Partial<User>) => {
  isSaving.value = true;
  error.value = null;
  successMessage.value = null;
  
  try {
    await api.updateUser(userId.value, userData);
    successMessage.value = t('userManagement.userUpdated');
    
    // Refresh user data
    await fetchUser();
  } catch (err: any) {
    error.value = err.message || t('userManagement.failedToUpdateUser');
    console.error('Error updating user:', err);
  } finally {
    isSaving.value = false;
  }
};

// Delete user
const deleteUser = async () => {
  try {
    await api.deleteUser(userId.value);
    router.push('/users');
  } catch (err: any) {
    error.value = err.message || t('userManagement.failedToDeleteUser');
    console.error('Error deleting user:', err);
    showDeleteDialog.value = false;
  }
};

// Get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default' as const;
    case 'inactive': return 'secondary' as const;
    case 'pending': return 'outline' as const;
    case 'suspended': return 'destructive' as const;
    default: return 'default' as const;
  }
};

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return t('common.notSpecified');
  return new Date(dateString).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get user initials for avatar fallback
const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Load data on component mount
onMounted(() => {
  fetchUser();
});

// Go back to user list
const goBack = () => {
  router.push('/users');
};
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="mb-6 flex items-center">
      <Button variant="ghost" size="sm" @click="goBack" class="mr-2">
        <ArrowLeft class="h-4 w-4 mr-2" />
        {{ t('common.back') }}
      </Button>
      <h1 class="text-2xl font-bold">{{ t('userManagement.userDetails') }}</h1>
      <div class="ml-auto">
        <ExportMenu v-if="user" :user="user" />
      </div>
    </div>

    <!-- Success message -->
    <Alert v-if="successMessage" variant="default" class="mb-6 bg-green-50 border-green-200">
      <CheckCircle2 class="h-4 w-4 text-green-600" />
      <AlertTitle class="text-green-800">{{ t('common.success') }}</AlertTitle>
      <AlertDescription class="text-green-700">{{ successMessage }}</AlertDescription>
    </Alert>

    <!-- Error state -->
    <Alert v-if="error" variant="destructive" class="mb-6">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>{{ t('common.error') }}</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton class="h-8 w-1/3" />
          <Skeleton class="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- User details -->
    <div v-else-if="user" class="space-y-6">
      <!-- User header -->
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar class="h-16 w-16">
              <AvatarFallback>{{ getUserInitials(user.name) }}</AvatarFallback>
            </Avatar>
            
            <div class="flex-1">
              <h2 class="text-xl font-semibold">{{ user.name }}</h2>
              <p class="text-muted-foreground">{{ user.email }}</p>
              <div class="flex items-center gap-2 mt-2">
                <Badge :variant="getStatusVariant(user.status)">
                  {{ t(`statuses.${user.status}`) }}
                </Badge>
                <Badge variant="outline">{{ t(`roles.${user.role}`) }}</Badge>
              </div>
            </div>
            
            <Dialog v-model:open="showDeleteDialog">
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 class="h-4 w-4 mr-2" />
                  {{ t('userManagement.deleteUser') }}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{{ t('userManagement.deleteUser') }}</DialogTitle>
                  <DialogDescription>
                    {{ t('userManagement.confirmDelete') }}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" @click="showDeleteDialog = false">{{ t('common.cancel') }}</Button>
                  <Button variant="destructive" @click="deleteUser">{{ t('common.delete') }}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <!-- User form -->
      <Card>
        <CardHeader>
          <CardTitle>{{ t('userManagement.editUser') }}</CardTitle>
          <CardDescription>{{ t('userManagement.updateUserInfo') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm 
            :user="user"
            mode="edit"
            @submit="saveUser"
            @cancel="goBack"
          />
        </CardContent>
      </Card>

      <!-- User metadata -->
      <Card>
        <CardHeader>
          <CardTitle>{{ t('userManagement.userInfo') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-muted-foreground">{{ t('userFields.id') }}</h3>
              <p>{{ user.id }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-muted-foreground">{{ t('userFields.createdAt') }}</h3>
              <p>{{ formatDate(user.createdAt) }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-muted-foreground">{{ t('userFields.department') }}</h3>
              <p>{{ user.department || t('common.notSpecified') }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-muted-foreground">{{ t('userFields.location') }}</h3>
              <p>{{ user.location || t('common.notSpecified') }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template> 
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore, UserRole } from '@/stores/auth';
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();

// Form state
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const loginError = ref('');

// Check if redirected due to session expiration
onMounted(() => {
  if (route.query.expired === 'true') {
    loginError.value = t('auth.sessionExpired');
  }
});

// Mock login function (replace with actual API call)
const mockLogin = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Demo users for testing different roles
  const demoUsers = [
    { email: 'admin@example.com', password: 'admin123', role: UserRole.ADMIN },
    { email: 'manager@example.com', password: 'manager123', role: UserRole.MANAGER },
    { email: 'editor@example.com', password: 'editor123', role: UserRole.EDITOR },
    { email: 'viewer@example.com', password: 'viewer123', role: UserRole.VIEWER },
  ];
  
  const user = demoUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    return {
      id: Math.floor(Math.random() * 1000),
      name: email.split('@')[0],
      email: email,
      role: user.role,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
    };
  }
  
  throw new Error(t('auth.loginError'));
};

// Simple validation
const validateForm = () => {
  const errors = [];
  
  if (!email.value) {
    errors.push(t('validation.required', { field: t('auth.email') }));
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.push(t('validation.email'));
  }
  
  if (!password.value) {
    errors.push(t('validation.required', { field: t('auth.password') }));
  } else if (password.value.length < 6) {
    errors.push(t('validation.minLength', { field: t('auth.password'), min: 6 }));
  }
  
  return errors;
};

// Handle form submission
const onSubmit = async () => {
  try {
    const errors = validateForm();
    if (errors.length > 0) {
      loginError.value = errors.join('. ');
      return;
    }
    
    isLoading.value = true;
    loginError.value = '';
    
    // Call mock login (replace with actual API)
    const user = await mockLogin(email.value, password.value);
    const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
    
    // Store user in auth store
    authStore.login(user, token);
    
    // Redirect to dashboard or the original requested URL
    const redirectPath = route.query.redirect as string || '/users';
    router.push(redirectPath);
  } catch (error: any) {
    loginError.value = error.message || t('auth.loginError');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">{{ t('auth.login') }}</CardTitle>
        <CardDescription>
          {{ t('auth.loginDescription') }}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form @submit.prevent="onSubmit" class="space-y-4">
          <!-- Error Alert -->
          <Alert v-if="loginError" variant="destructive" class="mb-4">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ loginError }}</AlertDescription>
          </Alert>
          
          <!-- Email Field -->
          <div class="space-y-2">
            <Label for="email">{{ t('auth.email') }}</Label>
            <Input 
              id="email" 
              v-model="email" 
              type="email" 
              placeholder="your.email@example.com"
            />
          </div>
          
          <!-- Password Field -->
          <div class="space-y-2">
            <Label for="password">{{ t('auth.password') }}</Label>
            <Input 
              id="password" 
              v-model="password" 
              type="password" 
              placeholder="••••••••"
            />
          </div>
          
          <!-- Demo Credentials -->
          <div class="text-sm text-muted-foreground mt-2">
            <p class="font-medium">{{ t('auth.demoCredentials') }}:</p>
            <p>Admin: admin@example.com / admin123</p>
            <p>Manager: manager@example.com / manager123</p>
            <p>Editor: editor@example.com / editor123</p>
            <p>Viewer: viewer@example.com / viewer123</p>
          </div>
        </form>
      </CardContent>
      
      <CardFooter>
        <Button 
          type="submit" 
          class="w-full" 
          :disabled="isLoading"
          @click="onSubmit"
        >
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoading ? t('auth.loggingIn') : t('auth.login') }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template> 
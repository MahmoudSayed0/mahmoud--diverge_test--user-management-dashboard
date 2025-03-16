<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, LogOut } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const goHome = () => {
  router.push('/');
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
    <div class="flex items-center justify-center mb-6">
      <ShieldAlert class="h-16 w-16 text-destructive" />
      <span class="text-6xl font-bold ml-4">403</span>
    </div>
    
    <h1 class="text-3xl font-bold mb-4">Access Denied</h1>
    
    <p class="text-muted-foreground text-lg max-w-md mb-8">
      You don't have permission to access this page. Please contact your administrator if you believe this is an error.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-4">
      <Button size="lg" variant="default" @click="goHome">
        <Home class="mr-2 h-5 w-5" />
        Back to Home
      </Button>
      
      <Button size="lg" variant="outline" @click="logout">
        <LogOut class="mr-2 h-5 w-5" />
        Logout
      </Button>
    </div>
  </div>
</template> 
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-vue-next';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
    <div class="flex items-center justify-center mb-6">
      <AlertCircle class="h-16 w-16 text-destructive" />
      <span class="text-8xl font-bold ml-4">404</span>
    </div>
    
    <h1 class="text-3xl font-bold mb-4">Page Not Found</h1>
    
    <p class="text-muted-foreground text-lg max-w-md mb-8">
      The page you are looking for doesn't exist or has been moved.
    </p>
    
    <Button size="lg" @click="goHome">
      <Home class="mr-2 h-5 w-5" />
      Back to Home
    </Button>
  </div>
</template> 
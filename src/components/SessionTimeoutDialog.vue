<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Timer, LogOut } from 'lucide-vue-next';

const props = defineProps({
  warningTime: {
    type: Number,
    default: 30 * 1000 // 30 seconds before session timeout (for 1-minute timeout)
  }
});

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const isOpen = ref(false);
const remainingTime = ref(0);
const intervalId = ref<number | null>(null);

// Check session status periodically
const checkSessionStatus = () => {
  if (!authStore.isAuthenticated) {
    resetDialog();
    return;
  }
  
  const currentTime = Date.now();
  const lastActivity = authStore.lastActivity;
  const sessionTimeout = 60 * 1000; // 1 minute (should match the timeout in auth store)
  const elapsedTime = currentTime - lastActivity;
  const timeUntilExpiration = sessionTimeout - elapsedTime;
  
  // If less than warningTime remaining, show dialog
  if (timeUntilExpiration <= props.warningTime && timeUntilExpiration > 0) {
    isOpen.value = true;
    remainingTime.value = Math.max(0, Math.floor(timeUntilExpiration / 1000));
    
    // Start countdown
    if (intervalId.value === null) {
      intervalId.value = window.setInterval(() => {
        remainingTime.value -= 1;
        
        if (remainingTime.value <= 0) {
          clearInterval(intervalId.value!);
          intervalId.value = null;
          handleLogout();
        }
      }, 1000);
    }
  } else if (timeUntilExpiration <= 0) {
    // Session already expired
    handleLogout();
  } else {
    // Reset if user has been active
    resetDialog();
  }
};

// Reset dialog state
const resetDialog = () => {
  isOpen.value = false;
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

// Format remaining time as MM:SS
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60);
  const seconds = remainingTime.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Handle continue session
const handleContinue = () => {
  authStore.updateActivity();
  resetDialog();
};

// Handle logout
const handleLogout = () => {
  resetDialog();
  authStore.logout();
  router.push('/login');
};

// Set up timer to check session status
onMounted(() => {
  // Check every 5 seconds
  const checkIntervalId = window.setInterval(checkSessionStatus, 5000);
  
  onBeforeUnmount(() => {
    clearInterval(checkIntervalId);
    resetDialog();
  });
});
</script>

<template>
  <Dialog :open="isOpen" @update:open="isOpen = $event">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center">
          <Timer class="h-5 w-5 mr-2 text-amber-500" />
          {{ t('auth.sessionTimeoutWarning') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('auth.sessionAboutToExpire') }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <p class="text-center text-2xl font-mono">{{ formattedTime }}</p>
        <p class="text-center text-muted-foreground mt-2">
          {{ t('auth.autoLogoutWarning') }}
        </p>
      </div>
      
      <DialogFooter class="flex flex-col sm:flex-row gap-2 sm:gap-0">
        <Button variant="outline" @click="handleLogout" class="sm:mr-2">
          <LogOut class="h-4 w-4 mr-2" />
          {{ t('auth.logoutNow') }}
        </Button>
        <Button @click="handleContinue">{{ t('auth.continueSession') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template> 
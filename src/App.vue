<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import SessionTimeoutDialog from '@/components/SessionTimeoutDialog.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Shield } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const { t } = useI18n();

// Initialize theme on mount
onMounted(() => {
  themeStore.init();
});

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.currentUser);
const userInitials = computed(() => {
  if (!currentUser.value?.name) return 'U';
  return currentUser.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
});

const userRoleLabel = computed(() => {
  if (!currentUser.value?.role) return '';
  return currentUser.value.role.charAt(0).toUpperCase() + currentUser.value.role.slice(1);
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};

// Show navigation only for authenticated users
const showNavigation = computed(() => {
  return isAuthenticated.value && 
         route.name !== 'Login' && 
         route.name !== 'NotFound' && 
         route.name !== 'Unauthorized';
});
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Skip to main content link for keyboard users -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:border focus:border-primary">
      Skip to main content
    </a>
    
    <!-- Navigation -->
    <header v-if="showNavigation" class="bg-card border-b">
      <div class="container mx-auto px-4">
        <nav class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-1">
            <router-link 
              to="/users" 
              class="px-3 py-2 rounded-md text-sm font-medium"
              :class="route.path.startsWith('/users') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
            >
              {{ t('userManagement.title') }}
            </router-link>
          </div>
          
          <!-- Right side: Theme toggle, Language Switcher and User Menu -->
          <div class="flex items-center space-x-2">
            <!-- Theme Toggle -->
            <ThemeToggle />
            
            <!-- Language Switcher -->
            <LanguageSwitcher />
            
            <!-- User Menu -->
            <div v-if="isAuthenticated && currentUser">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" class="relative h-8 w-8 rounded-full">
                    <Avatar>
                      <AvatarImage v-if="currentUser.avatar" :src="currentUser.avatar" alt="User avatar" />
                      <AvatarFallback>{{ userInitials }}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel class="font-normal">
                    <div class="flex flex-col space-y-1">
                      <p class="text-sm font-medium leading-none">{{ currentUser.name }}</p>
                      <p class="text-xs leading-none text-muted-foreground">{{ currentUser.email }}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="flex items-center">
                    <Shield class="mr-2 h-4 w-4" />
                    <span>{{ t('userFields.role') }}: {{ t(`roles.${currentUser.role}`) }}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="logout" class="text-red-600">
                    <LogOut class="mr-2 h-4 w-4" />
                    <span>{{ t('auth.logout') }}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </div>
    </header>
    
    <!-- Main Content -->
    <main>
      <router-view />
    </main>
    
    <!-- Session Timeout Dialog -->
    <SessionTimeoutDialog v-if="isAuthenticated" />
  </div>
</template>


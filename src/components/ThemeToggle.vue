<script setup lang="ts">
import { useThemeStore } from '@/stores/theme';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Laptop } from 'lucide-vue-next';

const themeStore = useThemeStore();

const setTheme = (theme: 'light' | 'dark' | 'system') => {
  themeStore.setTheme(theme);
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon">
        <Sun v-if="themeStore.theme === 'light'" class="h-5 w-5" />
        <Moon v-else-if="themeStore.theme === 'dark'" class="h-5 w-5" />
        <Laptop v-else class="h-5 w-5" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="setTheme('light')" :class="{ 'bg-accent': themeStore.theme === 'light' }">
        <Sun class="mr-2 h-4 w-4" />
        <span>Light</span>
      </DropdownMenuItem>
      <DropdownMenuItem @click="setTheme('dark')" :class="{ 'bg-accent': themeStore.theme === 'dark' }">
        <Moon class="mr-2 h-4 w-4" />
        <span>Dark</span>
      </DropdownMenuItem>
      <DropdownMenuItem @click="setTheme('system')" :class="{ 'bg-accent': themeStore.theme === 'system' }">
        <Laptop class="mr-2 h-4 w-4" />
        <span>System</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template> 
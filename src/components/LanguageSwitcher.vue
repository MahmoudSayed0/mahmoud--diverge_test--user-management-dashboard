<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLanguage } from '@/plugins/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const { t, locale } = useI18n();
const currentLanguage = ref(locale.value);

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

const switchLanguage = (lang: string) => {
  setLanguage(lang);
  currentLanguage.value = lang;
};

onMounted(() => {
  currentLanguage.value = locale.value;
});
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="h-8 w-8 px-0">
        <span class="sr-only">{{ t('common.switchLanguage') }}</span>
        <span class="text-lg">{{ languages.find(l => l.code === currentLanguage)?.flag }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem 
        v-for="lang in languages" 
        :key="lang.code"
        @click="switchLanguage(lang.code)"
        :class="{ 'bg-accent': currentLanguage === lang.code }"
      >
        <span class="mr-2">{{ lang.flag }}</span>
        {{ lang.name }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
 
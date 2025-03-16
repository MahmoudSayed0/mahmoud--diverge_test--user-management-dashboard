<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          class="flex items-center"
          aria-label="Export options"
        >
          <FileDown class="h-4 w-4 mr-2" aria-hidden="true" />
          {{ t('common.export') }}
          <ChevronDown class="h-4 w-4 ml-2" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-48">
        <DropdownMenuLabel>{{ t('common.export') }}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          @click="exportToCSV"
          @keydown="handleKeyDown($event, exportToCSV)"
          tabindex="0"
        >
          <FileText class="h-4 w-4 mr-2" aria-hidden="true" />
          {{ t('common.exportCSV') }}
        </DropdownMenuItem>
        <DropdownMenuItem 
          @click="exportToPDF"
          @keydown="handleKeyDown($event, exportToPDF)"
          tabindex="0"
        >
          <FileType class="h-4 w-4 mr-2" aria-hidden="true" />
          {{ t('common.exportPDF') }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { FileDown, FileText, FileType, ChevronDown } from 'lucide-vue-next';
import { exportToCSV as exportUsersToCSV, exportToPDF as exportUsersToPDF, exportUserToPDF } from '@/utils/exportUtils';
import type { User } from '@/lib/mockApi';

const { t } = useI18n();

const props = defineProps<{
  users?: User[];
  user?: User;
  fileName?: string;
}>();

// Export to CSV
const exportToCSV = () => {
  if (props.users && props.users.length > 0) {
    exportUsersToCSV(props.users, props.fileName);
  } else if (props.user) {
    exportUsersToCSV([props.user], `user-${props.user.id}`);
  }
};

// Export to PDF
const exportToPDF = () => {
  if (props.users && props.users.length > 0) {
    exportUsersToPDF(props.users, props.fileName);
  } else if (props.user) {
    exportUserToPDF(props.user);
  }
};

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent, action: () => void) => {
  // Enter or Space key to trigger action
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
};
</script> 
<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { User } from '@/lib/mockApi';

// UI Components
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUp, ArrowDown, Eye, Pencil, FileDown, FileText, FileType } from 'lucide-vue-next';
import { exportToCSV, exportToPDF, exportUserToPDF } from '@/utils/exportUtils';

const { t, locale } = useI18n();

const props = defineProps<{
  users: User[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'sort', column: string): void;
  (e: 'view', userId: number): void;
  (e: 'edit', userId: number): void;
}>();

// Format role display
const formatRole = (role: string) => {
  return t(`roles.${role}`);
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
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US');
};

// Export a single user to CSV
const exportUserToCSV = (user: User) => {
  exportToCSV([user], `user-${user.id}`);
};

// Handle keyboard navigation for table rows
const handleKeyDown = (event: KeyboardEvent, userId: number) => {
  // Enter or Space key to view user details
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit('view', userId);
  }
};

// Handle keyboard navigation for dropdown menu items
const handleMenuKeyDown = (event: KeyboardEvent, action: () => void) => {
  // Enter or Space key to trigger action
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
};

// Columns to display
const columns = [
  { key: 'name', label: t('userTable.name') },
  { key: 'email', label: t('userTable.email') },
  { key: 'role', label: t('userTable.role') },
  { key: 'status', label: t('userTable.status') },
  { key: 'createdAt', label: t('userTable.createdAt') }
];
</script>

<template>
  <div class="w-full overflow-auto">
    <Table aria-label="Users table">
      <TableHeader>
        <TableRow>
          <TableHead 
            v-for="column in columns" 
            :key="column.key"
            class="cursor-pointer"
            @click="emit('sort', column.key)"
            @keydown.enter="emit('sort', column.key)"
            @keydown.space.prevent="emit('sort', column.key)"
            tabindex="0"
            role="button"
            :aria-sort="sortBy === column.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
            :aria-label="`Sort by ${column.label} ${sortBy === column.key ? (sortDirection === 'asc' ? 'descending' : 'ascending') : ''}`"
          >
            <div class="flex items-center space-x-1">
              <span>{{ column.label }}</span>
              <span v-if="sortBy === column.key" aria-hidden="true">
                <ArrowUp v-if="sortDirection === 'asc'" class="h-4 w-4" />
                <ArrowDown v-else class="h-4 w-4" />
              </span>
            </div>
          </TableHead>
          <TableHead class="text-right">{{ t('common.actions') }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow 
          v-for="user in users" 
          :key="user.id" 
          class="cursor-pointer"
          @click="emit('view', user.id)"
          @keydown="handleKeyDown($event, user.id)"
          tabindex="0"
          role="row"
          :aria-label="`User: ${user.name}`"
        >
          <TableCell>{{ user.name }}</TableCell>
          <TableCell>{{ user.email }}</TableCell>
          <TableCell>{{ formatRole(user.role) }}</TableCell>
          <TableCell>
            <Badge :variant="getStatusVariant(user.status)">
              {{ t(`statuses.${user.status}`) }}
            </Badge>
          </TableCell>
          <TableCell>{{ formatDate(user.createdAt) }}</TableCell>
          <TableCell class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild @click.stop>
                <Button 
                  variant="ghost" 
                  size="icon"
                  aria-label="Open actions menu"
                >
                  <MoreHorizontal class="h-4 w-4" aria-hidden="true" />
                  <span class="sr-only">{{ t('common.openMenu') }}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" @click.stop>
                <DropdownMenuItem 
                  @click.stop="emit('view', user.id)"
                  @keydown="handleMenuKeyDown($event, () => emit('view', user.id))"
                  tabindex="0"
                >
                  <Eye class="h-4 w-4 mr-2" aria-hidden="true" />
                  {{ t('common.view') }}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  @click.stop="emit('edit', user.id)"
                  @keydown="handleMenuKeyDown($event, () => emit('edit', user.id))"
                  tabindex="0"
                >
                  <Pencil class="h-4 w-4 mr-2" aria-hidden="true" />
                  {{ t('common.edit') }}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{{ t('common.export') }}</DropdownMenuLabel>
                <DropdownMenuItem 
                  @click.stop="exportUserToCSV(user)"
                  @keydown="handleMenuKeyDown($event, () => exportUserToCSV(user))"
                  tabindex="0"
                >
                  <FileText class="h-4 w-4 mr-2" aria-hidden="true" />
                  {{ t('common.exportCSV') }}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  @click.stop="exportUserToPDF(user)"
                  @keydown="handleMenuKeyDown($event, () => exportUserToPDF(user))"
                  tabindex="0"
                >
                  <FileType class="h-4 w-4 mr-2" aria-hidden="true" />
                  {{ t('common.exportPDF') }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        <TableRow v-if="users.length === 0">
          <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
            {{ t('common.noResults') }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

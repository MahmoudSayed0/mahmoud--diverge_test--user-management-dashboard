<script setup lang="ts">
import { Button } from '@/components/ui/button';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  currentItems: number;
}>();

const emit = defineEmits<{
  (e: 'page-change', page: number): void;
}>();

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page);
  }
};
</script>

<template>
  <div class="p-4 border-t flex items-center justify-between">
    <div class="text-sm text-gray-500">
      Showing {{ currentItems }} of {{ totalItems }} users
    </div>
    
    <div class="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        Previous
      </Button>
      
      <span class="text-sm">
        Page {{ currentPage }} of {{ totalPages || 1 }}
      </span>
      
      <Button 
        variant="outline" 
        size="sm" 
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
      >
        Next
      </Button>
    </div>
  </div>
</template> 
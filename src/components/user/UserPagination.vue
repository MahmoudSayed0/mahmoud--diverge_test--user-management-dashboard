<template>
  <div class="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
    <div class="text-sm text-muted-foreground" aria-live="polite">
      Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} users
    </div>
    
    <div class="flex items-center space-x-6">
      <!-- Items per page selector -->
      <div class="flex items-center space-x-2">
        <label for="items-per-page" class="text-sm text-muted-foreground">Rows per page</label>
        <Select
          id="items-per-page"
          v-model="localItemsPerPage"
          :options="itemsPerPageOptions"
          class="w-20"
          aria-label="Select number of rows per page"
        />
      </div>
      
      <!-- Pagination controls -->
      <nav aria-label="Pagination" class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
          aria-label="Previous page"
          :aria-disabled="currentPage === 1"
        >
          <ChevronLeft class="h-4 w-4" aria-hidden="true" />
        </Button>
        
        <div v-for="page in visiblePages" :key="page" class="flex items-center">
          <Button
            v-if="page !== '...'"
            :variant="currentPage === page ? 'default' : 'outline'"
            size="icon"
            @click="changePage(Number(page))"
            class="h-8 w-8"
            :aria-label="`Page ${page}`"
            :aria-current="currentPage === page ? 'page' : undefined"
          >
            {{ page }}
          </Button>
          <span v-else class="px-2" aria-hidden="true">...</span>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          aria-label="Next page"
          :aria-disabled="currentPage === totalPages"
        >
          <ChevronRight class="h-4 w-4" aria-hidden="true" />
        </Button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['page-change', 'items-per-page-change']);

// Local state for items per page to handle the select component
const localItemsPerPage = ref(props.itemsPerPage);

// Options for items per page dropdown
const itemsPerPageOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
];

// Calculate total pages
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.totalItems / props.itemsPerPage));
});

// Calculate visible page numbers
const visiblePages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if there are few
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    // Calculate middle pages
    let startPage = Math.max(2, props.currentPage - 1);
    let endPage = Math.min(totalPages.value - 1, props.currentPage + 1);
    
    // Adjust if at the beginning or end
    if (props.currentPage <= 3) {
      endPage = 4;
    } else if (props.currentPage >= totalPages.value - 2) {
      startPage = totalPages.value - 3;
    }
    
    // Add ellipsis if needed
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages.value - 1) {
      pages.push('...');
    }
    
    // Always show last page
    pages.push(totalPages.value);
  }
  
  return pages;
});

// Calculate start and end item numbers
const startItem = computed(() => {
  return props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
});

// Change page handler
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('page-change', page);
  }
};

// Watch for changes in items per page
watch(localItemsPerPage, (newValue) => {
  emit('items-per-page-change', newValue);
});

// Watch for prop changes to update local state
watch(() => props.itemsPerPage, (newValue) => {
  localItemsPerPage.value = newValue;
});
</script>

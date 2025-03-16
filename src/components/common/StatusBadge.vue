<script setup lang="ts">
import { Badge } from '@/components/ui/badge';

const props = defineProps<{
  status: string;
}>();

// Get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default' as const;
    case 'inactive': return 'secondary' as const;
    case 'pending': return 'outline' as const;
    default: return 'default' as const;
  }
};
</script>

<template>
  <Badge :variant="getStatusVariant(status)">
    {{ status.charAt(0).toUpperCase() + status.slice(1) }}
  </Badge>
</template> 
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'AdminDashboardBreadcrumb',
});
</script>

<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Define a prop for dynamic breadcrumb items
interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

const props = defineProps<{
  items: BreadcrumbItem[];
}>();
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, index) in props.items" :key="index">
        <BreadcrumbItem>
          <template v-if="item.isCurrent">
            <BreadcrumbPage>{{ item.label }}</BreadcrumbPage>
          </template>
          <template v-else>
            <BreadcrumbLink :href="item.href">
              {{ item.label }}
            </BreadcrumbLink>
          </template>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < props.items.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

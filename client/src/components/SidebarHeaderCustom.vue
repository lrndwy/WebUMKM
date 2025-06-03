<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'AppSidebar',
});
</script>

<script setup lang="ts">
import { defineProps, withDefaults } from 'vue';
import { PanelLeft } from 'lucide-vue-next'

interface SidebarHeaderCustomProps {
  title?: string;
}

const props = withDefaults(defineProps<SidebarHeaderCustomProps>(), {
  title: 'Admin Panel',
});
</script>

<template>
    <div class="flex w-full gap-3 items-center justify-center px-4 py-2 lg:h-[55px] mb-2">
        <div class="flex-shrink-0">
            <PanelLeft class="size-8" />
        </div>
        <div class="text-lg font-bold text-foreground">
            {{ title }}
        </div>
    </div>
</template>

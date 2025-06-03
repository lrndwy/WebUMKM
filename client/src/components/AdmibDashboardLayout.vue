<script lang="ts">
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar.vue";
import AdminDashboardBreadcrumb from "@/components/AdminDashboardBreadcrumb.vue";
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";


export default defineComponent({
  name: "AdmibDashboardLayout",
  components: {
    AppSidebar,
    AdminDashboardBreadcrumb,
    SidebarProvider,
    SidebarTrigger,
  },
  setup() {
    const route = useRoute();

    const breadcrumbItems = computed(() => {
      const matchedRoutes = route.matched;
      const items = matchedRoutes.map((match) => {
        const label = (match.meta.breadcrumb || match.name)?.toString() || '';
        const href = match.path;
        return { label, href };
      });
      return items;
    });

    return {
      breadcrumbItems,
    };
  },
});


</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <main class="flex-1 overflow-hidden">
      <header class="flex h-14 items-center gap-4 px-4 lg:h-[60px] lg:px-6">
        <SidebarTrigger />
        <AdminDashboardBreadcrumb :items="breadcrumbItems" />
      </header>
      <div class="flex-1 overflow-auto p-4 lg:p-6">
        <slot />
      </div>
    </main>
  </SidebarProvider>
</template>

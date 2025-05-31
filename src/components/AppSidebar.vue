<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'AppSidebar',
});
</script>

<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar" // Corrected relative import path
import { BoxIcon, Calendar, ChartArea, Home, Inbox, LayoutDashboard, Search, Settings, SettingsIcon, UsersIcon, LogOut } from "lucide-vue-next"
import { RouterLink, useRouter } from 'vue-router'; // Assuming Vue Router is used for navigation
import { useAuthStore } from '@/stores/auth';

import SidebarHeaderCustom from '@/components/SidebarHeaderCustom.vue'
// Define interface for sidebar menu items for better type safety and readability
interface SidebarItem {
    title: string;
    url: string;
    icon: any; // Using 'any' for component type, can be more specific if needed
}

// Menu items.
const items: SidebarItem[] = [
{
    title: "Dashbaord",
    url: "/admin", // Changed to a more realistic route for Vue Router
    icon: LayoutDashboard,
},
{
    title: "Products",
    url: "/admin/products", // Changed to a more realistic route for Vue Router
    icon: BoxIcon,
},
{
    title: "Profile",
    url: "/admin/profile", // Changed to a more realistic route for Vue Router
    icon: UsersIcon,
},
{
    title: "Settings",
    url: "/admin/settings", // Changed to a more realistic route for Vue Router
    icon: SettingsIcon,
},
];

const bottomItems: SidebarItem[] = [
{
    title: "Logout",
    url: "#", // No direct URL, will use a click handler
    icon: LogOut,
},
];

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  authStore.logout();
  router.push('/login'); // Redirect to login page after logout
};





</script>

<template>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarHeaderCustom title="Admin Dashboard" />
        <SidebarGroupContent>
          <SidebarMenu>
              <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton asChild>
                    <!-- Using RouterLink for client-side navigation (best practice for SPAs) -->
                    <RouterLink :to="item.url">
                      <component :is="item.icon" />
                      <span>{{item.title}}</span>
                    </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in bottomItems" :key="item.title">
              <SidebarMenuButton v-if="item.title === 'Logout'" @click="handleLogout">
                <component :is="item.icon" />
                <span>{{item.title}}</span>
              </SidebarMenuButton>
              <SidebarMenuButton v-else asChild>
                <RouterLink :to="item.url">
                  <component :is="item.icon" />
                  <span>{{item.title}}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>

<script lang="ts">
import AdmibDashboardLayout from '../../components/AdmibDashboardLayout.vue';
import { defineComponent } from 'vue';


export default defineComponent({
  name: 'AdminDashboardPage',
  components: {
    AdmibDashboardLayout,
  },

});
</script>

<template>
    <AdmibDashboardLayout>
        <div className="flex flex-col md:flex-row flex-wrap gap-4 p-4">
            <div className="flex-1 min-w-[300px] h-70 rounded-lg bg-gray-50 flex items-center justify-center">1</div>
            <div className="flex-1 min-w-[200px] h-70 rounded-lg bg-gray-50 flex items-center justify-center">2</div>
            <div className="flex-auto w-full h-70 rounded-lg bg-gray-50 flex items-center justify-center">4</div>
            <div className="flex-1 min-w-[150px] h-70 rounded-lg bg-gray-50 flex items-center justify-center">5</div>
            <div className="flex-1 min-w-[300px] h-70 rounded-lg bg-gray-50 flex items-center justify-center">6</div>
            <div className="flex-1 min-w-[250px] h-70 rounded-lg bg-gray-50 flex items-center justify-center">7</div>
        </div>
    </AdmibDashboardLayout>
</template>

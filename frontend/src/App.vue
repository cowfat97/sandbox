<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="h-screen flex flex-col">
    <Header />
    <main class="flex-1" style="min-height: 0;">
      <router-view />
    </main>
    <Footer />
  </div>
</template>
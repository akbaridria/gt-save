<template>
  <div class="border border-netral-300 grid gap-2 rounded-lg p-4">
    <div @click="isOpen = !isOpen" class="flex items-center justify-between cursor-pointer">
      <div>{{ question }}</div>
      <div><ion-icon :key="isOpen" :name="isOpen ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon></div>
    </div>
    <template v-if="isOpen">
      <hr class="border-t border-netral-300">
      <div class="opacity-50 mt-4 text-sm">
       {{ answer }}
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    open: {
      type: Boolean,
      required: false,
      default: false
    },
    question: {
      type: String,
      required: false,
      default: ''
    },
    answer: {
      type: String,
      required: false,
      default: ''
    }
  },
  data(){
    const isOpen = this.open
    return {
      isOpen
    }
  }
}
</script>

<style>

</style>
<template>
  <div class="relative inline-block text-left">
  <div @click="open = !open">
    <button type="button" class="flex gap-2"  id="menu-button" aria-expanded="true" aria-haspopup="true">
      <div>Explore</div>
      <svg class="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>

  <div v-show="open" class="absolute right-0 z-10 mt-2 w-30 h-30 overflow-auto no-scrollbar border border-netral-300 origin-top-right rounded-md" style="background: rgba(28, 28, 28, 0.2); backdrop-filter: blur(8px);" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
    <div class="py-1" role="none">
      <a v-for="(item, index) in listMenus" :key="index" :href="item.link" class="group flex gap-3 px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-0">
      {{ item.name }}
      </a>
    </div>
  </div>
</div>

</template>

<script>

export default {
  data(){
    const open = false;
    const listMenus = [
      {
        id: 0,
        name: 'Home',
        link: '/'
      },
      {
        id: 1,
        name: 'Deposit',
        link: '/deposit'
      },
      {
        id: 2,
        name: 'Account',
        link: '/account'
      }
    ]

    return {
      open,
      listMenus
    }
  },
  mounted () {
    document.addEventListener('click', this.closeDropdown)
  },
  beforeDestroy () {
    document.removeEventListener('click',this.closeDropdown)
  },
   methods: {
     closeDropdown (e) {
      if (!this.$el.contains(e.target)) {
        this.open = false
      }
    },
    chooseItem(value){
      this.$emit('selectValue', value)
      this.selected = value
      this.open = false
    }
  }
}
</script>

<style>

</style>
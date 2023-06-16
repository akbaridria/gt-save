<template>
  <div class="relative inline-block text-left">
  <div @click="open = !open">
    <button type="button" class="border border-netral-300 rounded-lg p-[0.4375rem] flex gap-2 items-center hover:bg-netral-600" id="menu-button" aria-expanded="true" aria-haspopup="true">
      <template v-if="selectedChain.logo">
        <component :is="selectedChain.logo" />
        <div class="hidden xl:block">{{ selectedChain.name }}</div>
        <svg class="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </template>
      <div class="flex items-center gap-2" v-else>
        Wrong Network
         <svg class="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </div>
    </button>
  </div>

  <div v-if="open" class="absolute right-0 z-10 mt-2 w-56 h-56 overflow-auto no-scrollbar border border-netral-300 origin-top-right rounded-md" style="background: rgba(28, 28, 28, 0.2); backdrop-filter: blur(8px);" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
    <div class="py-1" role="none">
      <div @click="changeNetwork(item)" v-for="(item, index) in listChains" :key="index" class="group cursor-pointer flex gap-3 px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-0">
        <div><component :is="item.logo" :size="24" class="group-hover:grayscale-0" :class="selectedChain.name === item.name ? 'grayscale-0' : 'grayscale'" /></div>
        <div>{{ item.name }}</div>
      </div>
    </div>
  </div>
</div>

</template>

<script>
const listChains = require('../../data/chains.json')

export default {
  data(){
    const open = false;
    const selectedChain = listChains[0]
    return {
      open,
      listChains,
      selectedChain
    }
  },
  watch: {
    '$store.state.chainId': function(newV) {
       const chain = listChains.filter(item => item.chainId === newV);
       this.selectedChain = chain.length > 0 ? chain[0] : {logo: null, name: 'Wrong Network' }
    }
  },
  mounted () {
    const chain = listChains.filter(item => item.chainId === this.$store.state.chainId);
    this.selectedChain = chain.length > 0 ? chain[0] : {logo: null, name: 'Wrong Network' }
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
    changeNetwork(value){
      this.$emit('changeNetwork', value)
      this.open = false
    }
  }
}
</script>

<style>

</style>
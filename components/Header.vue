<template>
<div class="fixed top-0 z-[100] w-full" style="background: rgba(28, 28, 28, 0.2); backdrop-filter: blur(8px);">
  <div class="container mx-auto">
    <!-- <div class="flex items-center justify-center text-sm p-[0.4rem] text-white bg-red-600">
      We are on testnet only now!
    </div> -->
     <div class="flex items-center justify-between px-4 py-5">
      <div class="flex items-center gap-3 md:gap-5 lg:gap-10 xl:gap-10">
          <img src="/images/logo.svg" alt="">
          <div class="hidden xl:flex items-center gap-10">
            <NuxtLink class="opacity-50" to="/">Home</NuxtLink>
            <NuxtLink class="opacity-50" to="/deposit">Deposit</NuxtLink>  
            <NuxtLink class="opacity-50" to="/account">Account</NuxtLink>
          </div>
          <div class="xl:hidden block">
            <DropdownMenu />
          </div>
      </div>

        <div class="flex gap-3">
          <div class="flex items-center px-[0.4rem]">
            <div class="bg-red-600 rounded-lg text-white p-[0.25rem] text-sm">testnet</div>
          </div>
          <DropdownChains v-show="isConnected" @changeNetwork="$emit('changeNetwork', $event)" />
          <div v-if="!isConnected" class="border-[1px] border-netral-300 p-[0.4375rem] rounded-lg flex gap-2 items-center cursor-pointer hover:bg-netral-600">
            <div><LogosMetamask /></div>
            <div  @click="$emit('connect')" class="flex gap-2">Connect <span class="hidden xl:block md:block lg:block">Wallet</span></div>
          </div>
          <div class="flex items-center gap-2 border border-netral-300 p-[0.4375rem] rounded-lg hover:bg-netral-600 cursor-pointer" v-else>
            <div class="w-5 h-5 rounded-full bg-netral-100"></div>
            <div>{{ $store.state.userAddress.slice(0,5) + '...' + $store.state.userAddress.slice(-3) }}</div>
          </div>
        </div>
      </div>
  </div>

</div>
  
</template>
  
<script>
const listChains = require('../data/chains.json');

export default {
  data(){
    const isConnected = this.$store.state.isConnected
    return {
      listChains,
      isConnected
    }
  },
  watch: {
    '$store.state.isConnected': function() {
      this.isConnected = this.$store.state.isConnected
    },
  }
}
</script>

<style>

</style>
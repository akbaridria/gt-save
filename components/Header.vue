<template>
<div class="fixed top-0 z-[100] w-full" style="background: rgba(28, 28, 28, 0.2); backdrop-filter: blur(8px);">
  <div class="container mx-auto">
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
          <DropdownChains />
          <div class="border-[1px] border-netral-300 p-[0.4375rem] rounded-lg flex gap-2 items-center">
            <div><LogosMetamask /></div>
            <div class="flex gap-2">Connect <span class="hidden xl:block md:block lg:block">Wallet</span></div>
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
    return {
      listChains
    }
  }
}
</script>

<style>

</style>
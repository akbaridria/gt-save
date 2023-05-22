<template>
<div class="fixed top-0 z-[100] w-full" style="background: rgba(28, 28, 28, 0.2); backdrop-filter: blur(8px);">
  <div class="container mx-auto">
     <div class="flex items-center justify-between py-5">
        <div class="flex items-center gap-10">
          <img src="/images/logo.svg" alt="">
          <div>Home</div>
          <div>Deposit</div>
          <div>Account</div>
        </div>
        <div class="flex gap-3">
          <div class="border-[1px] border-netral-300 p-[0.4375rem] rounded-lg flex gap-2 items-center">
            <div><LogosEthereum /></div>
            <div>Ethereum</div>
            <ion-icon name="chevron-down-outline"></ion-icon>
          </div>
          <div class="border-[1px] border-netral-300 p-[0.4375rem] rounded-lg flex gap-2 items-center">
            <div><LogosMetamask /></div>
            <div>Connect Wallet</div>
            <ion-icon name="chevron-down-outline"></ion-icon>
          </div>
        </div>
      </div>
  </div>
 
</div>
  
</template>

<script>
export default {

}
</script>

<style>

</style>
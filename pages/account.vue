<template>
  <div class="pt-[7rem] pb-[35vh]">
    <div v-show="false" class="flex flex-col gap-4 items-center">
      <IconsWallet />
      <div class="text-2xl">Prize savings for humans</div>
      <div class="opacity-50">Open to all, free forever. No banks, no stress, just prizes.</div>
      <div class="p-[1rem] border border-white rounded">Connect your wallet</div>
    </div>

    <div class="grid lg:grid-cols-2 xl:grid-cols-2 gap-4">
      <div class="flex flex-col gap-4">
        <div class="border border-netral-300 p-[1.5rem] flex justify-between rounded">
            <div>
              <div class="opacity-50">Your Account</div>
              <div class="text-lg line-clamp-1">0x694a...294</div>
            </div>
            <div class="flex items-center text-xl">
              <div>$ 12.000,00</div>
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </div>
        </div>
        <div class="border border-netral-300 p-[1.5rem] rounded flex flex-col gap-4">
          <div class="flex justify-between lg:text-lg xl:text-lg">
            <div>History Transactions</div>
            <div>All Categories</div>
          </div>
          <hr class="border-t border-netral-300">
          <div class="flex flex-col gap-3">
            <div class="flex justify-between">
                <div>#338384384</div>
                <div class="hidden xl:block lg:block md:block">May 19 2023</div>
                <div>Deposit</div>
                <div>$146</div>
                <IconsExternalLink />
            </div>
          </div>
        </div>
      </div>

      <div class="border border-netral-300 flex flex-col gap-4 rounded p-[1.5rem] h-fit">
        <div class="flex items-center gap-4 text-xl">
          <ion-icon name="trophy-outline"></ion-icon>
          <div>Claimed Prize</div>
        </div>
        <div class="flex justify-between">
          <div class="opacity-50">Your Prize</div>
          <div class="text-2xl">$556</div>
        </div>
        <hr class="border-t border-netral-300">
        <div class="flex flex-col gap-4">
          <div class="flex justify-between">
            <div>Draw #100001</div>
            <div class="hidden xl:block lg:block md:block">19 May 2023</div>
            <div>$149</div>
            <div>Claim</div>
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
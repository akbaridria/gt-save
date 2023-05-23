<template>
  <div class="py-[6rem] relative z-50">
    <div class="flex gap-5 mb-[2.5rem] items-center">
      <div class="text-[5rem]">DEPOSIT</div>
      <div>
        <div>This week's raffle countdown</div>
        <div class="flex gap-2">
          <div class="border-netral-300 border-[1px] rounded-xl h-[3rem] w-[3rem] flex flex-col items-center justify-center">
            <div class="text-[1rem]">06</div>
            <div class="text-[0.5rem]">Days</div>
          </div>
          <div class="border-netral-300 border-[1px] rounded-xl h-[3rem] w-[3rem] flex flex-col items-center justify-center">
            <div class="text-[1rem]">06</div>
            <div class="text-[0.5rem]">Days</div>
          </div>
          <div class="border-netral-300 border-[1px] rounded-xl h-[3rem] w-[3rem] flex flex-col items-center justify-center">
            <div class="text-[1rem]">06</div>
            <div class="text-[0.5rem]">Days</div>
          </div>
          <div class="border-netral-300 border-[1px] rounded-xl h-[3rem] w-[3rem] flex flex-col items-center justify-center">
            <div class="text-[1rem]">06</div>
            <div class="text-[0.5rem]">Days</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="border border-netral-300 rounded p-[3rem] grid gap-4 justify-center text-center">
        <div class="flex justify-center gap-7">
          <div class="flex gap-4">
            <LogosUsdc />
            <div>USDC</div>
          </div>
          <div class="flex gap-4">
            <LogosEthereum />
            <div>Ethereum</div>
          </div>
        </div>
        <div class="grid items-center">
          <input class="bg-transparent outline-0 text-center text-[4rem] max-w-full" placeholder="0.0" type="number" inputmode="decimal" min="0" v-model="amountDeposit">
        </div>
        <div>
          Balance: 0.1 Max
        </div>
        <div class="flex justify-center">
          <div class="bg-primary-100 rounded-xl px-[1.25rem] py-[0.875rem] text-netral-500">
            Approve use of USDC
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div class="border border-netral-300 rounded p-[1.5rem] text-lg flex justify-between items-center">
          <div class="flex gap-3"> <IconsDollar /> Total Deposit</div>
          <div>$12,324,354</div>
        </div>
        <div class="border border-netral-300 rounded p-[1.5rem] flex flex-col">
          <div class="text-lg">Draw History</div>
          <hr class="border-t-[1px] border-netral-300 my-3" />
          <div>
            <div class="flex justify-between">
              <div>Draw #100001</div>
              <div>May 19 2023</div>
              <div>0x694aCF4D...726C7294</div>
              <div>$149</div>
              <IconsExternalLink :size="24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    const amountDeposit = null;
    return {
      amountDeposit
    }
  }
}
</script>

<style>

</style>
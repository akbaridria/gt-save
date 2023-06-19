<template>
  <div class="relative z-[10000]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="fixed inset-0 bg-netral-600 bg-opacity-75 transition-opacity"></div>

  <div class="fixed inset-0 z-[10000] overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center items-center p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full my-8 w-full max-w-md">
        <div class="bg-netral-500 px-4 pb-4 pt-5 p-6 pb-4 grid gap-4">
         <template v-if="!isFinish">
           <div class="flex justify-between text-lg items-center">
              <div>Confirm Deposit</div>
              <ion-icon @click="$emit('closeModal')" class="cursor-pointer" name="close-outline"></ion-icon>
            </div>
            <div class="border-[1px] boder-netral-300 rounded-lg flex justify-between items-center p-[1rem] my-5 text-xl">
              <div>
                {{ amount }}
              </div>
              <div class="flex items-center gap-3">
                <LogosUsdc />
              {{ selectedChain[0].name === 'Moonbeam' ? 'USDC' : 'aUSDC'}}
              </div>
            </div>
            <div class="flex justify-between text-sm">
              <div>Network Fee (est)</div>
              <div class="flex gap-2 items-center">
                <div>
                  <IconsLoadingCircle class="animate-spin" :size="16" v-if="loadingFee" />
                  <div v-else>{{ networkFee }} </div>
                </div>
                {{ selectedChain[0].detail.nativeCurrency.symbol }}
              </div>
            </div>
            <div v-if="selectedChain[0].name !== 'Moonbeam'" class="flex justify-between text-sm">
              <div class="flex gap-2 items-center">Estimated Gas Fee 
                <div class='has-tooltip'>
                  <span class='tooltip rounded shadow-lg p-1 bg-netral-600 text-xs ml-5 -mt-8'>
                    Estimated Fee for cross-chain message. <br> it is refundable when the actual gas that used is lower.
                  </span>
                  <ion-icon name="alert-circle-outline"></ion-icon>
                </div>
              </div>
              <div class="flex gap-2 items-center">
                <div>
                  <IconsLoadingCircle class="animate-spin" :size="16" v-if="loadingFee" />
                  <div v-else>{{ axelarFee }} </div>
                </div>
                {{ selectedChain[0].detail.nativeCurrency.symbol }}
              </div>
            </div>
            <hr class="border-t border-netral-300">
            <div class="flex justify-between">
              <div>Order routing</div>
              <div class="flex items-center">
                <template v-if="selectedChain[0].name === 'Moonbeam'">
                  <div class="bg-netral-100 w-[18px] h-[18px] rounded-full"></div>
                  <div>----</div>
                  <LogosMoonbeam :size="18" pattern="pattern-deposit-2" />
                </template>
                <template v-else>
                  <div class="bg-netral-100 w-[18px] h-[18px] rounded-full"></div>
                  <div>----</div>
                  <component :is="selectedChain[0].logo" :size="18" pattern="pattern-deposit-1" />
                  <div>----</div>
                  <LogosMoonbeam :size="18" pattern="pattern-deposit-2" />
                </template>
              </div>
            </div>
            <div @click="buttonClick()" :class="{'cursor-not-allowed pointer-events-none text-white bg-slate-600' : loading }" class="cursor-pointer hover:opacity-90 bg-primary-100 rounded-lg text-[#030303] p-[0.75rem] text-center">
              <div class="flex gap-3 justify-center items-center">
              <IconsLoadingCircle v-if="loading" class="animate-spin" />
              <template v-if="selectedChain[0].name !== 'Moonbeam'">
                <div v-if="!isApprove">Approve use of  {{ selectedChain[0].name === 'Moonbeam' ? 'USDC' : 'aUSDC'}}</div>
                <div v-else>Deposit</div>
              </template>
              <div v-else>
                Approve & Deposit
              </div>
              </div>
            </div>
         </template>
         <template v-else>
          <div class="flex flex-col gap-6 items-center">
            <div class="flex justify-end w-full"><ion-icon @click="$emit('closeModal')" class="cursor-pointer" name="close-outline"></ion-icon></div>
            <LogosFlower class="animate-spin-slow" />
             <div class="text-center">
                <div class="text-lg my-5">Transaction Submitted</div>
                <div class="opacity-50 text-sm">Your deposit success to submitted,</div>
                <div class="opacity-50 text-sm">If the transaction is success and you are doing cross-chain message, you can also track it on <a href="https://testnet.axelarscan.io/gmp/search" target="_blank" class="underline">axelarscan</a></div>
                <div @click="viewBlockExplorer()" class="my-5 flex gap-3 text-netral-500 hover:opacity-90 justify-center bg-primary-100 rounded-lg p-[0.75rem] cursor-pointer">
                  View your deposit 
                  <IconsExternalLink :color="'black'" />
                </div>
              </div>
          </div>
         </template>         
        </div>
      </div>
    </div>
  </div>
</div>

</template>

<script>
const listChains = require('../../data/chains.json');
import {
  estimateBatchDeposit,
  estimateDepositGasOther,
  estimateGasApprove,
  checkAllowance,
  axelarDepositFee,
  approveTx,
  depositOnPolygon,
  depositOthers,
  batchDeposit
} from '../../scripts/helper';
const ethers = require('ethers');

export default {
  props: {
    amount: {
      Type: Number,
      required: false,
      default: 0
    }
  },
  data(){
    const selectedChain = listChains.filter(item => item.chainId === this.$store.state.chainId)
    const networkFee = 0
    const axelarFee = 0
    const isApprove = true
    const loading = false
    const loadingDeposit = false
    const isFinish = false
    const depositHash = ''
    const loadingFee = false
    return {
      selectedChain,
      networkFee,
      axelarFee,
      isApprove,
      loading,
      loadingDeposit,
      isFinish,
      depositHash,
      loadingFee
    }
  },
  async mounted() {
   this.selectedChain[0].name === 'Moonbeam' ? await this.moonBeamDeposit() : await this.initDeposit();
  },
  methods: {
    viewBlockExplorer(){
      const url = this.selectedChain[0].block_explorer + 'tx/'
      window.open(url + this.depositHash, '_blank')
    },
    async buttonClick() {
      if(this.selectedChain[0].name !== 'Moonbeam') {
        if(this.isApprove) {
          await this.requestDeposit()
        } else {
          await this.requestApprove()
        }
      } else {
        this.batchRequest()
      }
    },
    async initDeposit() {
      this.loading = true
      const d = await checkAllowance(this.selectedChain)
      this.isApprove = d >= this.amount * 1e6
      if(this.isApprove) {
          this.loadingFee = true
          this.axelarFee = await axelarDepositFee(this.selectedChain)
          this.networkFee =  await estimateDepositGasOther(this.selectedChain, this.amount * 1e6,  ethers.utils.parseEther(this.axelarFee))
          this.loadingFee = false
      } else {
        this.networkFee = await estimateGasApprove(this.selectedChain, this.amount * 1e6);
      }
      this.loading = false
    },
    async moonBeamDeposit() {
      this.loading = true
      this.networkFee = await estimateBatchDeposit(ethers.utils.parseEther(this.amount))
      this.loading = false
    },
    async requestApprove(){
      try {
        this.loading = true
        await approveTx(this.selectedChain, this.amount * 1e6)
        await this.initDeposit();
        this.loading = false
      } catch (error) {
        console.log(error)
        this.loading = false
      }
    },
    async requestDeposit(){
      this.loading = true
      let tx;
      try {
        tx = await depositOthers(this.selectedChain, this.amount * 1e6, ethers.utils.parseEther(this.axelarFee))
        this.depositHash = tx.hash
        this.loading = false
        this.isFinish = true
      } catch (error) {
        console.log(error)
        this.loading = false
      }
    },
    async batchRequest() {
      let tx;
      try {
        this.loading = true
        tx = await batchDeposit(ethers.utils.parseEther(this.amount))
        this.depositHash = tx.hash
        this.loading = false
        this.isFinish = true
      } catch (error) {
        this.loading = false
      }
    }
  }
}
</script>

<style>

</style>
<template>
  <div class="relative z-[10000]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="fixed inset-0 bg-netral-600 bg-opacity-75 transition-opacity"></div>

  <div class="fixed inset-0 z-[10000] overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center items-center p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full my-8 w-full max-w-md">
        <div class="bg-netral-500 px-4 pb-4 pt-5 p-6 pb-4 grid gap-4 text-center">
          <template v-if="!isFinish">
          <div class="flex justify-end">
            <ion-icon @click="$emit('closeModal')" class="text-lg cursor-pointer" name="close-outline"></ion-icon>
          </div>
          <template v-if="!isWithdraw">
          <div>
            Your Balance
          </div>
          <div class="text-[3.5rem]">
            ${{ balance }}
          </div> 
          <hr class="border-t border-netral-300 " />
          <div class="grid gap-5 my-5">
            <div class="flex justify-between align-center">
              <div>TVL</div>
              <div>${{ totalDeposit }}</div>
            </div>
            <div class="flex justify-between align-center">
              <div>Yield Souce</div>
              <div class="flex gap-2"><LogosAAVE />AAVE V3 Polygon</div>
            </div>
          </div>
          <hr class="border-t border-netral-300" />
          <div class="grid grid-cols-2 gap-4 mt-8 mb-5">
            <div @click="isWithdraw = true" class="border border-primary-100 rounded-lg p-[0.6rem] text-primary-100 hover:bg-primary-100 hover:text-netral-500 transition-all cursor-pointer">Withdraw</div>
            <a href="/deposit" class="bg-primary-100 text-netral-500 rounded-lg p-[0.6rem] transition-all cursor-pointer hover:opacity-90">Deposit Again</a>
          </div>
          </template>
          <div class="grid gap-4" v-else>
            <div class="flex gap-2 items-center justify-center">Withdraw <LogosUsdc /></div>
            <input :disabled="loading.withdraw" class="bg-transparent outline-0 text-center text-[2rem] lg:text-[3rem] xl:text-[4rem] w-full" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" type="number" inputmode="decimal" min="0" v-model="amountWithdraw">
            <div>Balance: ${{ balance }} <span @click="amountWithdraw = balance" class="cursor-pointer underline">Max</span></div>
            <hr class="border-t border-netral-300">
            <div v-if="selectedChain[0].name !== 'Polygon'" class="flex justify-between items-center text-sm">
              <div class="flex gap-2 items-center">Estimated Gas Fee 
                <div class='has-tooltip'>
                  <span class='tooltip rounded shadow-lg p-1 bg-netral-600 text-xs ml-5 -mt-8'>
                    Estimated Fee for cross-chain message. <br> it is refundable when the actual gas that used is lower.
                  </span>
                  <ion-icon name="alert-circle-outline"></ion-icon>
                </div>
              </div>
              <div class="flex gap-2 items-center"><span v-if="loading.fee"><IconsLoadingCircle :size="16" class="animate-spin" /></span><span v-else>{{ fee.axelarFee }}</span> {{ selectedChain[0].detail.nativeCurrency.symbol }}</div>
            </div>
            <div class="flex justify-between">
              <div class="text-sm">Order routing</div>
              <div class="flex items-center">
                <template v-if="selectedChain[0].name === 'Polygon'">
                  <div class="bg-netral-100 w-[18px] h-[18px] rounded-full"></div>
                  <div>----</div>
                  <LogosPolygon :size="18" pattern="pattern-deposit-2" />
                </template>
                <template  v-else>
                  <div class="bg-netral-100 w-[18px] h-[18px] rounded-full"></div>
                  <div>----</div>
                  <component :is="selectedChain[0].logo" :size="18" pattern="pattern-deposit-1" />
                  <div>----</div>
                  <LogosPolygon :size="18" pattern="pattern-deposit-2" />
                  <div>----</div>
                  <component :is="selectedChain[0].logo" :size="18" pattern="pattern-deposit-1" />
                </template>
              </div>
            </div>
            <hr class="border-t border-netral-300">
            <button @click="error.isError ? null: requestWithdraw()" :class="loading.fee || error.isError || loading.withdraw ? 'pointer-events-none text-[#5F5F5F] bg-[#3D3D3D]' : 'bg-primary-100 text-netral-500'" class="hover:opacity-90 flex gap-2 justify-center items-center  p-[0.6rem] rounded-lg">
              <IconsLoadingCircle v-if="loading.fee || loading.withdraw" :size="20" class="animate-spin" />
              {{ error.isError ? error.message : 'Withdraw' }}
            </button>
          </div>
          </template>
          <template v-else>
          <div class="flex flex-col gap-6 items-center">
            <div class="flex justify-end w-full"><ion-icon @click="$emit('closeModal')" class="cursor-pointer" name="close-outline"></ion-icon></div>
            <LogosFlower class="animate-spin-slow" />
             <div class="text-center">
                <div class="text-lg my-5">Transaction Submitted</div>
                <div class="opacity-50 text-sm">Your withdraw success to submitted,</div>
                <div class="opacity-50 text-sm">check your history for status your deposit</div>
                <div @click="viewBlockExplorer()" class="my-5 flex gap-3 text-netral-500 hover:opacity-90 justify-center bg-primary-100 rounded-lg p-[0.75rem] cursor-pointer">
                  View your withdraw 
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
import { 
  getTotalDeposit,
  getFeeAxelarTwoWay,
  withdrawOnPolygon,
  withdrawOthers
} from '../../scripts/helper'
const listChains = require('../../data/chains.json');
const ethers = require('ethers');

export default {
  name: 'ModalAccount',
  props: {
    balance: {
      Type: Number,
      required: false,
      default: 0
    }
  },
  data(){
    const totalDeposit = 0
    const isWithdraw = false
    const fee = {
      networkFee: 0,
      axelarFee: 0
    }
    const amountWithdraw = 0.0
    const selectedChain = listChains.filter(item => item.chainId === this.$store.state.chainId)
    const loading = {
      fee: false,
      withdraw: false
    }
    const error = {
      isError: true,
      message: 'Withdraw'
    }
    const isFinish = false
    const txHash = ''
    const mumbaiExplorer = 'https://mumbai.polygonscan.com/tx/'
    const axelarExplorer = 'https://testnet.axelarscan.io/gmp/'
    return {
      totalDeposit,
      isWithdraw,
      fee,
      amountWithdraw,
      selectedChain,
      loading,
      error,
      isFinish,
      txHash,
      mumbaiExplorer,
      axelarExplorer
    }
  },
  watch : {
    isWithdraw: async function(newV) {
      if(newV) {
        await this.estimateGas()
      }
    },
    amountWithdraw: function(newV) {
      if(newV) {
        if(newV === 0) {
          this.error.isError = true
          this.error.message = 'Withdraw'
        } else if(ethers.utils.parseUnits(`${this.balance}`, '6').gte(ethers.utils.parseUnits(`${newV}`, '6'))) {
          this.error.isError = false,
          this.error.message = ''
        } else {
          this.error.isError = true
          this.error.message = 'Insufficient deposit amount'
        }
      } else {
        this.error.isError = true
        this.error.message = 'Withdraw'
      }
      
    }
  },
  async mounted(){
    this.totalDeposit = await getTotalDeposit(this.$config.privKey)
  },
  methods: {
    viewBlockExplorer(){
      const url = this.selectedChain[0].name === 'Polygon' ? this.mumbaiExplorer : this.axelarExplorer
      window.open(url + this.txHash, '_blank')
    },
    async estimateGas(){
      this.loading.fee = true
      if(this.$store.state.chainId !== 80001) {
        this.fee.axelarFee = await getFeeAxelarTwoWay(this.selectedChain)
      }
      this.loading.fee = false
    },
    async requestWithdraw() {
      this.loading.withdraw = true
      let tx;
      try {
        if(this.selectedChain[0].name === 'Polygon'){
          tx = await withdrawOnPolygon(ethers.utils.parseUnits(this.amountWithdraw, '6'))
        } else {
          tx = await withdrawOthers(this.selectedChain,ethers.utils.parseUnits(this.amountWithdraw, '6'), ethers.utils.parseEther(this.fee.axelarFee))
        }
        const receipt = await tx.wait();
        this.txHash = receipt.transactionHash
        this.loading.withdraw = false
        this.isFinish = true
      } catch (error) {
        console.log('rejected by user');
        this.loading.withdraw = false
      }
    }
  }
}
</script>

<style>

</style>
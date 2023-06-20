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
            <div>Claim Round Id #{{ roundId }}</div>
            <div class="text-[3.5rem]"> ${{ parseFloat(prize).toFixed(6) }}</div>
            <hr class="border-t border-netral-300">
            <div v-if="selectedChain[0].name !== 'Moonbeam'" class="flex justify-between">
              <div class="flex gap-2 items-center">Estimated Gas Fee 
                <div class='has-tooltip'>
                  <span class='tooltip rounded shadow-lg p-1 bg-netral-600 text-xs ml-5 -mt-8'>
                    Estimated Fee for cross-chain message. <br> it is refundable when the actual gas that used is lower.
                  </span>
                  <ion-icon name="alert-circle-outline"></ion-icon>
                </div>
              </div>
              <div class="flex gap-2 items-center">
                <div v-if="loading"><IconsLoadingCircle class="animate-spin" :size="18" /></div>
                <div v-if="!loading">{{ axelarFee }}</div>
                {{ selectedChain[0].detail.nativeCurrency.symbol }}
              </div>
            </div>
            <div class="flex justify-between">
              <div class="text-sm">Order routing</div>
              <div class="flex items-center">
                <template v-if="selectedChain[0].name === 'Moonbeam'">
                  <div class="bg-netral-100 w-[18px] h-[18px] rounded-full"></div>
                  <div>----</div>
                  <LogosMoonbeam :size="18" pattern="pattern-deposit-2" />
                </template>
                <template  v-else>
                  <div class="bg-netral-100 w-[18px] h-[18px] rounded-full"></div>
                  <div>----</div>
                  <component :is="selectedChain[0].logo" :size="18" pattern="pattern-deposit-1" />
                  <div>----</div>
                  <LogosMoonbeam :size="18" pattern="pattern-deposit-2" />
                  <div>----</div>
                  <component :is="selectedChain[0].logo" :size="18" pattern="pattern-deposit-1" />
                </template>
              </div>
            </div>
            <hr class="border-t border-netral-300">
            <button @click="requestClaim()" :class="loading || loadingClaim ? 'pointer-events-none text-[#5F5F5F] bg-[#3D3D3D]' : 'bg-primary-100 text-netral-500'" class="p-[0.475rem] rounded-lg hover:opacity-90 transition-all">
              <div class="flex justify-center gap-2 items-center">
                <IconsLoadingCircle v-if="loading || loadingClaim" class="animate-spin" :size="18" />
                Claim
              </div>
            </button>
           </template>
          <template v-else>
            <div class="flex flex-col gap-6 items-center">
              <div class="flex justify-end w-full"><ion-icon @click="$emit('closeModal')" class="cursor-pointer" name="close-outline"></ion-icon></div>
              <LogosFlower class="animate-spin-slow" />
              <div class="text-center">
                  <div class="text-lg my-5">Transaction Submitted</div>
                  <div class="opacity-50 text-sm">Your Claim success to submitted,</div>
                  <div class="opacity-50 text-sm">check your history for status your deposit</div>
                  <div @click="viewBlockExplorer()" class="my-5 flex gap-3 text-netral-500 hover:opacity-90 justify-center bg-primary-100 rounded-lg p-[0.75rem] cursor-pointer">
                    View your claim 
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
import { sleep } from '@axelar-network/axelarjs-sdk';
import { 
  claimOnPolygon,
  claimOthersOthers,
  getFeeAxelarTwoWay,
} from '../../scripts/helper'
const listChains = require('../../data/chains.json');
const ethers = require('ethers');

export default {
  name: 'ModalClaim',
  props: {
    prize: {
      Type: String,
      required: false,
      default: '0'
    },
    roundId: {
      Type: String,
      required: false,
      default: '0'
    }
  },
  data(){
    const isFinish = false
    const txHash = ''
    const mumbaiExplorer = 'https://mumbai.polygonscan.com/tx/'
    const axelarExplorer = 'https://testnet.axelarscan.io/gmp/'
    const selectedChain = listChains.filter(item => item.chainId === this.$store.state.chainId)
    const axelarFee = 0
    const loading = false
    const loadingClaim = false
    return {
      isFinish,
      txHash,
      mumbaiExplorer,
      axelarExplorer,
      selectedChain,
      axelarFee,
      loading,
      loadingClaim
    }
  },
  async mounted(){
    if(this.selectedChain[0].name !== 'Moonbeam') {
      this.loading = true
      await this.getEstimatedFeeAxelar()
      this.loading = false
    }
  },
  methods: {
    viewBlockExplorer(){
      const url = this.selectedChain[0].block_explorer + 'tx/'
      window.open(url + this.txHash, '_blank')
    },
    async getEstimatedFeeAxelar() {
      const d = await getFeeAxelarTwoWay(this.selectedChain)
      this.axelarFee = d
    },
    async requestClaim() {
      this.loadingClaim = true
      let tx;
      try {
        if(this.selectedChain[0].name === 'Moonbeam') {
          tx = await claimOnPolygon(ethers.BigNumber.from(this.roundId));
        } else {
          tx = await claimOthersOthers( this.selectedChain, ethers.BigNumber.from(this.roundId), ethers.utils.parseUnits(this.axelarFee))
        }
        await sleep(2)
        this.txHash = tx.hash
        this.loadingClaim = false
        this.isFinish = true
      } catch (error) {
        this.loadingClaim = false
        console.log(error)
      }
    }
  }
  
}
</script>

<style>

</style>
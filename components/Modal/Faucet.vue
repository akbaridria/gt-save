<template>
  <div class="relative z-[10000]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="fixed inset-0 bg-netral-600 bg-opacity-75 transition-opacity"></div>

  <div class="fixed inset-0 z-[10000] overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center items-center p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full my-8 w-full max-w-md">
        <div class="bg-netral-500 px-4 pb-4 pt-5 p-6 pb-4 grid gap-4">
            <template v-if="!isFinish">
              <div class="flex justify-between">
                <div class="text-lg">Faucet</div>
                <ion-icon @click="$emit('closeModal')" class="text-lg cursor-pointer" name="close-outline"></ion-icon>
              </div>
              <div class="text-sm">
                <div class="flex gap-2 opacity-50">To deposit into GTSave on moonbeam you can use 
                  <a href="https://moonbase.moonscan.io/token/0x3799D95Ee109129951c6b31535b2B5AA6dbF108c" target="_blank" class="underline flex gap-1">
                  USDC <IconsExternalLink :size="16" />
                  </a>
                </div>
                <div class="py-2 opacity-50">But, for deposit from other chains you can use aUSDC (axlUSDC).</div>
                <div class="grid gap-6 my-6">
                  <div class="border border-netral-300 rounded-lg p-4">
                    100 USDC
                  </div>
                  <div @click="faucet()" :class="{'cursor-not-allowed pointer-events-none text-white bg-slate-600' : loading }" class="px-4 py-2 rouned-lg bg-primary-100 text-netral-300 hover:opacity-90 transition-all rounded-lg text-center cursor-pointer">
                    <div class="flex gap-2 justify-center items-center">
                      <IconsLoadingCircle class="animate-spin" :size="16" v-if="loading" />
                      <div>{{ buttonName }}</div>
                    </div>
                  </div>
                </div>
                <div class="my-6 text-center">For aUSDC faucet you can go to axelar discord <a class="underline text-primary-100" href="https://discord.com/invite/aRZ3Ra6f7D" target="_blank">here</a> and go to #faucet channel</div>
              </div>
            </template>
            <template v-else>
              <div class="flex flex-col gap-6 items-center">
                <div class="flex justify-end w-full"><ion-icon @click="$emit('closeModal')" class="cursor-pointer" name="close-outline"></ion-icon></div>
                <LogosFlower class="animate-spin-slow" />
                <div class="text-center">
                    <div class="text-lg my-5">Faucet Successs</div>
                    <div class="opacity-50 text-sm">Your can deposit to GTSave now!</div>
                    <a href="/deposit" class="my-5 flex gap-3 text-netral-500 hover:opacity-90 justify-center bg-primary-100 rounded-lg p-[0.75rem] cursor-pointer">
                      Go to deposit page
                    </a>
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
import { faucetUsdc } from '../../scripts/helper'
const listChains = require('../../data/chains.json')

export default {
  data(){
    const isFinish = false
    const isConnected = this.$store.state.isConnected
    const loading = false
    const txHash = null
    const buttonName = 'Faucet'
    const wrongNetwork = this.$store.state.chainId === 1287
    return {
      isFinish,
      isConnected,
      loading,
      txHash,
      buttonName,
      wrongNetwork
    }
  },
  watch: {
    '$store.state.isConnected': function(newV) {
      this.isConnected = newV
    },
    '$store.state.chainId': function(newV) {
      this.wrongNetwork = newV === 1287
      if(newV) {
        if(this.wrongNetwork) {
          this.buttonName = 'Faucet'
        } else {
          this.buttonName = 'Switch To Moonbase Alpha'
        }
      } else {
        this.buttonName = 'Connect Wallet'
      }
    },
  },
  mounted(){
    if(this.isConnected) {
      if(!this.wrongNetwork) {
        this.buttonName = 'Switch To Moonbase Alpha'
      }
    } else {
      this.buttonName = 'Connect Wallet'
    }
  },
  methods: {
    viewBlockExplorer(){
      const url = 'https://moonbase.moonscan.io/tx/'
      window.open(url + this.txHash, '_blank')
    },
    async faucet(){
      try {
        if(this.isConnected) {
          if(this.wrongNetwork) {
            this.loading = true
            this.buttonName = 'Confirm your transaction'
            const tx = await faucetUsdc(this.$store.state.userAddress)
            this.buttonName = 'Waiting for your transaction to complete'
            const receipt = await tx.wait();
            this.txHash = receipt.transactionHash
            this.loading = false
            this.isFinish = true
          } else {
            this.$emit('switchWallet', listChains.filter(item => item.name === 'Moonbeam')[0])
          }
        } else {
          this.$emit('connectWallet')
        }
      } catch (error) {
        this.buttonName = 'Faucet'
        this.loading = false
        console.log(error)
      }
      
    }
  }
}
</script>

<style>

</style>
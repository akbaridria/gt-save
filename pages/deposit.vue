<template>
  <div class="py-[6rem] relative z-50">
    <div class="flex gap-5 mb-[2.5rem] items-center flex-col lg:flex-row xl:flex-row">
      <div class="text-[2.5rem] md:text-[3rem] lg:text-[5rem] xl:text-[5rem]">DEPOSIT</div>
      <div>
        <div>This week's raffle countdown</div>
        <div class="flex gap-2">
          <div class="border-netral-300 border-[1px] rounded-xl h-[3rem] w-[3rem] flex flex-col items-center justify-center">
            <div class="text-[1rem]">{{ countDown.days }}</div>
            <div class="text-[0.5rem]">Days</div>
          </div>
          <div class="border-netral-300 border-[1px] rounded-xl h-[3rem] w-[3rem] flex flex-col items-center justify-center">
            <div class="text-[1rem]">{{ countDown.hours }}</div>
            <div class="text-[0.5rem]">Hours</div>
          </div>
          <div class="border-netral-300 border-[1px] rounded-xl h-[3rem] w-[3rem] flex flex-col items-center justify-center">
            <div class="text-[1rem]">{{ countDown.minutes }}</div>
            <div class="text-[0.5rem]">Minutes</div>
          </div>
          <div class="border-netral-300 border-[1px] rounded-xl h-[3rem] w-[3rem] flex flex-col items-center justify-center">
            <div class="text-[1rem]">{{ countDown.seconds }}</div>
            <div class="text-[0.5rem]">Seconds</div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid lg:grid-cols-2 xl:grid-cols-2 gap-4">
      <div class="border border-netral-300 rounded p-[1rem] md:p-[2rem] lg:p-[2.5rem] xl:p-[3rem] grid gap-4 justify-center text-center max-w-full">
        <div class="flex justify-center gap-7">
          <div v-if="chains.length > 0" class="flex gap-4">
            <LogosUsdc />
            <div>{{ chains[0].name === 'Polygon' ? 'USDC' : 'aUSDC' }}</div>
          </div>
          <div class="flex gap-4">
            <component v-if="chains.length > 0" :is="chains[0].logo" pattern="pattern-123123213" />
            <div>{{ chains.length > 0 ? chains[0].name : 'Unknown' }}</div>
          </div>
        </div>
        <div class="grid items-center">
          <input class="bg-transparent outline-0 text-center text-[2rem] lg:text-[3rem] xl:text-[4rem] w-full" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" type="number" inputmode="decimal" min="0" v-model="amountDeposit">
        </div>
        <div>
          Balance: {{ usdcBalance }} 
          <span @click="amountDeposit = usdcBalance" class="underline cursor-pointer">Max</span>
        </div>
        <div class="flex justify-center cursor-pointer ">
          <div @click="$nuxt.$emit('connectWallet')" v-if="!isConnect" class="hover:opacity-90 transition-all cursor-pointer bg-primary-100 rounded-xl px-[1.25rem] py-[0.4rem] lg:py-[0.5rem] xl:py-[0.6rem] text-netral-500">
            Connect Wallet
          </div>
          <div @click="amountDeposit > 0 ? $nuxt.$emit('showModal', amountDeposit) : null" v-else-if="!detailError.error" :class="amountDeposit > 0 ? null : 'bg-slate-900 text-slate-600'" class="hover:opacity-90 bg-primary-100 rounded-xl px-[1.25rem] py-[0.4rem] lg:py-[0.5rem] xl:py-[0.6rem] text-netral-500">
            Request Deposit
          </div>
          <div v-else class="bg-primary-100 bg-red-600 rounded-xl px-[1.25rem] py-[0.4rem] lg:py-[0.5rem] xl:py-[0.6rem] text-white">
            {{ detailError.message }}
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div class="border border-netral-300 rounded p-[1.5rem] text-lg flex justify-between items-center max-w-full">
          <div class="flex gap-3"> <IconsDollar /> Total Deposit</div>
          <div class="font-bold">${{ totalDeposit }}</div>
        </div>
        <div class="border border-netral-300 rounded p-[1.5rem] flex flex-col max-w-full">
          <div class="text-lg">Draw History</div>
          <hr class="border-t-[1px] border-netral-300 my-3" />
          <div v-if="listWinners.length > 0">
            <div class="flex justify-between">
              <div>Draw #100001</div>
              <div class="hidden xl:block lg:block md:block">May 19 2023</div>
              <div>0x694...294</div>
              <div>$149</div>
              <IconsExternalLink :size="24" />
            </div>
          </div>
          <div v-else>
            <div>No winners yet.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCountDown, getTotalDeposit, getUsdcBalance } from '../scripts/helper'
const moment = require('moment');
const listChains = require('../data/chains.json');
const ethers = require('ethers')
const erc20 = require('../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json');

export default {
  data(){
    const amountDeposit = null;
    const countDown = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    }
    const intervalId = 0
    const totalDeposit = 0  
    const listWinners = []
    const usdcBalance = 0
    const chains = listChains.filter(item => item.chainId === this.$store.state.chainId)
    const detailError = {
      error: false,
      message: ''
    }
    const isConnect = this.$store.state.isConnected
    return {
      amountDeposit,
      countDown,
      intervalId,
      totalDeposit,
      listWinners,
      usdcBalance,
      chains,
      detailError,
      isConnect
    }
  },
  watch: {
    '$store.state.chainId': async function(newV) {
      this.amountDeposit = 0
      this.chains = listChains.filter(item => item.chainId === newV)
      if(this.chains.length === 0) {
        this.detailError.error = true;
        this.detailError.message = 'Wrong Network'
      } else {
        this.detailError.error = false
      }
      await this.getBalance()
    },
    '$store.state.userAddress': async function() {
      await this.getBalance()
    },
    '$store.state.isConnected': function(newV) {
      this.isConnect = newV
    },
    amountDeposit(newV) {
      if(this.usdcBalance < newV) {
        this.detailError.error = true;
        this.detailError.message = 'Insufficient balance'
      } else {
        this.detailError.error = false
      }
    },
    usdcBalance(newV) {
      if(this.amountDeposit > newV) {
        this.detailError.error = true;
        this.detailError.message = 'Insufficient balance'
      } else {
        this.detailError.error = false
      }
    }
  },
  async mounted(){
    const endRound = await getCountDown(this.$config.privKey)
    this.totalDeposit = await getTotalDeposit(this.$config.privKey)
    this.intervalId = setInterval(() => {this.formattedCountDown(endRound)}, 1000)
    await this.getListWinners()
    await this.getBalance()
  },
  beforeDestroy() {
    clearInterval(this.intervalId)
  },
  methods: {
    formattedCountDown(end) {
      const n = moment().unix();
      const diff = end - n;
      const countdown = moment.duration(diff, 'seconds')
      this.countDown.days = countdown.days();
      this.countDown.hours = countdown.hours();
      this.countDown.minutes = countdown.minutes();
      this.countDown.seconds = countdown.seconds();
    },
    getListWinners(){
      const topic = '0x712f8f97b2d374168ccc696af73af8177e1cd3e052cd391ef8a50136ec2c9d83';
      fetch(`https://api.covalenthq.com/v1/matic-mumbai/events/topics/${topic}/?starting-block=35894923&ending-block=latest&key=${this.$config.cKey}`, {method: 'GET'})
        .then((resp) => resp.json())
        .then((data) => {
          this.listWinners = data.data.items
        });
    },
    async getBalance() {
      const chain = listChains.filter(item => item.chainId === this.$store.state.chainId)
      if(chain.length > 0) {
        this.usdcBalance = await getUsdcBalance(this.$store.state.userAddress, chain)
        console.log(this.usdcBalance)
      } else {
        this.usdcBalance = 0
      }
    }
  }
}
</script>

<style>

</style>
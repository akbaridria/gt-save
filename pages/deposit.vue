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
        <div class="flex justify-center items-center gap-2">
          <span class="flex gap-2 items-center justify-center">
            Balance: <span v-if="loading"><IconsLoadingCircle class="animate-spin" :size="16" /></span><span v-else>{{ usdcBalance }} </span>
          </span>
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
        <div class="text-sm text-red-600">
            Because of lack of liquidity in testnet, <br> the amount that you can deposit maximum is 5 (a)USDC
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div class="border border-netral-300 rounded p-[1.5rem] text-lg flex justify-between items-center max-w-full">
          <div class="flex gap-3"> <IconsDollar /> Total Deposit</div>
          <div class="font-bold flex gap-2 items-center">
            $ <span v-if="loading"><IconsLoadingCircle class="animate-spin" :size="16" /></span> <span v-else>{{ totalDeposit }}</span>
          </div>
        </div>
        <div class="border border-netral-300 rounded p-[1.5rem] flex flex-col max-w-full">
          <div class="text-lg">Draw History</div>
          <hr class="border-t-[1px] border-netral-300 my-3" />
          <div v-if="listWinners.length > 0">
            <a v-for="(item, index) in listWinners" :key="index" :href="item.txHash" target="_blank" class="grid lg:grid-cols-[1fr_1fr_1fr_1fr_30px] xl:grid-cols-[1fr_1fr_1fr_1fr_30px] grid-cols-[1fr_1fr_1fr_30px]">
              <div>#{{item.roundId }}</div>
              <div class="hidden xl:block lg:block md:block">{{ item.date }}</div>
              <div>{{ item.winner }}</div>
              <div>${{ item.amount }}</div>
              <IconsExternalLink :size="24" />
            </a>
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
    const loading = true
    const urlExplorer = 'https://mumbai.polygonscan.com/tx/'
    return {
      amountDeposit,
      countDown,
      intervalId,
      totalDeposit,
      listWinners,
      usdcBalance,
      chains,
      detailError,
      isConnect,
      loading,
      urlExplorer
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
      if(newV > 5) {
        this.detailError.error = true
        this.detailError.message = 'Max. 5 (a)USDC'
      }
      else if(this.usdcBalance < newV) {
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
    this.loading = true
    const endRound = await getCountDown(this.$config.privKey)
    this.totalDeposit = await getTotalDeposit(this.$config.privKey)
    this.intervalId = setInterval(() => {this.formattedCountDown(endRound)}, 1000)
    await this.getListWinners()
    await this.getBalance()
    this.loading = false
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
    async getListWinners(){
      const topic = '0x712f8f97b2d374168ccc696af73af8177e1cd3e052cd391ef8a50136ec2c9d83';
      await fetch(`https://api.covalenthq.com/v1/matic-mumbai/events/topics/${topic}/?starting-block=35894923&ending-block=latest&key=${this.$config.cKey}`, {method: 'GET'})
        .then((resp) => resp.json())
        .then((data) => {
          this.listWinners = data.data.items
          this.formattedListWinner(data.data.items)
        });
    },
    formattedListWinner(data) {
      this.listWinners = []
      for(let i = 0; i <  data.length; i++) {
        const address = ethers.utils.defaultAbiCoder.decode(['address'], data[i].raw_log_topics[1])
        const roundId = ethers.utils.defaultAbiCoder.decode(['uint256'], data[i].raw_log_topics[2])
        const amount = ethers.utils.defaultAbiCoder.decode(['uint256'], data[i].raw_log_data)
        this.listWinners.push({
          roundId: roundId[0],
          date: moment(data[i].block_signed_at).format('LL'),
          winner: address[0].slice(0,5) + '...' + address[0].slice(-3),
          amount: ethers.utils.formatUnits(amount[0], '6'),
          txHash: this.urlExplorer + data[i].tx_hash
        })
      }
    },
    async getBalance() {
      const chain = listChains.filter(item => item.chainId === this.$store.state.chainId)
      if(chain.length > 0) {
        this.usdcBalance = await getUsdcBalance(this.$store.state.userAddress, chain)
      } else {
        this.usdcBalance = 0
      }
    }
  }
}
</script>

<style>

</style>
<template>
  <div class="pt-[8rem] pb-[35vh] relative z-50">
    <div v-if="!isConnect" class="flex flex-col gap-4 items-center">
      <IconsWallet />
      <div class="text-2xl">Prize savings for humans</div>
      <div class="opacity-50">Open to all, free forever. No banks, no stress, just prizes.</div>
      <div @click="$nuxt.$emit('connectWallet')" class="cursor-pointer p-[1rem] border border-white rounded">Connect your wallet</div>
    </div>

    <div v-else class="grid lg:grid-cols-2 xl:grid-cols-2 gap-4">
      <div class="flex flex-col gap-4">
        <div @click="$nuxt.$emit('showModalAccount', userData.balance)" class="border border-netral-300 p-[1.5rem] cursor-pointer flex justify-between rounded">
            <div>
              <div class="opacity-50">Your Account</div>
              <div class="text-lg line-clamp-1">{{ userData.user.slice(0, 5) + '...' + userData.user.slice(-3) }}</div>
            </div>
            <div class="flex items-center gap-4 text-xl">
              <div class="flex gap-2 items-center">$ <span v-if="!loading.all || !loading.balance">{{ userData.balance }}</span><span v-else><IconsLoadingCircle :size="16" class="animate-spin" /></span></div>
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </div>
        </div>
        <div class="border border-netral-300 p-[1.5rem] rounded flex flex-col gap-4">
          <div class="flex items-center justify-between lg:text-lg xl:text-lg">
            <div>History Transactions</div>
            <div><DropdownUserActivity @selectValue="getUserActivity($event)" /></div>
          </div>
          <hr class="border-t border-netral-300">
          <div v-if="!loading.all || !loading.activity" class="flex flex-col gap-3">
            <a v-for="(item, index) in userData.activity" :key="index" :href="item.txHash" target="_blank" class="grid grid-cols-[1fr_1fr_1fr_50px]  lg:grid-cols-[1fr_1fr_1fr_1fr_50px] xl:grid-cols-[1fr_1fr_1fr_1fr_50px] gap-4">
                <div>{{ item.blockId }}</div>
                <div class="hidden xl:block lg:block md:block">{{ item.date }}</div>
                <div>{{ item.category }}</div>
                <div>${{ item.amount }}</div>
                <IconsExternalLink />
            </a>
          </div>
          <div v-else>
            <IconsLoadingCircle class="animate-spin" />
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
import { getUserData } from '../scripts/helper'
const ethers = require('ethers');
const moment = require('moment')
export default {
  data(){
    const isConnect = this.$store.state.isConnected
    const userData = {
      balance: 0,
      listWin: [],
      user: this.$store.state.userAddress,
      activity: []
    }
    const loading = {
      activity: true,
      balance: true,
      all: true
    }
    const urlExplorer = 'https://mumbai.polygonscan.com/tx/'
    return {
      isConnect,
      userData,
      loading,
      urlExplorer
    }
  },
  watch: {
    '$store.state.isConnected': function(newV) {
      this.isConnect = newV
    },
    '$store.state.userAddress': async function(newV) {
      if(newV) {
        this.userData.user = newV;
        await this.getDetailUser()
        await this.getUserActivity({ name: 'Deposit'});
      }

    }
  },
  async mounted(){
    if(this.$store.state.userAddress){
      this.loading.all = true
      await this.getDetailUser()
      await this.getUserActivity({ name: 'Deposit'});
      this.loading.all = false
    }
  },
  methods: {
    async getDetailUser() {
      this.loading.balance = true
      const data = await getUserData(this.$config.privKey, this.$store.state.userAddress)
      this.userData.balance = ethers.utils.formatUnits(ethers.BigNumber.from(data.balance), '6')
      this.userData.listWin = data.listWin
      this.loading.balance = false
    },
    async getUserActivity(category){
      const listCategory = {
        Deposit: {
          topic: '0x079a00d95c8ba77895d65ce09232bc98446b1b0de6f74c249d199ab26a11c2fa'
        },
        Withdraw: {
          topic: '0xf0ccc01369b7fa379493616626b8963509d65cb00db21bcea3e2ef62b99ee029'
        },
        Claim: {
          topic: ''
        }
      }
      this.loading.activity = true
        fetch(`https://api.covalenthq.com/v1/matic-mumbai/events/topics/${listCategory[category.name].topic}/?starting-block=35894923&ending-block=latest&secondary-topics=${'0x000000000000000000000000' + this.$store.state.userAddress.slice(2)}&key=${this.$config.cKey}`, {method: 'GET'})
        .then(async (resp) => await resp.json())
        .then(async (data) => {
          console.log(data)
          await this.formattedDataUser(data.data.items, category.name)
          this.loading.activity = false
        }); 
    },
    formattedDataUser(data, category) {
      this.userData.activity = []
      for(let i = 0; i < data.length; i++) {
        const e = ethers.utils.defaultAbiCoder.decode(
          ['string', 'uint256', 'uint256'],
          data[i].raw_log_data
        )
        this.userData.activity.push({
          blockId: '#' + data[i].block_height,
          date: moment(data[i].block_signed_at).format('LL'),
          category: category,
          amount: ethers.utils.formatUnits(e[2], 6),
          txHash : this.urlExplorer + data[i].tx_hash
        })
      }
    }
  }
}
</script>

<style>

</style>
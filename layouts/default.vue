<template>
  <div class="min-h-screen w-screen bg-netral-500 text-white">
    <img src="images/light.png" class="absolute z-[50] top-0 right-0" alt="">
    <Header @connect="connectWallet($event)" @changeNetwork="switchWallet($event)" />
    <ModalDeposit v-if="openModal" @closeModal="openModal = false" :amount="amountDeposit" />
    <ModalAccount v-if="openModalAccount" @closeModal="openModalAccount = false" :balance="userBalance" />
    <ModalClaim v-if="openModalClaim" @closeModal="openModalClaim = false" :prize="userPrize" :roundId="claimRoundId" />
    <div class="container px-4 min-h-screen mx-auto relative">
      <div>
        <Nuxt />
        <Footer />
      </div>
    </div>
  </div>
</template>

<script>
const {ethers} = require('ethers');
const chains = require('../data/chains.json');

export default {
  data() {
    const openModal = false
    const amountDeposit = 0
    const openModalAccount = false
    const userBalance = 0
    const userPrize = 0
    const openModalClaim = false
    const claimRoundId = 0
    return {
      openModal,
      amountDeposit,
      openModalAccount,
      userBalance,
      openModalClaim,
      userPrize,
      claimRoundId
    }
  },
  async mounted(){
    await this.initWallet();
    if(window.ethereum) {
      window.ethereum.on('chainChanged', (e) => {
        this.$store.commit('setChainId', ethers.BigNumber.from(e).toNumber());
      })

      window.ethereum.on('accountsChanged', (e) => {
        if(e.length === 0) {
          this.$store.commit('setConnected', false);
          this.$store.commit('setChainId', null);
          this.$store.commit('setUserAddress', null)
        } else {
          this.$store.commit('setUserAddress', e[0])
        }
      })
    }
   
  },
  created() {
    this.$nuxt.$on('connectWallet', ($event) => this.connectWallet($event))
    this.$nuxt.$on('showModal', ($event) => this.showModal($event))
    this.$nuxt.$on('showModalAccount', ($event) => this.showModalAccount($event))
    this.$nuxt.$on('showModalClaim', ($event) => this.showModalClaim($event))
  },
  beforeDestroy() {
    this.$nuxt.$off('connectWallet', ($event) => this.connectWallet($event))
    this.$nuxt.$off('showModal', ($event) =>  this.showModal($event))
    this.$nuxt.$off('showModalAccount', ($event) => this.showModalAccount($event))
    this.$nuxt.$off('showModalClaim', ($event) => this.showModalClaim($event))
  },
  methods: {
    showModalClaim(data) {
      console.log(data)
      this.claimRoundId = data.roundId
      this.userPrize = data.prize
      this.openModalClaim = true
    },
    showModal(amount) {
      this.amountDeposit = amount
      this.openModal = !this.openModal
    },
    showModalAccount(amount) {
      this.userBalance = amount
      this.openModalAccount = true
    },
    async initWallet() {
      if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        const userAddress = provider.provider.selectedAddress;

        if(userAddress) {
          const chainId = ethers.BigNumber.from(provider.provider.chainId).toNumber();
          this.$store.commit('setUserAddress', userAddress);
          this.$store.commit('setConnected', true)
          const isSupported = chains.filter(item => item.chainId === chainId);
          if(isSupported.length === 0) {
            const moonbeam = chains.filter(item => item.name === 'Moonbeam')[0];
            this.switchWallet(moonbeam)
          } else {
            this.$store.commit('setChainId', chainId);
          }
        }
      }
      
    },
    async connectWallet() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []);
        await this.initWallet()
      } catch (error) {
        console.log(error)
      }
      
    },
    async switchWallet(detailChain) {
      try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: detailChain.detail.chainId }]
          });
        } catch (err) {
          if (err.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [detailChain.detail]
            })
          }
        }
    },
  }
}
</script>

<style>

</style>
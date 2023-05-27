<template>
  <div class="min-h-screen w-screen bg-netral-500 text-white">
    <img src="images/light.png" class="absolute z-[50] top-0 right-0" alt="">
    <Header @connect="connectWallet($event)" @changeNetwork="switchWallet($event)" />
    <ModalDeposit v-if="openModal" @closeModal="openModal = false" :amount="amountDeposit" />
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
    return {
      openModal,
      amountDeposit
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
        }
      })
    }
   
  },
  created() {
    this.$nuxt.$on('connectWallet', ($event) => this.connectWallet($event))
    this.$nuxt.$on('showModal', ($event) => this.showModal($event))
  },
  beforeDestroy() {
    this.$nuxt.$off('connectWallet', ($event) => this.connectWallet($event))
    this.$nuxt.$off('showModal', ($event) =>  this.showModal($event))
  },
  methods: {
    showModal(amount) {
      console.log(amount)
      this.amountDeposit = amount
      this.openModal = !this.openModal
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
            const polygon = chains.filter(item => item.name === 'Polygon')[0];
            this.switchWallet(polygon)
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
<template>
  <div class="min-h-screen w-screen bg-netral-500 text-white">
    <div class="fixed bottom-0 text-sm right-0 px-4 py-2 bg-red-600 rounded-tl-lg z-[1000]">
      We are on testnet!
    </div>
    <img src="images/light.png" class="absolute z-[50] top-0 right-0" alt="">
    <Header @connect="connectWallet($event)" @changeNetwork="switchWallet($event)" @openModalFaucet="openModalFaucet = true" />
    <ModalDeposit v-if="openModal" @closeModal="openModal = false" :amount="amountDeposit" />
    <ModalAccount v-if="openModalAccount" @closeModal="openModalAccount = false" :balance="userBalance" />
    <ModalClaim v-if="openModalClaim" @closeModal="openModalClaim = false" :prize="userPrize" :roundId="claimRoundId"  />
    <ModalFaucet v-if="openModalFaucet" @closeModal="openModalFaucet = false" @switchWallet="switchWallet($event)" @connectWallet="connectWallet($event)"/>
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
    const openModalFaucet = false
    return {
      openModal,
      amountDeposit,
      openModalAccount,
      userBalance,
      openModalClaim,
      userPrize,
      claimRoundId,
      openModalFaucet
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
    this.$nuxt.$on('showModalFaucet', ($event) => this.showModalFaucet($event))
  },
  beforeDestroy() {
    this.$nuxt.$off('connectWallet', ($event) => this.connectWallet($event))
    this.$nuxt.$off('showModal', ($event) =>  this.showModal($event))
    this.$nuxt.$off('showModalAccount', ($event) => this.showModalAccount($event))
    this.$nuxt.$off('showModalClaim', ($event) => this.showModalClaim($event))
    this.$nuxt.$off('showModalFaucet', ($event) => this.showModalFaucet($event))
  },
  methods: {
    showModalFaucet() {
      this.openModalFaucet = true;
    },
    showModalClaim(data) {
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
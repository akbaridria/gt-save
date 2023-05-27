export const state = () => ({
  isConnected: false,
  chainId: null,
  userAddress: null,
});

export const mutations = {
  setConnected(state, v) {
    state.isConnected = v;
  },
  setChainId(state, v) {
    state.chainId = v;
  },
  setUserAddress(state, v) {
    state.userAddress = v;
  },
};

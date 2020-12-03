import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import concat from 'lodash/fp/concat'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import web3Util from '@/utils/web3-util'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET'
  ]),
  map(x => [x, x]),
  fromPairs
)([
  'CONNECT_WALLET',
  'SWITCH_WALLET',
  'DISCONNECT_WALLET'
])

function initialState () {
  return {
    address: web3Util.getUserAddress()
  }
}

const state = initialState()

const getters = {}

const mutations = {
  [types.RESET] (state) {
    const s = initialState()
    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  },

  [types.CONNECT_WALLET_REQUEST] () {},
  [types.CONNECT_WALLET_SUCCESS] (state, { address }) {
    state.address = address
  },
  [types.CONNECT_WALLET_FAILURE] () {},

  [types.SWITCH_WALLET_REQUEST] () {},
  [types.SWITCH_WALLET_SUCCESS] (state, { address }) {
    state.address = address
  },
  [types.SWITCH_WALLET_FAILURE] () {},

  [types.DISCONNECT_WALLET_REQUEST] () {},
  [types.DISCONNECT_WALLET_SUCCESS] (state) {
    state.address = ''
  },
  [types.DISCONNECT_WALLET_FAILURE] () {}
}

const actions = {
  async connectWallet ({ commit, getters, dispatch }, { provider }) {
    commit(types.CONNECT_WALLET_REQUEST)
    const ETHEREUM_NODE_URL = getters.servicesIPs['eth-node-service'].value
    try {
      const address = await web3Util.onConnect({
        provider,
        url: ETHEREUM_NODE_URL
      })
      web3Util.storeUserAddress(address)
      commit(types.CONNECT_WALLET_SUCCESS, { address })
      await dispatch('getAccountInfo', { address })
    } catch (error) {
      commit(types.CONNECT_WALLET_FAILURE)
      throw error
    }
  },

  async switchAccount ({ commit, dispatch }, { address }) {
    commit(types.SWITCH_WALLET_REQUEST)
    try {
      web3Util.removeUserAddress()
      web3Util.storeUserAddress(address)
      commit(types.SWITCH_WALLET_SUCCESS, { address })
      await dispatch('getAccountInfo', { address })
    } catch (error) {
      commit(types.SWITCH_WALLET_FAILURE)
      throw error
    }
  },

  async disconnectWallet ({ commit }) {
    commit(types.DISCONNECT_WALLET_REQUEST)
    try {
      web3Util.removeUserAddress()
      commit(types.DISCONNECT_WALLET_SUCCESS)
      commit(types.RESET)
    } catch (error) {
      commit(types.DISCONNECT_WALLET_FAILURE)
      throw error
    }
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}

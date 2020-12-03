import Vue from 'vue'
import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import concat from 'lodash/fp/concat'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import configUtil from '@/utils/config-util'
import gatewayUtil from '@/utils/gateway-util'
import gameUtil from '@/utils/game-util'
import { ETH_TILE_AMOUNT, GAME_X, GAME_Y, VAL_TILE_AMOUNT, XOR_TILE_AMOUNT } from '@/consts'
import web3Util from '@/utils/web3-util'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET',
    'GENERATE_MAP'
  ]),
  map(x => [x, x]),
  fromPairs
)([
  'LOAD_CONFIGURATION_FILE',
  'GET_ACCOUNT_INFO',
  'GET_GAME_INFO',
  'GET_TOTAL_LIQUIDITY'
])

function initialState () {
  return {
    services: {},
    map: [],
    account: {
      user: {
        address: '',
        lastBlock: 0,
        reward: '0'
      },
      liquidity: {
        XE: { token0: '0', token1: '0', percent: '0' },
        XV: { token0: '0', token1: '0', percent: '0' },
        VE: { token0: '0', token1: '0', percent: '0' }
      }
    },
    game: {
      totalPswap: '0',
      lastBlock: '0',
      lastUpdateTimestamp: new Date().getTime()
    },
    total: {
      XOR: '0',
      VAL: '0',
      ETH: '0'
    }
  }
}

const state = initialState()

const mutations = {
  [types.RESET] (state) {
    const s = initialState()
    state.account = s.account
  },

  [types.LOAD_CONFIGURATION_FILE_REQUEST] (state) {},
  [types.LOAD_CONFIGURATION_FILE_SUCCESS] (state, config) {
    state.services = config.services
    state.params = config.params
  },
  [types.LOAD_CONFIGURATION_FILE_FAILURE] (state, err) {},

  [types.GET_ACCOUNT_INFO_REQUEST] (state) {},
  [types.GET_ACCOUNT_INFO_SUCCESS] (state, account) {
    state.account = account
  },
  [types.GET_ACCOUNT_INFO_FAILURE] (state, err) {},

  [types.GET_GAME_INFO_REQUEST] (state) {},
  [types.GET_GAME_INFO_SUCCESS] (state, game) {
    Vue.set(state, 'game', {
      totalPswap: game.totalPswap,
      lastBlock: game.lastBlock,
      lastUpdateTimestamp: game.lastUpdateTimestamp
    })
  },
  [types.GET_GAME_INFO_FAILURE] (state, err) {},

  [types.GET_TOTAL_LIQUIDITY_REQUEST] (state) {},
  [types.GET_TOTAL_LIQUIDITY_SUCCESS] (state, total) {
    Vue.set(state, 'total', {
      XOR: total.XOR,
      VAL: total.VAL,
      ETH: total.ETH
    })
  },
  [types.GET_TOTAL_LIQUIDITY_FAILURE] (state, err) {},

  [types.GENERATE_MAP] (state, map) {
    state.map = map
  }
}

const actions = {
  async loadConfiguration ({ commit }) {
    commit(types.LOAD_CONFIGURATION_FILE_REQUEST)
    try {
      const config = await configUtil.getConfiguration()
      commit(types.LOAD_CONFIGURATION_FILE_SUCCESS, config)
      return Promise.resolve()
    } catch (error) {
      commit(types.LOAD_CONFIGURATION_FILE_FAILURE)
      throw error
    }
  },

  async getAccountInfo ({ getters, commit }, { address }) {
    commit(types.GET_ACCOUNT_INFO_REQUEST)
    const url = getters.servicesIPs['gateway-service']
      ? getters.servicesIPs['gateway-service'].value
      : ''
    try {
      const account = await gatewayUtil.getAccountInfo(url, address)
      web3Util.storeUserAddress(address)
      commit(types.GET_ACCOUNT_INFO_SUCCESS, account)
    } catch (error) {
      commit(types.GET_ACCOUNT_INFO_FAILURE)
      throw error
    }
  },

  async getGameInfo ({ getters, commit }) {
    commit(types.GET_GAME_INFO_REQUEST)
    const url = getters.servicesIPs['gateway-service']
      ? getters.servicesIPs['gateway-service'].value
      : ''
    try {
      const game = await gatewayUtil.getGameInfo(url)
      commit(types.GET_GAME_INFO_SUCCESS, game)
    } catch (error) {
      commit(types.GET_GAME_INFO_FAILURE)
      throw error
    }
  },

  async getTotalLiquidity ({ getters, commit }) {
    commit(types.GET_TOTAL_LIQUIDITY_REQUEST)
    const url = getters.servicesIPs['gateway-service']
      ? getters.servicesIPs['gateway-service'].value
      : ''
    try {
      const total = await gatewayUtil.getTotalLiquidity(url)
      commit(types.GET_TOTAL_LIQUIDITY_SUCCESS, total)
    } catch (error) {
      commit(types.GET_TOTAL_LIQUIDITY_FAILURE)
      throw error
    }
  },

  async generateMap ({ commit, getters }) {
    const { XOR, VAL, ETH } = getters.totalLiquidity
    const XORTiles = Math.ceil(XOR / XOR_TILE_AMOUNT)
    const VALTiles = Math.ceil(VAL / VAL_TILE_AMOUNT)
    const ETHTiles = Math.ceil(ETH / ETH_TILE_AMOUNT)
    const map = gameUtil.generateMap(GAME_Y, GAME_X)
    const bmap = gameUtil.populateMap(
      map,
      { x: GAME_X, y: GAME_Y },
      { ETH: ETHTiles, XOR: XORTiles, VAL: VALTiles },
      getters.account
    )
    commit(types.GENERATE_MAP, bmap)
  }
}

const getters = {
  servicesIPs (state) {
    return state.services
  },
  configParams (state) {
    return state.params
  },
  totalLiquidity (state) {
    return state.total
  },
  account (state) {
    return state.account
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}

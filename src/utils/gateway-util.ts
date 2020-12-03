import axios from 'axios'

const getAccountInfo = (url: string, address: string) => {
  const mock = {
    user: {
      address,
      reward: '0',
      lastBlock: 0
    },
    liquidity: {
      XE: { token0: '0', token1: '0', percent: '0' },
      XV: { token0: '0', token1: '0', percent: '0' },
      VE: { token0: '0', token1: '0', percent: '0' }
    }
  }
  return axios({
    url: `/api/reward/${address}`,
    baseURL: url
  })
    .then(({ data }) => data)
    .catch(() => mock)
}

const getGameInfo = (url: string) => {
  return axios({
    url: '/api/app/info',
    baseURL: url
  })
    .then(({ data }) => data)
}

const getTotalLiquidity = (url: string) => {
  return axios({
    url: '/api/app/total',
    baseURL: url
  })
    .then(({ data }) => data)
}

export default {
  getAccountInfo,
  getGameInfo,
  getTotalLiquidity
}

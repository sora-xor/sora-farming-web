import Web3 from 'web3'
import Cookies from 'js-cookie'
import WalletConnectProvider from '@walletconnect/web3-provider'
import detectEthereumProvider from '@metamask/detect-provider'

const COOKIE_NAME = 'sorafarm_session_address'
let WALLET_CONNECT_PROVIDER: WalletConnectProvider | null = null

interface ConnectOptions {
  provider: Provider;
  url: string;
}

export enum Provider {
  Metamask,
  WalletConnect
}

async function onConnect (options: ConnectOptions) {
  if (options.provider === Provider.Metamask) {
    return onConnectMetamask()
  } else {
    return onConnectWallet(options.url)
  }
}

async function onConnectMetamask () {
  const provider = await detectEthereumProvider()
  if (!provider) {
    alert('MetaMask is not found. Please install it!')
    throw new Error('No Web3 instance!')
  }
  const web3Instance = new Web3(provider)
  const accounts = await web3Instance.eth.requestAccounts()
  return accounts.length ? accounts[0] : ''
}

async function onConnectWallet (url: string) {
  WALLET_CONNECT_PROVIDER = new WalletConnectProvider({
    rpc: { 1: url }
  })
  await WALLET_CONNECT_PROVIDER.enable()
  const web3Instance = new Web3(WALLET_CONNECT_PROVIDER as any)
  const accounts = await web3Instance.eth.getAccounts()
  return accounts.length ? accounts[0] : ''
}

async function watchEthereum (cb: {
  onAccountChange: Function;
  onDisconnect: Function;
}) {
  const ethereum = (window as any).ethereum
  if (ethereum) {
    ethereum.on('accountsChanged', cb.onAccountChange)
  }
  if (WALLET_CONNECT_PROVIDER) {
    WALLET_CONNECT_PROVIDER.on('accountsChanged', cb.onAccountChange)
    WALLET_CONNECT_PROVIDER.on('disconnect', cb.onDisconnect)
  }
}

function storeUserAddress (address: string) {
  const in1Hour = 1 / 24
  Cookies.set(COOKIE_NAME, address, {
    expires: in1Hour
  })
}

function getUserAddress (): string {
  return Cookies.get(COOKIE_NAME) || ''
}

function removeUserAddress () {
  Cookies.remove(COOKIE_NAME)
}

export default {
  onConnect,
  storeUserAddress,
  getUserAddress,
  removeUserAddress,
  watchEthereum
}

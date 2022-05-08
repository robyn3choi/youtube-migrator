import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'
import abi from 'contracts/Token.json'
import token from 'contracts/contract-address.json'

const nftContractAddress = token.Token

declare let window: any

const Web3Context = createContext<ProviderValue | undefined>(undefined)
type Props = { children: ReactNode }

type ProviderValue = {
  address: string | null
  connectWallet: () => void
  nftContract: ethers.Contract | null
}

export function Web3Provider({ children }: Props) {
  const [address, setAddress] = useState<string | null>(null)
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null)
  console.log(nftContract)
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined' && address) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setNftContract(new ethers.Contract(nftContractAddress, abi.abi, provider!.getSigner()))
    }
  }, [address])

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
      window.ethereum.on('accountsChanged', () => {
        window.location.reload()
      })
    }
  })

  useEffect(() => {
    async function checkIfWalletIsConnected() {
      try {
        const { ethereum } = window
        if (!ethereum) {
          console.log('Make sure you have metamask!')
          return
        } else {
          console.log('We have the ethereum object', ethereum)
        }
        const accounts = await ethereum.request({ method: 'eth_accounts' })

        if (accounts.length !== 0) {
          const account = accounts[0]
          console.log('Found an authorized account:', account)
          setAddress(account)
        } else {
          console.log('No authorized account found')
        }
      } catch (error) {
        console.log(error)
      }
    }
    checkIfWalletIsConnected()
  }, [])

  async function connectWallet() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAddress(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  return <Web3Context.Provider value={{ address, connectWallet, nftContract }}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

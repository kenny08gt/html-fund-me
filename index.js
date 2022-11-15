import { ethers } from "./ethers-5.1.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectBtn")
const fundButton = document.getElementById("fundBtn")
const balanceButton = document.getElementById("getBalance")
const withdrawButton = document.getElementById("withdrawBtn")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

function checkWallet() {
    return typeof window.ethereum !== "undefined"
}

async function connect() {
    if (checkWallet()) {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        document.getElementById("status").innerHTML = "Connected"
        await getBalance()
    } else {
        document.getElementById("status").innerHTML = "Please install metamask"
    }
}

async function getBalance() {
    if (checkWallet()) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(`Balance ${ethers.utils.formatEther(balance)}`)
        document.getElementById("balance").innerHTML =
            ethers.utils.formatEther(balance)
    }
}

async function fund() {
    const ethAmount = document.getElementById("amount").value + ""
    console.log(`funding with ${ethAmount}`)
    if (checkWallet()) {
        //get the provider of the wallet
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // get the account of the wallet that sign in
        const signer = provider.getSigner()
        // get the reference of the contract
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const txResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //listen for txt to be mined
            await listenForTransactionMine(txResponse, provider)
            console.log("Done")
            await getBalance()
        } catch (error) {
            console.error(error)
        }
    }
}

async function withdraw() {
    if (checkWallet()) {
        //get the provider of the wallet
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // get the account of the wallet that sign in
        const signer = provider.getSigner()
        // get the reference of the contract
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const txResponse = await contract.withdraw()
            //listen for txt to be mined
            await listenForTransactionMine(txResponse, provider)
            console.log("Done")
            await getBalance()
        } catch (error) {
            console.error(error)
        }
    }
}

function listenForTransactionMine(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(txResponse.hash, (txReceipe) => {
            console.log(
                `Completed with ${txReceipe.confirmations} confirmations`
            )
            resolve()
        })
    })
}

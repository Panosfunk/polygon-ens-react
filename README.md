### Welcome 👋
The application represents a [DNS](https://en.wikipedia.org/wiki/Domain_Name_System) (Domain Name System) but built on the [Polygon](https://wiki.polygon.technology/) Blockchain. 

Instead of the classic DNS, this application is an ENS (Ethereum Name service). This means that every registered domain creates an NFT.

NFT's are immutable and can only belong to one person. That is you!

By registering the domain of your liking, (ending in .funk) you create an NFT that is stored on the Polygon blockchain. That is unique and immutable (meaning it cannot be changed), and gets assigned to your wallet's public address that you used to sign the trasaction (most likely MetaMask). 

If you do not have MetaMask it's no problem. As long as you have an Ethereum wallet you can use this app.

### What is polygon? (insert thinking emoji)

Put simply, Polygon is an Ethereum layer 2, which basically means that it works on Ethereum, but it packages `x` number of transactions and sends them as one big one instead of `x` smaller ones. That way instead of having `x * GAS_FEES` you have `1 * GAS_FEES`. Which is pretty nice if you ask me.

### **Questions?**

### How do I install MetaMask? (or another wallet)

[Boop](https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-started-with-MetaMask). Here you go.

After you install Metamask, make sure to add the Polygon mainnet and the Polygon Mumbai testnet networks to metamask. 

Scroll all the way to the bottom of [this](https://polygonscan.com/) page where you will find a button to add the Polygon Mainnet to Metamask.

You can do the same with [this](https://mumbai.polygonscan.com/) link to add the Mumbai Testnet.

### How do I use this app?

This application currently runs on the Mumbai test network of Polygon. What it means is that you do not need real money to buy real Polygon currency called MATIC. 

You can use [this](https://faucet.polygon.technology/) or [this](https://mumbaifaucet.com/) faucet to get some Mumbai MATIC tokens. 

It is required that you have some of those tokens, (0.5 is more than enough for one domain registration) first of all for fees, and for actually buying that domain.

Based on the size of the domain name, the price differs. Just like a classic dns. For names that are:

- 3 characters long the cost is 0.5 MATIC.
- 4 characters long the cost is 0.3 MATIC.
- more than 4 characters long the cost is 0.1 MATIC.

[Here](https://github.com/Panosfunk/polygon-ens/blob/c5a11358e1114e9df80a49d32458568240690ebd/contracts/Domains.sol#L81) is the link to the Solidity smart contract that is actually running behind the app. There you will find the prices.

### **NOTE** 

If you just minted an NTF and the link to opensea does not work, it could possibly be due to the fact that opensea takes a few minutes to detect recently minted NFT's. It's just the way it is unfortunately.
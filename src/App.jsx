import React, { useEffect, useState } from "react";
import './styles/App.css';
import {ethers} from "ethers";
const tld = '.funk';
const CONTRACT_ADDRESS = "0x0E32582b89cA401fEFe3536B81D8373f12a3dc45";

import contractAbi from './utils/contractABI.json';

import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';

import { Buffer } from 'buffer';
Buffer.from('anything','base64');
import axios from "axios";

const App = () => {

  const [currentAccount, setCurrentAccount] = useState('');
  const [domain, setDomain] = useState('');
	const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [record, setRecord] = useState('');
  const [network, setNetwork] = useState('');
  const [mints, setMints] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  const connectWallet = async() => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        console.log("U done something wacky with the wallet");
        return;
      } else {
        console.log("SHEEESH letsgo")
      }
  
      const accounts = await ethereum.request({ method: 'eth_requestAccounts'})

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const switchNetwork = async() => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain', 
          params: [{chainId: '0x13881'}],
        });
      } catch (error) {
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881',
                  chainName: 'Polygon Mumbai Testnet',
                  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                  nativeCurrency: {
                    name: "Mumbai Matic",
                    symbol: "MATIC",
                    decimals: 18
                  },
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      } 
    } else {
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  }
  
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Install metamask and GET TO THE CHOPPA");
      return;
    } else {
      console.log("We have an ethereum object", ethereum);
    }
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }
    
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    setNetwork(networks[chainId]);

    ethereum.on('chainChanged', handleChainChanged);
    ethereum.on('accountsChanged', handleChainChanged);
    ethereum.on('disconnect', handleChainChanged);

    function handleChainChanged(_chainId) {
      window.location.reload();
    }
  };

  const mintDomain = async () => {
    if (!domain) {
      console.log("Who domain bro")
      return;
    }
    if (domain.length < 3) {
      alert('Domain must be at least 3 characters long fam');
      return;
    }
    const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
    console.log("Minting domain", domain, "with price", price);
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let jsonBase64 = await contract.generateJsonData(domain);
        jsonBase64 = Buffer.from(jsonBase64, 'base64');
        let jsonToSend = JSON.parse(jsonBase64);

        var config = {
          method: 'post',
          url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
          headers: { 
            'Content-Type': 'application/json', 
            'pinata_api_key': '522dfe150059448afbff',
            'pinata_secret_api_key': 'af735d0314b111fa116a095f02e3c0b777cebf3bdc5595cbae567e79c7c9ac86',
          },
          data : 
          {
            "name": jsonToSend.name,
            "description": jsonToSend.description,
            "image": jsonToSend.image,
            "length": jsonToSend.length
          }
        };

        const res = await axios(config);
        const tokenURI = `ipfs://${res.data.IpfsHash}`;
        console.log("TokenURI: ", tokenURI);
        
        let nftTxn = await contract.register(tokenURI, domain, {value: ethers.utils.parseEther(price)});
        console.log("Mining...")
        const receipt = await nftTxn.wait();
        
        if (receipt.status === 1) {
          console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+nftTxn.hash);
          nftTxn = await contract.setRecord(domain, record);
          await nftTxn.wait();
          console.log("Record set! https://mumbai.polygonscan.com/tx/"+nftTxn.hash);

          setTimeout(() => {
            fetchMints();
          }, 2000);
          
          setRecord('');
          setDomain('');
        } else {
          alert('Transaction failed! well get them next time');
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updateDomain = async () => {
    if (!record || !domain) {
      return;
    }
    setLoading(true);
    console.log("Updating domain", domain, "with record", record);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

        let tx = await contract.setRecord(domain, record);
        await tx.wait();
        console.log("Record set https://mumbai.polygonscan.com/tx/" + tx.hash);

        fetchMints();
        setRecord('');
        setDomain('');
      }
    } catch (error) {
      console.log(error)
    }
    setLoading(false);
  }

  const fetchMints = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        console.log("FETCHing mints");
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
        const names = await contract.getAllNames();

        console.log("nbames i guess", names);
        const mintRecords = await Promise.all(names.map(async(name) => {
          console.log("name im looking for", name);
          const mintRecord = await contract.records(name);
          const owner = await contract.domains(name);
          
          console.log("current mintrecord-owner", mintRecord, "-", owner);
          return {
            id: names.indexOf(name),
            name: name,
            record: mintRecord,
            owner: owner,
          };
        }));

        console.log("MINTS FETCHED", mintRecords);
        setMints(mintRecords);
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <button className="cta-button connect-wallet-button" onClick={connectWallet}>
        Connect Wallet
      </button>
    </div>
  );

  const renderInputForm = () => {
    if (network !== 'Polygon Mumbai Testnet') {
      return (
        <div className="connect-wallet-container">
          <p>Please connect to the Polygon Mumbai Testnet</p>
          <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
        </div>
      );
    }
    return (
      <div className="form-container">
        <div className="first-row">
          <input type="text" value={domain} placaeholder="domain" onChange={e => setDomain(e.target.value)}/>
          <p className='tld'>{tld}</p>
        </div>
        <input type="text" value={record} placeholder='A lil description here' onChange={e => setRecord(e.target.value)}/>
        {editing ? (
          <div className="button-container">
            <button className="cta-button mint-button" disabled={loading} onClick={updateDomain}>
              Set description
            </button>
            <button className="cta-button mint-button" disabled={loading} onClick={() => {setEditing(false)}}>
                Cancel
            </button>
            
          </div>
        ) : (
          <button className="cta-button mint-button" disabled={null} onClick={mintDomain}>
            Mint
          </button>
        )}
      </div>
    )
  }

  const renderMints = () => {
    if (currentAccount && mints.length > 0) {
      return (
        <div className="mint-container">
          <p className='subtitle'>Recently Minted Domains</p>
          <div className="mint-list"> 
            {mints.map((mint, index) => {
              return (
                <div className="mint-item" key={index}>
                  <div className="mint-row">
                    <a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
                      <p className="underlined">{' '}{mint.name}{tld}{' '}</p>
                    </a>
                    {mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
                    
                      <button className="edit-button" onClick={() => editRecord(mint.name)}>
                        <img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
                      </button>
                      :
                      null
                    }
                  </div>
                  <p> {mint.record}</p>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }

  const renderWithdraw = () => {
    if (network !== 'Polygon Mumbai Testnet') {
      return (
        <div className="connect-wallet-container">
          <p>Please connect to the Polygon Mumbai Testnet</p>
          <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
        </div>
      );
    }
    return(
      <div className="form-container">
        <button className="cta-button mint-button" disabled={null} onClick={withdraw}>
          Withdraw
        </button>
      </div>
    )
  }
  
  const editRecord = (name) => {
    console.log("Editing record for", name);
    setEditing(true);
    setDomain(name);
  }

  const checkIfOwner = async() => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

        const checkedIfOwner = await contract.isOwner();
        console.log("IS the person watching this the owner?????", checkedIfOwner);
        if (checkedIfOwner) {
          setIsOwner(true);
          return;
        }else {
          setIsOwner(false);
          console.log("Please sign in as the owner to withdraw")
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const withdraw = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

        const wdTxn = await contract.withdraw();
        
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  });

  useEffect(() => {
    if (network === 'Polygon Mumbai Testnet') {
      fetchMints();
      checkIfOwner();
      // window.location.reload();
    }
  }, [currentAccount, network]);

  return (
		<div className="App">
			<div className="container">

				<div className="header-container">
					<header>
            <div className="left">
              <p className="title">FNS</p>
              <p className="subtitle">API on the bc!</p>
            </div>
            <div className="right">
              <img alt="logo" className="logo" src={network.includes("Polygon") ? polygonLogo : ethLogo} />
                {currentAccount ? <p>Wallet: {currentAccount.slice(0,6)}...{currentAccount.slice(-4)} </p> : <p>Not connected</p>}
            </div>
					</header>
				</div>

        {!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}
        {mints && renderMints()}
        {isOwner && renderWithdraw()}
        
        <div className="footer-container">
					
				</div>
			</div>
		</div>
	);
}

export default App;

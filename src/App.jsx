import React, { useEffect, useState } from "react";
import "./App.css";
import abi from "./utils/WavePortal.json"; 
import { ethers } from "ethers"; 


const App = () => {
  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]); 
  const [value, setValue] = useState(""); 
  const contractAddress = "0x82aB341f5280494EE531cA28a376E17c7cB328ce"; 
  const contractABI = abi.abi; 

  const getAllWaves = async () => {
    try {
      const { ethereum } = window; 
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum); 
        const signer = provider.getSigner(); 
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer); 

        const waves = await wavePortalContract.getAllWaves(); 

        let wavesCleaned = []; 
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 100),
            message: wave.message
          }); 
        }); 

        setAllWaves(wavesCleaned); 
      } else {
        console.log("Ethereum object doesn't exist."); 
      }
    } catch (error) {
      console.log(error); 
    }
  }
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves(); 
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window; 
      if (!ethereum) {
        alert("Get Metamask!"); 
        return; 
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"}); 
      console.log("Connected", accounts[0]);
      setCurrentAccounts(accounts[0]); 
    } catch (error) {
      console.log(error); 
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window; 

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner(); 
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer); 

        let count = await wavePortalContract.getTotalWaves(); 
        console.log("Retrieved total waves...", count); 

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(value); 
        setValue("");
        console.log("Mining...", waveTxn.hash); 

        await waveTxn.wait(); 
        console.log("Mined --", waveTxn.hash); 
        
        count = await wavePortalContract.getTotalWaves(); 
        console.log("Retrieved total wave count...", count.toNumber()); 
      } else {
        console.log("Ethereum object doesn't exist!"); 
      }
    } catch(error) {
      console.log(error); 
    } 
  }
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const onInputChange = event => {
    event.preventDefault(); 
    setValue(event.target.value); 
  }
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          I'm Emi, currently a CS Student at UChicago
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div>
          <input
              style={{ backgroundColor: "OldLace", 
                      marginTop: "16px", 
                      padding: "8px 170px", 
                      height: "10px", 
                      fontSize: "20px"
                     }}
              type="text"
              value={value}
              onChange={onInputChange}
           />
        </div>
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div>Address: {wave.address}</div> 
              <div>Time: {wave.timestamp.toString()}</div> 
              <div>Message: {wave.message}</div> 
            </div>)
        })}
      </div>
    </div>
  );
}

export default App
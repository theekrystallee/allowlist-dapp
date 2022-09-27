import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { ALLOWLIST_CONTRACT_ADDRESS, abi } from "../constants";
     
export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedAllowlist keeps track of whether the current metamask address has joined the Allowlist or not
  const [joinedAllowlist, setJoinedAllowlist] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // numberOfAllowlisted counts and tracks the number of addresses's allowlisted
  const [numberOfAllowlisted, setNumberOfAllowlisted] = useState(0);
  // create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - true if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // connect to Metamask
    // since we store `web3Modal` as a reference, we need to access the current value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // ff user is not connected to the Mumbai network, throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to MUMBAI");
      throw new error("Change network to MUMBAI!");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * addAddressToAllowlist: adds the current connected address to the allowlist
   */
  const addAddressToAllowlist = async () => {
    try {
      // we need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // create a new instance of the Contract with a Signer, which allows
      const AllowlistContract = new Contract(
        ALLOWLIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the addAddressToAllowlist from the contract
      const tx = await AllowlistContract.addAddressToAllowlist();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // get the updated number of addresses in the allowlist
      await getNumberOfAllowlisted();
      setJoinedAllowlist(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getNumberOfAllowlisted:  gets the count number of allowlisted addresses
   */
  const getNumberOfAllowlisted = async () => {
    try {
      // get the provider from web3Modal (MM)
      // no need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // we connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const AllowlistContract = new Contract(
        ALLOWLIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // calls the numAddressesAllowlisted from the contract
      const _numberOfAllowlisted = await allowlistContract.numAddressesAllowlisted();
      setNumberOfAllowlisted(_numberOfAllowlisted);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfAddressInAllowlist: checks if the address is in list of allowlisted addresses
   */
  const checkIfAddressInAllowlist = async () => {
    try {
      // we will need the signer later to get the user's address
      const signer = await getProviderOrSigner(true);
      const allowlistContract = new Contract(
        ALLOWLIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // get the address associated to the signer connected to MM
      const address = await signer.getAddress();
      // call the AllowlistedAddresses from the contract
      const _joinedAllowlist = await allowlistContract.allowlistedAddresses(
        address
      );
      setJoinedAllowlist(_joinedAllowlist);
    } catch (err) {
      console.error(err);
    }
  };

  /*
    connectWallet: connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // get the provider from web3Modal (MetaMask)
      // Wwhen used for the first time, it prompts the user to connect wallet
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInAllowlist();
      getNumberOfAllowlisted();
    } catch (err) {
      console.error(err);
    }
  };

  /*
    renderButton: returns state-based button
  */
  const renderButton = () => {
    if (walletConnected) {
      if (joinedAllowlist) {
        return (
          <div className={styles.description}>
            Thanks for joining the allowlist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToAllowlist} className={styles.button}>
            Join Allowlist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      );
    }
  };

  // useEffects are used to react to changes in state of the website
  // the array at the end of function call represents what state changes will trigger this effect
  // in this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // assign the Web3Modal class to the reference object by setting it's current value
      // current value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Allowlist DApp</title>
        <meta name="description" content="allowlist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Dev N Date!</h1>
          <div className={styles.description}>
            An NFT collection for developers interested in D_D dating show &#10084;
          </div>
          <div className={styles.description}>
            {numberOfAllowlisted} have already joined the DevDate allowlist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./dev-date.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by D_D
      </footer>
    </div>
  );
}
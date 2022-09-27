import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { ALLOWLIST_CONTRACT_ADDRESS, abi } from "../constants";
     
export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedAllowlist, setJoinedAllowlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfAllowlisted, setNumberOfAllowlisted] = useState(0);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

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

  const addAddressToAllowlist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const AllowlistContract = new Contract(
        ALLOWLIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await AllowlistContract.addAddressToAllowlist();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getNumberOfAllowlisted();
      setJoinedAllowlist(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getNumberOfAllowlisted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const AllowlistContract = new Contract(
        ALLOWLIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _numberOfAllowlisted = await allowlistContract.numAddressesAllowlisted();
      setNumberOfAllowlisted(_numberOfAllowlisted);
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfAddressInAllowlist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const allowlistContract = new Contract(
        ALLOWLIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress();
      const _joinedAllowlist = await allowlistContract.allowlistedAddresses(
        address
      );
      setJoinedAllowlist(_joinedAllowlist);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInAllowlist();
      getNumberOfAllowlisted();
    } catch (err) {
      console.error(err);
    }
  };

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

  useEffect(() => {
    if (!walletConnected) {
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
            An NFT collection for devs interested in the D_D dating show &#10084;
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
/***
 *
 * web3Context.js
 * Created By : Nishant
 *
 ***/

// Import required Modules
import React, { Component } from "react";
import Web3 from "web3";
import cogoToast from "cogo-toast";
import { AxiosInstance } from "../AxiosRequest";

// ABI File Location
const abi = require("../data/abi.json");

// Context to store the state of the application
export const WalletContext = React.createContext();

class WalletContextProvider extends Component {
  constructor(props) {
    super(props);

    // Initial state of the app.
    this.state = {
      data: null,
      contractAddress: "",
      accountBalance: 0,
      web3Provider: null,
      contract: null,
      accountId: null,
      balance: 0,
      act: false,
      bin: "",
      loading: false,
      error: null,
      buyLimit: 0,
      nftPrice: 0.5,
      totalSupply: 0,
      isPreSale: 1,
      isMainSale: false,
      max_nft: 5000,
      percentage: 0,
      amount: 1,
      isWhiteListed: true,
      isPausable: 1,
      isNonReentrant: 1,
      name: "Neon Codiste",
      symbol: "NEC",
      reserveNFT: 0,
      purchaseLimit: 1,
      mLimit: 5,
      pLimit: 4,
      claimable: 1,
      isPreSaleActive: false,
    };
  }

  async componentDidMount() {
    if (window.ethereum) {
      // Triggers when the chain is changed
      window.ethereum.on("chainChanged", function (networkId) {
        localStorage.setItem("MetaMask", "");
        window.location.reload(true);
      });

      // Triggers when the account is changed
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          this.connectWallet();
        } else {
          console.log("Account disconnected");
        }
      });
    }
    if (localStorage.getItem("MetaMask") === "true") {
      this.connectWallet();
    }
  }

  // Checks whether the component need re renders by checking the previous state and current state.
  shouldComponentUpdate(nextState) {
    return nextState !== this.state;
  }

  // Changes the presale status.
  changePreSaleStatus = async () => {
    const { contract, accountId } = this.state;
    const check = await contract.methods.isPreSaleActive().call();
    if (check) {
      await contract.methods.changePreSaleStatus(false).send({
        from: accountId,
      });

      this.setState({
        isPreSaleActive: false,
      });
      // To retrieve the current status of the connected account
      this.checkData();
    } else {
      await contract.methods.changePreSaleStatus(true).send({
        from: accountId,
      });
      await contract.methods.isPreSaleActive().call();
      this.setState({
        isPreSaleActive: true,
      });
      this.checkData();
    }
  };

  // Handles when the user clicks the checkbox
  handleCheckboxChange = (e) => {
    this.setState({ [e.target.name]: e.target.checked ? 1 : 0 });
  };

  // Handles when the user changes the input field (for text type)
  handleTextChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  // Handles when the user changes the input field (for number type)
  handleNumberChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value ? parseFloat(value) : 0 });
    // setMintingOptions((prevState) => ({...prevState, [name]: value ? parseFloat(value) : 0}));
  };

  // Sets the byte code after the code compiles
  setAbiAndBin = (BIN) => {
    this.setState({
      bin: BIN,
    });
    cogoToast.success("Compiled successfully");
  };

  // Sets the contract address after deployment
  setContractAddress = (address) => {
    this.setState({
      contractAddress: address,
    });

    this.connectContract();
  };

  // Connects to the wallet
  connectWallet = async () => {
    // Checks whether user has the metamask installed or not
    if (window.ethereum) {
      // Gets the web3 instance
      let web3 = new Web3(window.ethereum);
      try {
        // collects all the accounts
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const accountID = accounts[0];

        const networkId = await web3.eth.net.getId();

        // Checks the wallet is using the correct chain.
        if ([245022926].indexOf(networkId) !== -1) {
          const balance = await web3.eth.getBalance(accountID);
          const accountBalance = web3.utils.fromWei(balance, "ether");

          this.setState({
            accountBalance: parseFloat(accountBalance).toFixed(4),
          });
          localStorage.setItem("MetaMask", "true");
          web3.eth.defaultAccount = accounts[0];
          this.setState({
            web3Provider: web3,
            accountId: accountID,
          });
        } else {
          return cogoToast.error(
            "Please change your network to Neon Testnet"
          );
        }
      } catch (e) {
        console.log(e);
        cogoToast.error(e.message);
      }
    } else if (window.web3) {
      let web3 = new Web3(window.web3.currentProvider);
      this.setState({ web3Provider: web3 });
    } else {
      cogoToast.error("You have to install MetaMask !");
    }
  };

  // Connects to the contract in blockchain
  connectContract = async (_) => {
    const web3 = this.state.web3Provider;
    const { contractAddress } = this.state;
    const contract = await new web3.eth.Contract(abi, contractAddress);
    this.setState(
      {
        contract: contract,
      },
      async () => {
        if (this.state.isPreSale) {
          const check = await contract.methods.isPreSaleActive().call();
          if (check) {
            this.setState({
              isPreSaleActive: true,
            });
          } else {
            this.setState({
              isPreSaleActive: false,
            });
          }
        }
        this.checkData();
      }
    );
  };

  // To retrieve the current status of the connected account
  checkData = async () => {
    this.setState({ loading: true });
    const {
      contract,
      accountId,
      web3Provider: web3,
      max_nft,
      isPreSale,
      isPreSaleActive,
    } = this.state;

    let isMainSale = false;
    var mintValue = 0;

    // Retrieves the data if the user is whitelisted and the presale is active
    if (isPreSale && isPreSaleActive) {
      const data = await AxiosInstance.getRequest(`/address/${accountId}`);

      if (data && data.available) {
        const presaleClaimed = await contract.methods
          .presaleClaimed(accountId)
          .call();

        const presalePurchaseLimit = await contract.methods
          .PRESALE_PURCHASE_LIMIT()
          .call();

        mintValue = presalePurchaseLimit - parseInt(presaleClaimed);
        this.setState({ isWhiteListed: true });
      } else {
        this.setState({ isWhiteListed: false });
        cogoToast.error("You are not whitelisted.");
      }
    } else {
      const isMainSaleActive = await contract.methods.isMainSaleActive().call();
      if (isMainSaleActive) {
        const mainSaleClaimed = await contract.methods
          .mainSaleClaimed(accountId)
          .call();
        const mainsalePurchaseLimit = await contract.methods
          .MAINSALE_PURCHASE_LIMIT()
          .call();
        mintValue = mainsalePurchaseLimit - parseInt(mainSaleClaimed);
        isMainSale = true;
      }
    }

    const nftPrice = await contract.methods.NFT_PRICE().call();
    const nftPriceInEth = await web3.utils.fromWei(nftPrice, "ether");

    const totalSupply = await contract.methods.totalSupply().call();

    const progress = (totalSupply * 100) / max_nft;
    const progress2 = progress.toFixed(2);

    const balance = await web3.eth.getBalance(accountId);
    const accountBalance = await web3.utils.fromWei(balance, "ether");

    // sets the data of the connected user
    this.setState({
      buyLimit: mintValue,
      nftPrice: nftPriceInEth,
      totalSupply: totalSupply,
      percentage: progress2,
      isMainSale: isMainSale,
      amount: 1,
      accountBalance: parseFloat(accountBalance).toFixed(4),
      loading: false,
    });
  };

  mintNow = async () => {
    const {
      contract,
      accountId,
      web3Provider: web3,
      amount,
      nftPrice,
      isPreSale,
      buyLimit,
      isMainSale,
      isPreSaleActive,
    } = this.state;
    try {
      // returns when the wallet is not connected
      if (!contract) {
        return cogoToast.error("Please connect with wallet.");
      }

      // Returns when none of the sale is active
      if (!isMainSale && !isPreSale) {
        return cogoToast.error("Currently sale is inactive");
      }

      // Returns if the user is not whitelisted during presale
      if (!this.state.isWhiteListed) {
        return cogoToast.error("You are not whitelisted.");
      }

      // Returns when the user reaches to the max limit during presale
      if (buyLimit <= 0 && isPreSale) {
        return cogoToast.error("You have reached to max limit for Pre-sale.");
      }

      // Returns when the user reaches to the max limit during main sale
      if (buyLimit <= 0) {
        return cogoToast.error(
          "You have reached to max limit for Public-sale."
        );
      }

      // Mints during the presale
      if (isPreSale && isPreSaleActive) {
        if (this.state.isWhiteListed) {
          this.setState({ loading: true });

          await contract.methods.mintDuringPresale(amount).send({
            value: web3.utils.toWei((amount * nftPrice).toString(), "ether"),
            from: accountId,
          });
          cogoToast.success("NFT pruchased during presale");
          this.setState({ loading: false });
        } else {
          return cogoToast.error("You are not whitelisted.");
        }
      } else {
        // Mints during the main sale
        if (isMainSale) {
          this.setState({ loading: true });
          await contract.methods.mint(amount).send({
            value: web3.utils.toWei((amount * nftPrice).toString(), "ether"),
            from: accountId,
          });
          cogoToast.success("NFT pruchased during mainsale");
          this.setState({ loading: false });
        }
      }

      this.checkData();
      console.log("Transaction successful");
      cogoToast.success("Transaction successful");
    } catch (error) {
      this.setState({ loading: false });
      cogoToast.error(error.message);
    }
  };

  // Adds the amount by 1 on UI if eligible.
  handlePlus = () => {
    if (this.state.amount + 1 > this.state.buyLimit) return;
    this.setState((prevState) => ({
      amount: prevState.amount + 1,
    }));
  };

  // Subtracts the amount by 1 on UI if eligible.
  handleMinus = () => {
    if (this.state.amount > 1) {
      this.setState((prevState) => ({
        amount: prevState.amount - 1,
      }));
    }
  };

  // Gives the balance of tokens pruchased
  getBalance = async () => {
    const { nftContract, accountId } = this.state;
    let balance = 0;
    if (nftContract && accountId) {
      balance = await nftContract.methods.balanceOf(accountId).call();
    }
    this.setState({ balance });
  };

  render() {
    const { children } = this.props;
    return (
      <WalletContext.Provider
        value={{
          ...this.state,
          connectWallet: this.connectWallet,
          getBalance: this.getBalance,
          setAbiAndBin: this.setAbiAndBin,
          setContractAddress: this.setContractAddress,
          mintNow: this.mintNow,
          handlePlus: this.handlePlus,
          handleMinus: this.handleMinus,
          setPreSale: this.setPreSale,
          handleCheckboxChange: this.handleCheckboxChange,
          handleTextChange: this.handleTextChange,
          handleNumberChange: this.handleNumberChange,
          changePreSaleStatus: this.changePreSaleStatus,
        }}
      >
        {children}
      </WalletContext.Provider>
    );
  }
}

export default WalletContextProvider;

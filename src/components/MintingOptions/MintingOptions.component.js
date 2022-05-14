/***
 *
 * MintingOptions.js
 * Created By : Nishant
 *
 ***/

// Import required Modules
import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../../context/web3.context";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton.component";
import DeployContract from "../Deploy-contract/Deploy-contract.component";
import MintingPage from "../MintingPage/MintingPage.component";
import "./MintingOptions.styles.css";

const contractAddress = "0xFec050B5DF1C1C2BA11Fb5C2E3579510228FE2D7";

function MintingOptions() {
  // Gets the required data from the Wallet context.
  const {
    setAbiAndBin,
    web3Provider,
    contract,
    isPreSale,
    // contractAddress,
    handleCheckboxChange,
    handleTextChange,
    handleNumberChange,
    changePreSaleStatus,
    isPausable,
    isNonReentrant,
    name,
    symbol,
    purchaseLimit,
    claimable,
    reserveNFT,
    max_nft,
    nftPrice,
    mLimit,
    pLimit,
    isPreSaleActive,
  } = useContext(WalletContext);

  const [contractData, setContractData] = useState("");

  // Sets all the data entered by user.
  const data = {
    isPausable: isPausable,
    isNonReentrant: isNonReentrant,
    name: name,
    symbol: symbol,
    maxNFT: max_nft,
    reserveNFT: reserveNFT,
    price: nftPrice,
    purchaseLimit: purchaseLimit,
    mLimit: mLimit,
    pLimit: pLimit,
    claimable: claimable,
    isPresale: isPreSale,
  };

  // Event Listener for change in contract
  const handleContractChange = (e) => {
    setContractData(e.target.value);
  };

  const url = "http://54.145.65.218:8000";

  // Compiles the smart contract and sets bytecode in context.
  const compileContract = () => {
    fetch(`${url}/compile`, {
      method: "POST",
      body: JSON.stringify({ contract: contractData }),
      headers: { "Content-type": "application/json" },
    })
      .then((res) => res.json())
      .then((json) => {
        const str = data.name.replace(/\s/g, "");
        const bin = json.data[`<stdin>:${str}`]["bin"];
        setAbiAndBin(bin);
      })
      .catch((error) => console.log("error = ", error));
  };

  // Fires when parameters changes and fetch the contract accordingly in text form
  useEffect(() => {
    const fetchContract = () => {
      console.log("contract fetching...");

      fetch(`${url}/getContract`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(data),
        headers: { "Content-type": "application/json" },
      })
        .then((response) => response.json())
        .then((json) => {
          setContractData(json.data.contract);
        });
    };
    fetchContract();
  }, [data]);

  // All the inputs needed to compile and deploy
  return (
    <>
      <div className="container minting-form">
        <div className="row" style={{ width: "100%" }}>
          <div className="col-md-6">
            <div className="minting-options child">
              <label htmlFor="isPausable">isPausable</label>
              <input
                type="checkbox"
                id="isPausable"
                name="isPausable"
                onChange={handleCheckboxChange}
                checked={isPausable}
              />
              <br />
              <label htmlFor="isNonReentrant">isNonReentrant</label>
              <input
                type="checkbox"
                name="isNonReentrant"
                id="isNonReentrant"
                onChange={handleCheckboxChange}
                checked={isNonReentrant}
              />
              <br />
              <label htmlFor="name">name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={handleTextChange}
              />
              <br />
              <label htmlFor="symbol">symbol</label>
              <input
                type="text"
                name="symbol"
                id="symbol"
                value={symbol}
                onChange={handleTextChange}
              />
              <br />
              <label htmlFor="max_nft">maxNFT</label>
              <input
                type="number"
                name="max_nft"
                id="max_nft"
                value={max_nft}
                onChange={handleNumberChange}
              />
              <br />
              <label htmlFor="reserveNFT">reserveNFT</label>
              <input
                type="number"
                name="reserveNFT"
                id="reserveNFT"
                value={reserveNFT}
                onChange={handleNumberChange}
              />
              <br />
              <label htmlFor="nftPrice">price</label>
              <input
                type="number"
                name="nftPrice"
                id="nftPrice"
                value={nftPrice}
                onChange={handleNumberChange}
              />
              <br />
              <label htmlFor="purchaseLimit">purchaseLimit</label>
              <input
                type="checkbox"
                name="purchaseLimit"
                id="purchaseLimit"
                onChange={handleCheckboxChange}
                checked={purchaseLimit}
              />
              <br />
              <label htmlFor="mLimit">mLimit</label>
              <input
                type="number"
                name="mLimit"
                id="mLimit"
                value={mLimit}
                onChange={handleNumberChange}
                disabled={!purchaseLimit}
              />
              <br />
              <label htmlFor="pLimit">pLimit</label>
              <input
                type="number"
                name="pLimit"
                id="pLimit"
                value={pLimit}
                onChange={handleNumberChange}
                disabled={!purchaseLimit}
              />
              <br />
              <label htmlFor="claimable">claimable</label>
              <input
                type="checkbox"
                name="claimable"
                id="claimable"
                onChange={handleCheckboxChange}
                checked={claimable}
              />
              <br />
              <label htmlFor="isPreSale">isPreSale</label>
              <input
                type="checkbox"
                name="isPreSale"
                id="isPreSale"
                onChange={handleCheckboxChange}
                checked={isPreSale}
              />
            </div>
          </div>

          <div className="col-md-6" style={{position: 'relative'}}>
            <div className="container code-display child">
              <textarea
                className="display-contract"
                value={contractData}
                onChange={handleContractChange}
              ></textarea>

              <div className="row" style={{position: 'absolute', bottom: '0'}} >
                <div className="col-md-4">
                  <div className="custom-button">
                  <button
                    type="button"
                    className="compile-contract btn btn-primary"
                    onClick={compileContract}
                  >
                    Compile
                  </button>
                </div>
                </div>

                <div className="col-md-4">
                  {web3Provider ? (
                    <div style={{color: 'white'}}>
                      {" "}
                      <DeployContract /> {contractAddress}{" "}
                    </div>
                  ) : (
                    <ConnectWalletButton />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row" style={{width: '100%'}}>
          <div className="col-md-6 justify-content-center">
            {contractAddress ? <MintingPage /> : null}
          </div>
        </div>

          {/* {isPreSale && contract ? ( */}
          <div className="presale">
          {true && true ? (
            <button type="button" className="btn btn-primary" onClick={changePreSaleStatus}>
              {" "}
              {/* {isPreSaleActive ? "Deactivate Presale" : "Activate Presale"} */}
              {false ? "Deactivate Presale" : "Activate Presale"}
            </button>
          ) : null}
          </div>
      </div>
    </>
  );
}

export default MintingOptions;

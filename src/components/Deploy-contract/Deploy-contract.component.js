/***
 *
 * Deploy-contract.js
 * Created By : Nishant
 *
 ***/

// Import required Modules
import React, { useContext } from "react";
import { WalletContext } from "../../context/web3.context";

const DeployContract = (props) => {
  // Gets the required data from the Wallet context.
  const {
    web3Provider: web3,
    accountId,
    bin,
    setContractAddress,
  } = useContext(WalletContext);

  // ABI File Location
  const abi = require("../../data/abi.json");

  // Get the contract instance to interact with the contract on blockchain
  let deploy_contract = new web3.eth.Contract(abi);

  // payload to be passed during deploy
  let payload = {
    arguments: [],
    data: bin.toString(),
  };

  // parameters to be passed during deploy
  let parameter = {
    from: accountId,
  };

  // Deploys the contract on click
  const handleClick = async () => {
    deploy_contract
      .deploy(payload)
      .send(parameter, (err, transactionHash) => {
        console.log("err", err, "Transaction Hash :", transactionHash);
      })
      .on("confirmation", () => {})
      .then((newContractInstance) => {
        console.log(
          "Deployed Contract Address : ",
          newContractInstance.options.address
        );
        setContractAddress(newContractInstance.options.address);
      });
  };

  return (
  <div className="custom-button">
    <button className="btn btn-primary" onClick={handleClick}>Deploy Contract</button>
  </div>
  );
};

export default React.memo(DeployContract);

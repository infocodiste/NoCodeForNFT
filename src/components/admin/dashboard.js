/***
 *
 * Dashboard.js
 * Created By : Nishant
 *
 ***/

// Import required Modules
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import cogoToast from "cogo-toast";
import { AxiosInstance } from "../../AxiosRequest";
import { useContext, useEffect, useState } from "react";
import { WalletContext } from "../../context/web3.context";

const schema = Yup.object().shape({
  address: Yup.string().required("Addresses is required"),
});

// ABI File Location
const abi = require("../../data/abi.json");

const Dashboard = () => {
  const history = useHistory();
  const { web3Provider, accountId, connectWallet } = useContext(WalletContext);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [blindUrl, setBlindUrl] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [reserveNftUrl, setReserveNftUrl] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [isReserveNft, setIsReserveNft] = useState(false);
  const [isPresaleSupport, setIsPresaleSupport] = useState(false);
  const [showUrl, setShowUrl] = useState("");
  const [reveal, setReveal] = useState(false);
  const [publicTotalSupply, setPublicTotalSupply] = useState(0);
  const [balance, setBalance] = useState("");

  // Logout Functionality for Admin
  const logout = () => {
    localStorage.removeItem("token");
    history.push("/admin");
  };

  // Called when the user submits the contract address
  const handleContractAddress = async (e) => {
    const getContractAddress = document.getElementById("contractAddress").value;
    setContractAddress(getContractAddress);

    if (getContractAddress) {
      try {
        // Get the contract instance to interact with the contract on blockchain
        const contractInstance = await new web3Provider.eth.Contract(
          abi,
          getContractAddress
        );
        setContract(contractInstance);

        const par = await contractInstance.methods.par().call();

        const checkReserveNft = parseInt(par.reserveNFT) ? true : false;
        setIsReserveNft(checkReserveNft);

        const support = await contractInstance.methods.presaleSupport().call();
        support ? setIsPresaleSupport(true) : setIsPresaleSupport(false);

        const revealStatus = await contractInstance.methods.reveal().call();
        setReveal(revealStatus);

        const publicValue = await contractInstance.methods.totalSupply().call();
        setPublicTotalSupply(publicValue);

        let getBalance = await web3Provider.eth.getBalance(getContractAddress);
        getBalance = await web3Provider.utils.fromWei(getBalance, "ether");
        setBalance(getBalance);
      } catch (error) {
        console.log("error = ", error);
      }
    }
  };

  // Handles when the user changes the input field
  const handleAddressChange = (e) => {
    setAddress(e.target.value.replaceAll(" ", ""));
  };

  // Handles when the user changes the input field
  const handleAmountChange = (e) => {
    setAmount(e.target.value.replaceAll(" ", ""));
  };

  // Withdraws the ethers from the contract. Can also send the ethers to the specified addresses.
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const addresses = address.split(",");
    const amounts = amount.split(",");

    // Checks whether th user has entered the equal number of addresses and amounts.
    if (addresses.length !== amounts.length) {
      return cogoToast.error(
        "Please enter the equal number of addresses and amounts"
      );
    }

    // Validates the amount entered and converts it into Wei
    for (let i = 0; i < amounts.length; i++) {
      let amountValue = amounts[i];
      if (isNaN(parseFloat(amountValue)))
        return cogoToast.error("Please enter the valid amount");
      amounts[i] = web3Provider.utils.toWei(amountValue, "ether");
    }

    await contract.methods.withdraw([...addresses], [...amounts]).send({
      from: accountId,
    });

    let getBalance = await web3Provider.eth.getBalance(contractAddress);
    getBalance = await web3Provider.utils.fromWei(getBalance, "ether");
    setBalance(getBalance);
  };

  // Handles when the user changes the input field
  const handleBlindChange = (e) => {
    setBlindUrl(e.target.value);
  };

  // Handles when the user changes the input field
  const handleBaseUrlChange = (e) => {
    setBaseUrl(e.target.value);
  };

  // Handles when the user changes the input field
  const handlereserveUrlChange = (e) => {
    setReserveNftUrl(e.target.value);
  };

  // Sets the base URI, Blind URI and reserver URI
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (isReserveNft) {
      await contract.methods.setURIs(blindUrl, baseUrl, reserveNftUrl).send({
        from: accountId,
      });
    } else {
      await contract.methods.setURIs(blindUrl, baseUrl, "").send({
        from: accountId,
      });
    }
  };

  // Get the URI from contract
  const handleGetUri = async (e) => {
    e.preventDefault();
    const uri = await contract.methods
      .tokenURI(parseInt(e.target.getUri.value))
      .call();

    setShowUrl(uri.replace("ipfs://", "https://ipfs.io/ipfs/"));
  };

  // Changes the reveal status
  const handleReveal = async () => {
    const revealStatus = await contract.methods
      .changeRevealStatus(!reveal)
      .send({
        from: accountId,
      });

    if (revealStatus.status) {
      setReveal(!reveal);
    }
  };

  // Retrieves the total supply from the contract.
  const handlePublicTotalSupply = async () => {
    const publicValue = await contract.methods.totalSupply().call();
    setPublicTotalSupply(publicValue);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) history.push("/admin");
  }, []);

  return (
    <>
      {
        // shows connect wallet button if user is not connected to the wallet
        // else shows the input field for contract address
      }
      {!web3Provider ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "125px",
          }}
        >
          <button
            className="btn btn-block btn-primary btn-lg font-weight-medium my-3"
            type="button"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        </div>
      ) : !contractAddress ? (
        <div className="container pt-5">
          <div
            className="row justify-content-center mt-5 pt-5"
            style={{ width: "100%" }}
          >
            <div className="col-md-6 text-right">
              <input
                type="text"
                className="form-control form-control-lg border-left-0 my-3 mt-5"
                id="contractAddress"
                placeholder="Contract Address"
                name="contractAddress"
                required
              />
              <button
                className="btn btn-block btn-primary btn-lg font-weight-medium my-3"
                type="button"
                onClick={handleContractAddress}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {
            // If contract address is valid then the page shows the different forms like withdraw, setUri, getUri, Reveal status etc.
          }
          <div className="container pt-5">
            <div
              className="row justify-content-center mt-5 pt-5"
              style={{ width: "100%" }}
            >
              <div className="col-md-6 text-right">
                <button
                  className="btn btn-danger float-end"
                  onClick={() => logout()}
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
          {isPresaleSupport && (
            <div className="container pt-5">
              {
                // <div className="row justify-content-center mt-5 pt-5" style={{width: "100%"}}>
                //   <div className="col-md-6 text-right">
                //     <button className="btn btn-danger float-end" onClick={() => logout()}>
                //       Log Out
                //     </button>
                //   </div>
                // </div>
              }
              <div
                className="row justify-content-center"
                style={{ width: "100%" }}
              >
                <div className="col-md-6">
                  <Formik
                    initialValues={{
                      address: "",
                    }}
                    enableReinitialize={true}
                    validationSchema={schema}
                    onSubmit={async (
                      values,
                      { setErrors, setSubmitting, resetForm }
                    ) => {
                      try {
                        const data = await AxiosInstance.postPostRequest(
                          "/address",
                          values,
                          "post"
                        );
                        cogoToast.success(data.message);
                        setSubmitting(false);
                        resetForm();
                      } catch (error) {
                        if (error.login) {
                          localStorage.removeItem("token");
                          return history.push("/admin");
                        }
                        setErrors({
                          address: "Something went wrong.",
                        });
                        setSubmitting(false);
                      }
                    }}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      isSubmitting,
                    }) => (
                      <Form className="pt-3">
                        <div className="form-group">
                          <label>
                            Whitelist Addresses (Put all addresses with comma
                            separated)
                          </label>
                          <div className="input-group">
                            <textarea
                              type="text"
                              className="form-control form-control-lg border-left-0"
                              placeholder="Whitelist Addresses"
                              name="address"
                              value={values.address}
                              onChange={handleChange}
                            ></textarea>
                            {errors.address && touched.address ? (
                              <div className="invalid-feedback d-block">
                                {errors.address}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="my-3">
                          <button
                            disabled={isSubmitting}
                            className="btn btn-block btn-primary btn-lg font-weight-medium"
                            type="submit"
                          >
                            Submit
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          )}
          {web3Provider && (
            <div className="container" onSubmit={handleUrlSubmit}>
              <div
                className="row justify-content-center"
                style={{ width: "100%" }}
              >
                <div className="col-md-6">
                  <h3
                    className="mt-5"
                    style={{ color: "Black", marginBottom: "-20px" }}
                  >
                    URL
                  </h3>
                  <form>
                    <input
                      type="url"
                      className="form-control form-control-lg border-left-0 my-3 mt-5"
                      placeholder="Blind URL"
                      name="blind"
                      value={blindUrl}
                      onChange={handleBlindChange}
                      required
                    ></input>
                    <input
                      type="url"
                      className="form-control form-control-lg border-left-0"
                      placeholder="Base URL"
                      name="baseUrl"
                      value={baseUrl}
                      onChange={handleBaseUrlChange}
                      required
                    ></input>

                    {isReserveNft && (
                      <input
                        type="url"
                        className="form-control form-control-lg border-left-0 my-3"
                        placeholder="Reserve NFT URL"
                        name="reserverNftUrl"
                        value={reserveNftUrl}
                        onChange={handlereserveUrlChange}
                        required
                      ></input>
                    )}
                    <button
                      // disabled={isSubmitting}
                      className="btn btn-block btn-primary btn-lg font-weight-medium my-3"
                      type="submit"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
          {web3Provider && (
            <div className="container" onSubmit={handleWithdraw}>
              <div
                className="row justify-content-center"
                style={{ width: "100%" }}
              >
                <div className="col-md-6">
                  <h3
                    className="mt-5"
                    style={{ color: "Black", marginBottom: "-20px" }}
                  >
                    Withdraw
                  </h3>
                  <form>
                    <textarea
                      type="text"
                      className="form-control form-control-lg border-left-0 my-5"
                      placeholder="Addresses"
                      name="address"
                      value={address}
                      onChange={handleAddressChange}
                      required
                    ></textarea>
                    <textarea
                      type="text"
                      className="form-control form-control-lg border-left-0"
                      placeholder="Amounts"
                      name="amount"
                      value={amount}
                      onChange={handleAmountChange}
                      required
                    ></textarea>
                    <button
                      className="btn btn-block btn-primary btn-lg font-weight-medium my-3"
                      type="submit"
                    >
                      Submit
                    </button>
                    <p
                      style={{
                        display: "inline-block",
                        marginLeft: "25px",
                        fontSize: "25px",
                      }}
                    >
                      Current Balance: {balance} ether
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}

          {web3Provider && (
            <div className="container" onSubmit={handleGetUri}>
              <div
                className="row justify-content-center"
                style={{ width: "100%" }}
              >
                <div className="col-md-6">
                  <h3
                    className="mt-5"
                    style={{ color: "Black", marginBottom: "-20px" }}
                  >
                    Get Uri
                  </h3>
                  {
                    <p style={{ marginTop: "24px", marginBottom: "-35px" }}>
                      {" "}
                      {showUrl}{" "}
                    </p>
                  }
                  <form>
                    <input
                      id="getUri"
                      type="number"
                      className="form-control form-control-lg border-left-0 my-5"
                      placeholder="Token Number"
                      name="getUri"
                      required
                    ></input>

                    <button
                      className="btn btn-block btn-primary btn-lg font-weight-medium my-3"
                      type="submit"
                    >
                      Submit
                    </button>
                  </form>

                  <button
                    className="btn btn-block btn-primary btn-lg font-weight-medium my-3"
                    type="button"
                    onClick={handleReveal}
                    style={{ display: "block" }}
                  >
                    {!reveal ? "Reveal" : "Unreveal"}
                  </button>

                  <button
                    className="btn btn-block btn-primary btn-lg font-weight-medium my-3"
                    type="button"
                    onClick={handlePublicTotalSupply}
                  >
                    Public Token Supply
                  </button>
                  <p
                    style={{
                      display: "inline-block",
                      marginLeft: "25px",
                      fontSize: "25px",
                    }}
                  >
                    {publicTotalSupply ? publicTotalSupply : null}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Dashboard;

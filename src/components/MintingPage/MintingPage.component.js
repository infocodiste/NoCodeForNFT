/***
 *
 * MintingPage.js
 * Created By : Nishant
 *
 ***/

// Import required Modules
import React, { useContext } from 'react'
import { WalletContext } from '../../context/web3.context';
import './MintingPage.styles.css';

function MintingPage() {

    // Gets the required data from the Wallet context.
    const {handleMinus, handlePlus, amount, mintNow} = useContext(WalletContext);

    return (
        <div className="check-footer">
                <form id="myform" method="POST" className="quantity" action="#">
                    <button type="button" className="qty-button minus" field="quantity" onClick={handleMinus}><i className="fa-solid fa-minus">&minus;</i></button>
                    <input type="number" name="quantity" value={amount} className="qty" readOnly />
                    <button type="button" className="qty-button plus" field="quantity" onClick={handlePlus}><i className="fa-solid fa-plus">&#43;</i></button>
                </form>

                <div className="wallet_btn">    
                    <button className='btn btn-primary' style={{marginLeft: '-33px'}} onClick={mintNow}> Buy </button>
                </div>
        </div>
    )
}

export default MintingPage;
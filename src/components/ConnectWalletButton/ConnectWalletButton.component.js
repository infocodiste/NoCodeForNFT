/***
 *
 * ConnectWalletButton.js
 * Created By : Nishant
 *
 ***/

// Import required Modules
import React, { useContext } from 'react'
import { WalletContext } from '../../context/web3.context'
import './ConnectWalletButton.styles.css'

// Can be used whenever want to connect to the wallet
const ConnectWalletButton = () => {
    const {connectWallet} = useContext(WalletContext);
    return (
        <div className='custom-button'>
            <button className='btn btn-primary' onClick={connectWallet}>Connect Wallet</button>
        </div>
    )
}

export default ConnectWalletButton;
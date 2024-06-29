'use client';

import Title from './higerOrderComponents/titlesAndHeaders';
import { useSelector } from 'react-redux';

function Swap(props) {
  const isDark = useSelector((state) => state.theme.isDark);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const accoundID = useSelector((state) => state.wallet.items.accountID);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const assets = useSelector((state) => state.wallet.items.assets);
  const totalBalance = useSelector((state) => state.wallet.items.totalBalance);
  const loader = useSelector((state) => state.wallet.items.loader);
  return (
    <div className="swap">
      <Title title="Swap with best routes">
        {isWalletConnected && (
          <div className="wallet__totlaBalance">
            {/* <p className="balance__title">Balance on {findNetworkConfig(chainId).networkName}:</p> */}
            {/* <p className="balance__dolarAmount">∼${formatSignificantNumber(assets?.total_wallet_balance)}</p> */}
          </div>
        )}
      </Title>
      <div className="swap__container">
        <div className="swap__config">
          <div className="fromtoContainer">
            <div className="tokenContainer from">
              <span>From</span>
              <div className="token">
                <img src="/ckBTC.png" alt="" />
                <div className="tokenDetails">
                  <h3>ICP</h3>
                  <p>internet computer</p>
                </div>
              </div>
            </div>
            <div className="arrow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </svg>
            </div>
            <div className="tokenContainer to">
              <span>To</span>
              <div className="token">
                <img src="/ckBTC.png" alt="" />
                <div className="tokenDetails">
                  <h3>ckUSDC</h3>
                  <p>Bitcoin</p>
                </div>
              </div>
            </div>
          </div>
          <div className="amountContainer">
            <span>Amount</span>
            <div className="details">
              <img src="/ckBTC.png" className="tokenLogo" alt="" />

              <div className="input_container">
                <input type="number" placeholder="Please enter the amount" />
                <p className="usdPrice">$22</p>
              </div>
            </div>
          </div>
          <button className='swap_btn'>Start Swapping</button>
        </div>
        <div className="swap__routes"></div>
      </div>
    </div>
  );
}

export default Swap;


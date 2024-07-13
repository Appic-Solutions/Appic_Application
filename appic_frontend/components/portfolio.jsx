'use client';
import { formatAccountId, formatAddress } from '@/helper/helperFunc';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import { useDispatch, useSelector } from 'react-redux';
import { useState, React } from 'react';
import { useRouter } from 'next/navigation';
import WalletNotConnected from './walletNotConnectd';
import { formatDecimalValue, formatSignificantNumber } from '@/helper/number_formatter';
import canistersIDs from '@/config/canistersIDs';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import { resetWallet } from '@/redux/features/walletSlice';

function Portfolio() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();
  const handleDisconnect = async () => {
    dispatch(resetWallet());
  };
  // artemisWalletAdapter

  const isDark = useSelector((state) => state.theme.isDark);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const accoundID = useSelector((state) => state.wallet.items.accountID);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const assets = useSelector((state) => state.wallet.items.assets);
  const totalBalance = useSelector((state) => state.wallet.items.totalBalance);

  // Helper Functions
  const GetICPBalance = () => {
    const balances = {
      usdBalance: 0,
      balance: 0,
    };
    const icpToken = assets.find((token) => token.id == canistersIDs.NNS_ICP_LEDGER);
    if (icpToken) {
      balances.usdBalance = formatDecimalValue(icpToken.usdBalance, 2);
      balances.balance = formatSignificantNumber(Number(icpToken.balance) / 10 ** 8);
    }
    return balances;
  };

  return (
    <div className={darkModeClassnamegenerator('portfolio')}>
      {isWalletConnected ? (
        <div className="portfolio__box">
          {/* <img
            src="/refreshButton.svg"
            //  onClick={refreshUserAssets}
            className="refreshButton"
            alt=""
          /> */}
          <div className="collapseContainer">
            <div className="addressActions">
              <div className="avatarImage"></div>
              <div className="addressContainer">
                <div className="addressWithCopy">
                  <h1 className="address">
                    <span>Principal ID:</span> {formatAddress(principalID)}
                  </h1>
                  <div className="copyAddress">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbUlEQVR4nGNgGDagxXa+d7Ptwictdgv/k4MZCFuw4DG5hrcQZQGxCskFdLeghdw4sQUF9QJPIiygKE4eEbaAzCBrwaVv1AIYGA0igmA0iAgCmpeuLYPHAlsqF3boAFTkkmnJo2b7+R4YBg5ZAADgA5UsbuklBAAAAABJRU5ErkJggg==" />
                  </div>
                </div>
                <div className="addressWithCopy">
                  <h1 className="address">
                    <span>Accound ID:</span> {formatAccountId(accoundID)}
                  </h1>
                  <div className="copyAddress">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbUlEQVR4nGNgGDagxXa+d7Ptwictdgv/k4MZCFuw4DG5hrcQZQGxCskFdLeghdw4sQUF9QJPIiygKE4eEbaAzCBrwaVv1AIYGA0igmA0iAgCmpeuLYPHAlsqF3boAFTkkmnJo2b7+R4YBg5ZAADgA5UsbuklBAAAAABJRU5ErkJggg==" />
                  </div>
                </div>
              </div>
            </div>

            <div className="titleContainer">
              <div className="description">
                <p>Total Balance</p>
              </div>
              <div className="balance">
                <span>$</span>
                <h1>{formatSignificantNumber(totalBalance)}</h1>
              </div>
            </div>
            <div className="titleContainer">
              <div className="description">
                <p>ICP Balance</p>
                <img className="chainIMG" src="https://cdn.sonic.ooo/icons/ryjl3-tyaaa-aaaaa-aaaba-cai" alt="" />
              </div>

              <div className="balance">
                <h1>{GetICPBalance().balance}</h1>
              </div>
            </div>
            <div className="titleContainer">
              <div className="description">
                <p>ICP USD Balance</p>
                <img className="chainIMG" src="https://cdn.sonic.ooo/icons/ryjl3-tyaaa-aaaaa-aaaba-cai" alt="" />
              </div>

              <div className="balance">
                <span>$</span>
                <h1>{GetICPBalance().usdBalance}</h1>
              </div>
            </div>
            <div onClick={handleDisconnect} className="disconnect__container">
              <div className="disconnetc">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z" />
                </svg>
              </div>
              <p>Disconnect Wallet</p>
            </div>
            <div className="chartContainer"></div>
          </div>

          {/* Upper container */}
        </div>
      ) : (
        <WalletNotConnected />
      )}
    </div>
  );
}

export default Portfolio;


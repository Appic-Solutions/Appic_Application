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
            <div onClick={handleDisconnect} className="disconnect__container">
              <div className="disconnetc">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                  <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L489.3 358.2l90.5-90.5c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114l-96 96-31.9-25C430.9 239.6 420.1 175.1 377 132c-52.2-52.3-134.5-56.2-191.3-11.7L38.8 5.1zM239 162c30.1-14.9 67.7-9.9 92.8 15.3c20 20 27.5 48.3 21.7 74.5L239 162zM116.6 187.9L60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5l61.8-61.8-50.6-39.9zM220.9 270c-2.1 39.8 12.2 80.1 42.2 110c38.9 38.9 94.4 51 143.6 36.3L220.9 270z" />
                </svg>
              </div>
              <p>Disconnect Wallet</p>
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


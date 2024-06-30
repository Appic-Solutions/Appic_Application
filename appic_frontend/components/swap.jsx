'use client';

import { useState } from 'react';
import Title from './higerOrderComponents/titlesAndHeaders';
import { useSelector } from 'react-redux';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import Modal from './higerOrderComponents/modal';
import { applyDecimals, formatDecimalValue, formatPrice, formatSignificantNumber } from '@/helper/number_formatter';
import BigNumber from 'bignumber.js';

function Swap(props) {
  const [tokenModal, setTokenModal] = useState({ isActive: false, modalType: 'sell', tokens: [] }); // modalType: buy, sell
  const [swapData, setSwapData] = useState({
    sellToken: null,
    buyToken: null,
    sellTokenBalance: null,
    amountToSell: null,
  });
  const [tokenContractToShow, setTokenContractToShow] = useState('');

  const isDark = useSelector((state) => state.theme.isDark);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const accoundID = useSelector((state) => state.wallet.items.accountID);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const assets = useSelector((state) => state.wallet.items.assets);
  const totalBalance = useSelector((state) => state.wallet.items.totalBalance);
  const loader = useSelector((state) => state.wallet.items.loader);
  const supportedTokens = useSelector((state) => state.supportedTokens.tokens);

  const sortTokensByPrice = () => {
    return [...supportedTokens].sort((a, b) => Number(b.price) - Number(a.price));
  };

  function searchinput(tokens, query) {
    console.log(tokens);
    // Convert the query to lowercase for case-insensitive search
    const lowercaseQuery = query.toLowerCase();

    let filteredtokens = tokens.filter((token) => {
      // Combine symbol and name for searching (optional: adjust based on your data structure)
      const searchText = `${token.symbol.toLowerCase()} ${token.name.toLowerCase()}`;
      return searchText.includes(lowercaseQuery);
    });

    return filteredtokens.sort((a, b) => Number(b.price) - Number(a.price));
  }

  return (
    <>
      <div className={darkModeClassnamegenerator('swap')}>
        <div className="swap__container">
          <div className="swap__config">
            <h2 className="title">Swap</h2>
            <div className="fromtoContainer">
              <div
                onClick={() => {
                  setTokenModal({ isActive: true, modalType: 'sell', tokens: assets });
                }}
                className="tokenContainer from"
              >
                <span>From</span>
                <div className="token">
                  <img src="/ckBTC.png" alt="" />
                  <div className="z">
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
              <div
                onClick={() => {
                  setTokenModal({ isActive: true, modalType: 'buy', tokens: sortTokensByPrice() });
                }}
                className="tokenContainer to"
              >
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

                <div className="inputdatacontainer">
                  <input type="number" placeholder="0" />
                  <div className="buttonContainer">
                    <button>Max</button>
                  </div>
                  <p className="usdPrice">$0</p>
                  <span className="balance">available/ 0</span>
                </div>
              </div>
            </div>
            <button className="swap_btn">Start Swapping</button>
          </div>
          <div className="swap__routes"></div>
        </div>
      </div>

      {/* Add token modal */}
      <Modal active={tokenModal.isActive}>
        <div className={darkModeClassnamegenerator('addTokenModal')}>
          <div className="topSection">
            <button className="backBTN"></button>
            <h3 className="title">Select a token</h3>
            <button
              onClick={() => {
                setTokenModal({ ...tokenModal, isActive: false });
              }}
              className="closeBTN"
            >
              <svg fill="none" viewBox="0 0 16 16">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M2.54 2.54a1 1 0 0 1 1.42 0L8 6.6l4.04-4.05a1 1 0 1 1 1.42 1.42L9.4 8l4.05 4.04a1 1 0 0 1-1.42 1.42L8 9.4l-4.04 4.05a1 1 0 0 1-1.42-1.42L6.6 8 2.54 3.96a1 1 0 0 1 0-1.42Z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div className="searchContainer">
            <svg className="searchIcon" xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18">
              <path d="M17.8109 16.884L13.719 12.792C14.9047 11.3682 15.4959 9.54208 15.3696 7.69351C15.2433 5.84494 14.4091 4.11623 13.0407 2.86698C11.6723 1.61772 9.87502 0.944104 8.02262 0.986239C6.17021 1.02837 4.40536 1.78299 3.09517 3.09317C1.78499 4.40336 1.03033 6.1682 0.988192 8.0206C0.946057 9.873 1.61969 11.6704 2.86894 13.0388C4.1182 14.4072 5.84693 15.2413 7.6955 15.3676C9.54407 15.494 11.3702 14.9028 12.7939 13.717L16.886 17.8089C17.0086 17.9316 17.175 18.0006 17.3485 18.0006C17.5219 18.0006 17.6883 17.9316 17.8109 17.8089C17.9336 17.6863 18.0025 17.52 18.0025 17.3465C18.0025 17.1731 17.9336 17.0067 17.8109 16.884ZM2.31096 8.19297C2.31096 7.02902 2.6561 5.89122 3.30275 4.92343C3.9494 3.95565 4.86851 3.20138 5.94385 2.75595C7.01919 2.31053 8.20248 2.19398 9.34406 2.42105C10.4856 2.64813 11.5342 3.20862 12.3573 4.03165C13.1803 4.85468 13.7408 5.90332 13.9679 7.04489C14.1949 8.18647 14.0784 9.3697 13.633 10.445C13.1876 11.5204 12.4333 12.4395 11.4655 13.0862C10.4977 13.7328 9.3599 14.078 8.19596 14.078C6.63547 14.0767 5.13926 13.4562 4.03574 12.3529C2.93221 11.2495 2.31154 9.75345 2.30995 8.19297H2.31096Z"></path>
            </svg>
            <input
              onChange={(e) => {
                setTokenModal({ ...tokenModal, tokens: searchinput(tokenModal.modalType == 'buy' ? supportedTokens : assets, e.target.value) });
              }}
              type="text"
              placeholder="Search name or paste address"
            />
          </div>
          <div className="seprator">
            <span></span>
          </div>
          <div className="tokens">
            {tokenModal.tokens?.map((token) => {
              return (
                <div
                  onClick={() => {
                    // handleTokenSelection(token);
                  }}
                  key={token.id}
                  className="token"
                  onMouseOver={() => {
                    setTokenContractToShow(token.id);
                  }}
                  onMouseOut={() => {
                    setTokenContractToShow('');
                  }}
                >
                  <div className="token_info">
                    <img className="token_logo" src={token.logo} alt="" />
                    <div className="token_details">
                      <h3 className="token_name">{token.name}</h3>
                      <h4 className="token_symbol">{tokenContractToShow == token.id ? token.id : token.symbol}</h4>
                    </div>
                  </div>
                  <div className="token_balanceAndPrice">
                    {tokenModal.modalType == 'sell' && <h3>{formatSignificantNumber(applyDecimals(token.balance, token.decimals))}</h3>}

                    {tokenModal.modalType == 'buy' && <h3>Price</h3>}

                    <p className="price">
                      {tokenModal.modalType == 'sell' && (
                        <> ${formatDecimalValue(BigNumber(token.price).multipliedBy(applyDecimals(token.balance, token.decimals)).toNumber())}</>
                      )}

                      {tokenModal.modalType == 'buy' && <> ${formatDecimalValue(BigNumber(token.price).toNumber())}</>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Swap;


'use client';

import { useSelector } from 'react-redux';
import LoadingComponent from './higerOrderComponents/loadingComponent';
import { useState } from 'react';
import MultiSwapTable from './MultiSwapTable';
import Modal from './higerOrderComponents/modal';
import darkModeClassnamegenerator, { darkClassGenerator } from '@/utils/darkClassGenerator';
import BigNumber from 'bignumber.js';
import { BatchTransact } from '@/artemis-web3-adapter';
import { AppicMultiswapidlFactory, icrcIdlFactory, dip20IdleFactory } from '@/did';
import canistersIDs from '@/config/canistersIDs';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier, SubAccount } from '@dfinity/ledger-icp';
function MultiSwap() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchValue, setModalSearchValue] = useState('');

  const allTokens = useSelector((state) => state.supportedTokens.tokens);
  const loader = useSelector((state) => state.wallet.items.loader);
  const totalBalance = useSelector((state) => state.wallet.items.totalBalance);
  const ownedTokens = useSelector((state) => state.wallet.items.assets);
  const ownedTokensWithAddedProperties = ownedTokens.map((ownedToken) => {
    const percentage = (ownedToken.usdBalance / totalBalance) * 100;
    return { ...ownedToken, percentage, value: ownedToken.usdBalance, newValue: ownedToken.usdBalance, newPercentage: percentage };
  });

  const principalID = useSelector((state) => state.wallet.items.principalID);

  const [swapTokens, setSwapTokens] = useState(ownedTokensWithAddedProperties);

  const [checkedTokens, setCheckedTokens] = useState(() => swapTokens.map((swapToken) => swapToken.id));
  const filteredAllTokens = allTokens.filter((token) => token.name.toLowerCase().includes(modalSearchValue));

  const handleSwapTokens = (addedTokens) => {
    setSwapTokens([...swapTokens, ...addedTokens]);
  };

  const handleModalClose = () => {
    const result = checkedTokens.filter((tokenId) => swapTokens.some((swapToken) => swapToken.id === tokenId));
    setCheckedTokens(result);
    setIsModalOpen(false);
  };

  const handleTokenUpdate = (tokenId, newPercentage) => {
    const newSwapTokens = swapTokens.map((swapToken) => {
      if (swapToken.id !== tokenId) return swapToken;
      const newValue = (totalBalance * newPercentage) / 100;
      return { ...swapToken, newValue, newPercentage };
    });

    setSwapTokens(newSwapTokens);
  };

  const handleConfirmSwap = async () => {
    console.log('Swap Confirmed Successfully!');

    let sellTokenssDetails = [];
    let buyTokensDetails = [];

    let sellingTokens = []; // List of tokens being sold
    let buyingTokens = []; // List of tokens being bought
    let sellAmounts = []; // Amounts of tokens being sold
    let buyAmounts = []; // Amounts of tokens being bought
    let midToken = Principal.fromText(canistersIDs.NNS_ICP_LEDGER); // The middle token used for swaps
    let midTokenType = 'ICRC2'; // Type of the middle token
    let sellingTokensType = []; // Types of the selling tokens
    let buyingTokensType = []; // Types of the buying tokens
    let caller = Principal.fromText(principalID); // Principal of the user initiating the swap

    swapTokens.forEach((token) => {
      let newPercentage = parseFloat(token.newPercentage);
      if (Math.trunc(parseFloat(token.percentage) - newPercentage) > 0) {
        // Calculate amtSell
        let balance = new BigNumber(token.balance || 0);
        let percentageDiff = new BigNumber(token.percentage).minus(newPercentage);
        let amtSell = percentageDiff.times(balance).div(100).toFixed(0); // No decimals
        token.amtSell = amtSell;
        sellTokenssDetails.push(token);
      } else if (Math.trunc(parseFloat(token.percentage) - newPercentage) < 0) {
        console.log(token.percentage - newPercentage);
        buyTokensDetails.push(token);
      }
    });
    let sellTokenIds = sellTokenssDetails.map((token) => token.id);
    sellingTokens = sellTokenssDetails.map((token) => Principal.fromText(token.id));
    sellAmounts = sellTokenssDetails.map((token) => new BigNumber(token.amtSell).toNumber());
    sellingTokensType = sellTokenssDetails.map((token) => String(token.tokenType));

    buyTokensDetails = buyTokensDetails.filter((token) => !sellTokenIds.includes(token.id));
    let totalBuyPer = 0;
    buyTokensDetails.forEach((token) => {
      totalBuyPer = totalBuyPer + Number(token.newPercentage) - Number(token.percentage);
    });

    buyTokensDetails.forEach((token) => {
      let a = new BigNumber(token.newPercentage).times(100).div(totalBuyPer).toFixed(0);
      if (new BigNumber(a).toNumber() !== 0) {
        buyAmounts.push(new BigNumber(a).toNumber());
        buyingTokens.push(Principal.fromText(token.id));
        buyingTokensType.push(String(token.tokenType));
      }
    });

    console.log('Selling Tokens:', sellingTokens);
    console.log('Buying Tokens:', buyingTokens);
    console.log('Sell Amounts:', sellAmounts);
    console.log('Buy Amounts:', buyAmounts);
    console.log('Mid Token:', midToken);
    console.log('Mid Token Type:', midTokenType);
    console.log('Selling Tokens Type:', sellingTokensType);
    console.log('Buying Tokens Type:', buyingTokensType);
    console.log('Caller:', caller);
    try {
      let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_MULTISWAP, AppicMultiswapidlFactory, false);
      const subAccount = await AppicActor.getSubAccount();

      let transactions = {};

      for (let i = 0; i < sellTokenssDetails.length; i++) {
        if (sellTokenssDetails[i].tokenType === 'ICRC1') {
          let icrc1 = await artemisWalletAdapter.getCanisterActor(sellTokenssDetails[i].id, icrcIdlFactory, false);
          const tx = await icrc1.icrc1_transfer({
            to: {
              owner: Principal.fromText(canistersIDs.APPIC_MULTISWAP),
              subaccount: [subAccount],
            },
            fee: [],
            memo: [],
            from_subaccount: [],
            created_at_time: [],
            amount: BigNumber(sellTokenssDetails[i].amtSell).toNumber(),
          });
        } else if (sellTokenssDetails[i].tokenType === 'ICRC2') {
          transactions[sellTokenssDetails[i].id] = {
            canisterId: Principal.fromText(sellTokenssDetails[i].id),
            idl: icrcIdlFactory,
            methodName: 'icrc2_approve',
            args: [
              {
                fee: [],
                memo: [],
                from_subaccount: [],
                created_at_time: [],
                expected_allowance: [],
                expires_at: [],
                amount: BigNumber(sellTokenssDetails[i].amtSell).toNumber(),
                spender: { owner: Principal.fromText(canistersIDs.APPIC_MULTISWAP), subaccount: [] },
              },
            ],
          };
        } else if (sellTokenssDetails[i].tokenType === 'YC' || sellTokenssDetails[i].tokenType === 'DIP20') {
          transactions[sellTokenssDetails[i].id] = {
            canisterId: Principal.fromText(sellTokenssDetails[i].id),
            idl: dip20IdleFactory,
            methodName: 'approve',
            args: [Principal.fromText(canistersIDs.APPIC_MULTISWAP), BigNumber(sellTokenssDetails[i].amtSell).toNumber()],
          };
        }
      }
      let transactionsList = new BatchTransact(transactions, artemisWalletAdapter);
      await transactionsList.execute();

      let sendMultiTras = await AppicActor.multiswap({
        sellingTokens: sellingTokens, // List of tokens being sold
        buyingTokens: buyingTokens, // List of tokens being bought
        sellAmounts: sellAmounts, // Amounts of tokens being sold
        buyAmounts: buyAmounts, // Amounts of tokens being bought
        midToken: midToken, // The middle token used for swaps
        midTokenType: midTokenType, // Type of the middle token
        sellingTokensType: sellingTokensType, // Types of the selling tokens
        buyingTokensType: buyingTokensType, // Types of the buying tokens
        caller: caller, // Principal of the user initiating the swap
      });
    } catch (error) {
      console.log(error);
    }
  };

  const calcTotalAndLeft = () => {
    const totall = swapTokens.reduce((accumulator, token) => {
      return accumulator + Number(token.newPercentage);
    }, 0);

    const left = totall > 100 ? 0 : 100 - totall;

    return [totall, left];
  };

  const [totall, left] = calcTotalAndLeft();

  const handleModalSearch = (e) => {
    setModalSearchValue(e.target.value);
  };

  const handleCheckBox = (tokenId) => {
    const isAlreadyChecked = checkedTokens.includes(tokenId);
    if (isAlreadyChecked) {
      setCheckedTokens([...checkedTokens].filter((checkedTokenId) => tokenId !== checkedTokenId));
    } else {
      setCheckedTokens([...checkedTokens, tokenId]);
    }
  };

  const handleAddTokens = () => {
    const toAddTokens = allTokens
      .filter((token) => {
        return checkedTokens.includes(token.id);
      })
      .map((toAddToken) => {
        return { ...toAddToken, value: 0, percentage: 0, newValue: 0, newPercentage: 0 };
      })
      .filter((toAddToken) => ownedTokens.some((ownedToken) => toAddToken.id !== ownedToken.id));

    let arr = [...toAddTokens, ...ownedTokensWithAddedProperties];
    // Create a new array to store filtered objects
    let filteredArr = [];
    // Create an object to keep track of seen IDs
    let seenIds = {};

    // Iterate through the original array
    for (let obj of arr) {
      // If the ID has not been seen before
      if (!seenIds[obj.id]) {
        // Mark the ID as seen
        seenIds[obj.id] = true;
        obj.newPercentage = Math.round(obj.newPercentage);
        // Add the object to the filtered array
        filteredArr.push(obj);
      } else if (seenIds[obj.id] && obj.newPercentage !== 0) {
        // If the ID has been seen before and the current object's newPercentage is not zero
        // Replace the previous object with the current object in the filtered array
        filteredArr = filteredArr.filter((o) => o.id !== obj.id);
        obj.newPercentage = Math.round(obj.newPercentage);
        filteredArr.push(obj);
      }
    }
    setSwapTokens(filteredArr);
    setIsModalOpen(false);
  };

  return (
    <div className={darkModeClassnamegenerator('multi-swap')}>
      {loader && <LoadingComponent></LoadingComponent>}
      <MultiSwapTable swapTokens={swapTokens} onUpdate={handleTokenUpdate} />
      {totall > 100 ? <p className="warning-message">Total percentage should NOT exceed 100%</p> : null}
      <div className="cta-container">
        <button className="btn btn-add" onClick={() => setIsModalOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Token
        </button>
        <button className="btn btn-confirm" onClick={handleConfirmSwap} disabled={totall !== 100}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24 }}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
            />
          </svg>
          Confirm Swap
        </button>
        <p>
          Total: <span>{'~' + totall + '%'}</span>
          <span>{left + '% Left'}</span>
        </p>
      </div>

      <Modal active={isModalOpen}>
        <div className="addTokenModal">
          <div className="topSection">
            <button className="backBTN"></button>
            <h3 className="title">Select a token</h3>
            <button onClick={handleModalClose} className="closeBTN">
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
            <input type="text" placeholder="Search name or paste address" value={modalSearchValue} onChange={handleModalSearch} />
          </div>
          <div className="seprator">
            <span></span>
          </div>
          <div className="tokens">
            {filteredAllTokens?.map((token) => {
              return (
                <div
                  onClick={() => {
                    // handleTokenSelection(token);
                  }}
                  key={token.id}
                  className="token token--multi-swap"
                >
                  <div className="token_info">
                    <img className="token_logo" src={token.logo} alt="" />
                    <div className="token_details">
                      <h3 className="token_name">{token.name}</h3>
                      <h4 className="token_symbol">{token.symbol}</h4>
                    </div>
                  </div>
                  {/* <div className="token_balance token_balance--multi-swap">
                    <h3>{token.price}</h3>
                  </div> */}
                  <input
                    id={token.id}
                    type="checkbox"
                    onChange={() => handleCheckBox(token.id)}
                    checked={checkedTokens.includes(token.id)}
                    disabled={ownedTokens.some((ownedToken) => ownedToken.id === token.id)}
                  />
                  <label htmlFor={token.id} className="token-check-label" />
                </div>
              );
            })}
          </div>
          <button className="btn confirm-add-swap-tokens" type="button" onClick={handleAddTokens}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Add Selected Tokens
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default MultiSwap;


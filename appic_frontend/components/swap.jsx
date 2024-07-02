'use client';

import { useEffect, useState } from 'react';
import Title from './higerOrderComponents/titlesAndHeaders';
import { useSelector } from 'react-redux';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import Modal from './higerOrderComponents/modal';
import { applyDecimals, formatDecimalValue, formatPrice, formatSignificantNumber } from '@/helper/number_formatter';
import BigNumber from 'bignumber.js';
import LoadingComponent from './higerOrderComponents/loadingComponent';
import Countdown from './higerOrderComponents/countdown';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import { Principal } from '@dfinity/principal';
import canistersIDs from '@/config/canistersIDs';
import { AppicMultiswapidlFactory, icrcIdlFactory, dip20IdleFactory, icpSwapPools, icpSwapFactory, sonicIdlFactory } from '@/did';
import { icpSwapAmountOut, sonicSwapAmountOut } from '@/helper/swapHelperFunction';

const principalID = useSelector((state) => state.wallet.items.principalID);

async function swapWithSonic(sellToken, buyToken, sellTokenType, buyTokenType, amtSell) {
  let amountOut = await sonicSwapAmountOut(sellToken, buyToken, amtSell);
  if (amountOut != 0) {
    let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_MULTISWAP, AppicMultiswapidlFactory, false);
    let caller = Principal.fromText(principalID);
    let fee;
    const subAccount = await AppicActor.getICRC1SubAccount(caller);
    console.log('subAccount', subAccount);
    if (sellTokenType === 'ICRC1') {
      let icrc1 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
      fee = icrc1.icrc1_fee();
      const tx = await icrc1.icrc1_transfer({
        to: {
          owner: Principal.fromText(canistersIDs.APPIC_MULTISWAP),
          subaccount: [subAccount],
        },
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: BigNumber(amtSell).minus(fee).toNumber(),
      });
    } else if (sellTokenType === 'ICRC2') {
      let icrc2 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
      fee = icrc2.icrc1_fee();
      const tx = await icrc2.icrc2_approve({
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        expected_allowance: [],
        expires_at: [],
        amount: BigNumber(amtSell).minus(fee).toNumber(),
        spender: { owner: Principal.fromText(canistersIDs.APPIC_MULTISWAP), subaccount: [] },
      });
    } else if (sellTokenType === 'YC' || sellTokenType === 'DIP20') {
      let dip20 = await artemisWalletAdapter.getCanisterActor(sellToken, dip20IdleFactory, false);
      fee = dip20.getTokenFee();
      const tx = await dip20.approve(Principal.fromText(canistersIDs.APPIC_MULTISWAP), BigNumber(amtSell).minus(fee).toNumber());
    }
    let sendMultiTras = await AppicActor.sonicSwap(
      Principal.fromText(sellToken),
      Principal.fromText(buyToken),
      sellTokenType,
      buyTokenType,
      BigNumber(amtSell).minus(fee).toNumber()
    );
    console.log(sendMultiTras);
    return sendMultiTras;
  }
}
async function swapWithICPswap(sellToken, buyToken, sellTokenType, buyTokenType, amtSell) {
  let amountOut = await icpSwapAmountOut(sellToken, buyToken, amtSell);
  if (amountOut != 0) {
    let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_MULTISWAP, AppicMultiswapidlFactory, false);
    let caller = Principal.fromText(principalID);
    let fee;
    const subAccount = await AppicActor.getICRC1SubAccount(caller);
    console.log('subAccount', subAccount);
    if (sellTokenType === 'ICRC1') {
      let icrc1 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
      fee = icrc1.icrc1_fee();
      const tx = await icrc1.icrc1_transfer({
        to: {
          owner: Principal.fromText(canistersIDs.APPIC_MULTISWAP),
          subaccount: [subAccount],
        },
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: BigNumber(amtSell).minus(fee).toNumber(),
      });
    } else if (sellTokenType === 'ICRC2') {
      let icrc2 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
      fee = icrc2.icrc1_fee();
      const tx = await icrc2.icrc2_approve({
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        expected_allowance: [],
        expires_at: [],
        amount: BigNumber(amtSell).minus(fee).toNumber(),
        spender: { owner: Principal.fromText(canistersIDs.APPIC_MULTISWAP), subaccount: [] },
      });
    } else if (sellTokenType === 'YC' || sellTokenType === 'DIP20') {
      let dip20 = await artemisWalletAdapter.getCanisterActor(sellToken, dip20IdleFactory, false);
      fee = dip20.getTokenFee();
      const tx = await dip20.approve(Principal.fromText(canistersIDs.APPIC_MULTISWAP), BigNumber(amtSell).minus(fee).toNumber());
    }
    let sendMultiTras = await AppicActor.icpSwap(
      Principal.fromText(sellToken),
      Principal.fromText(buyToken),
      sellTokenType,
      buyTokenType,
      BigNumber(amtSell).minus(fee).toNumber()
    );
    console.log(sendMultiTras);
    return sendMultiTras;
  }
}
async function comparisionSwap(sellToken, buyToken, sellTokenType, buyTokenType, amtSell) {
  let amountOut0 = await icpSwapAmountOut(sellToken, buyToken, amtSell);
  let amountOut1 = await sonicSwapAmountOut(sellToken, buyToken, amtSell);
  if (amountOut1 != 0 && amountOut0 != 0) {
    let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_MULTISWAP, AppicMultiswapidlFactory, false);
    let caller = Principal.fromText(principalID);
    let fee;
    const subAccount = await AppicActor.getICRC1SubAccount(caller);
    console.log('subAccount', subAccount);
    if (sellTokenType === 'ICRC1') {
      let icrc1 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
      fee = icrc1.icrc1_fee();
      const tx = await icrc1.icrc1_transfer({
        to: {
          owner: Principal.fromText(canistersIDs.APPIC_MULTISWAP),
          subaccount: [subAccount],
        },
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: BigNumber(amtSell).minus(fee).toNumber(),
      });
    } else if (sellTokenType === 'ICRC2') {
      let icrc2 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
      fee = icrc2.icrc1_fee();
      const tx = await icrc2.icrc2_approve({
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        expected_allowance: [],
        expires_at: [],
        amount: BigNumber(amtSell).minus(fee).toNumber(),
        spender: { owner: Principal.fromText(canistersIDs.APPIC_MULTISWAP), subaccount: [] },
      });
    } else if (sellTokenType === 'YC' || sellTokenType === 'DIP20') {
      let dip20 = await artemisWalletAdapter.getCanisterActor(sellToken, dip20IdleFactory, false);
      fee = dip20.getTokenFee();
      const tx = await dip20.approve(Principal.fromText(canistersIDs.APPIC_MULTISWAP), BigNumber(amtSell).minus(fee).toNumber());
    }
    let sendMultiTras = await AppicActor.singleComparedSwap(
      Principal.fromText(sellToken),
      Principal.fromText(buyToken),
      sellTokenType,
      buyTokenType,
      BigNumber(amtSell).minus(fee).toNumber()
    );
    console.log(sendMultiTras);
    return sendMultiTras;
  }
}
async function swapWithMidToken(sellToken, buyToken, sellTokenType, buyTokenType, amtSell) {
  let amountOut00 = await icpSwapAmountOut(sellToken, canistersIDs.NNS_ICP_LEDGER, amtSell);
  let amountOut01 = await icpSwapAmountOut(canistersIDs.NNS_ICP_LEDGER, buyToken, amountOut00);
  let amountOut10 = await sonicSwapAmountOut(sellToken, canistersIDs.NNS_ICP_LEDGER, amtSell);
  let amountOut11 = await sonicSwapAmountOut(canistersIDs.NNS_ICP_LEDGER, buyToken, amountOut10);
  if (amountOut11 != 0 && amountOut01 != 0) {
    let midToken = Principal.fromText(canistersIDs.NNS_ICP_LEDGER);
    let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_MULTISWAP, AppicMultiswapidlFactory, false);
    let caller = Principal.fromText(principalID);
    let fee;
    const subAccount = await AppicActor.getICRC1SubAccount(caller);
    console.log('subAccount', subAccount);
    if (sellTokenType === 'ICRC1') {
      let icrc1 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
      fee = icrc1.icrc1_fee();
      const tx = await icrc1.icrc1_transfer({
        to: {
          owner: Principal.fromText(canistersIDs.APPIC_MULTISWAP),
          subaccount: [subAccount],
        },
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: BigNumber(amtSell).minus(fee).toNumber(),
      });
    } else if (sellTokenType === 'ICRC2') {
      let icrc2 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
      fee = icrc2.icrc1_fee();
      const tx = await icrc2.icrc2_approve({
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        expected_allowance: [],
        expires_at: [],
        amount: BigNumber(amtSell).minus(fee).toNumber(),
        spender: { owner: Principal.fromText(canistersIDs.APPIC_MULTISWAP), subaccount: [] },
      });
    } else if (sellTokenType === 'YC' || sellTokenType === 'DIP20') {
      let dip20 = await artemisWalletAdapter.getCanisterActor(sellToken, dip20IdleFactory, false);
      fee = dip20.getTokenFee();
      const tx = await dip20.approve(Principal.fromText(canistersIDs.APPIC_MULTISWAP), BigNumber(amtSell).minus(fee).toNumber());
    }
    let sendMultiTras = await AppicActor.swapWithMidToken(
      Principal.fromText(sellToken),
      midToken,
      Principal.fromText(buyToken),
      BigNumber(amtSell).minus(fee).toNumber(),
      sellTokenType,
      'ICRC2',
      buyTokenType
    );
    console.log(sendMultiTras);
    return sendMultiTras;
  }
}

function Swap(props) {
  const [tokenModal, setTokenModal] = useState({ isActive: false, modalType: 'sell', tokens: [] }); // modalType: buy, sell
  const [swapData, setSwapData] = useState({
    sellToken: {
      id: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
      name: 'Select Token',
      symbol: 'XYZ',
      logo: '/blankToken.png',
    },
    buyToken: {
      id: 'mxzaz-hqaaa-aaaar-qaada-cai',
      name: 'Select Token',
      symbol: 'ABC',
      logo: '/blankToken.png',
    },
    amountToSell: 0,
  });
  const [tokenContractToShow, setTokenContractToShow] = useState('');
  const [isComparisonActive, setIsComparisonActive] = useState(false);

  const isDark = useSelector((state) => state.theme.isDark);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const accoundID = useSelector((state) => state.wallet.items.accountID);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const assets = useSelector((state) => state.wallet.items.assets);
  const totalBalance = useSelector((state) => state.wallet.items.totalBalance);
  const loader = useSelector((state) => state.wallet.items.loader);
  const supportedTokens = useSelector((state) => state.supportedTokens.tokens);

  //   Sort tokens for the buy modal
  const sortTokensByPrice = () => {
    return [...supportedTokens].sort((a, b) => Number(b.price) - Number(a.price));
  };
  //   Token moodals search
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
  // handle select tokens mode=  sell, buy
  const handleSelect = (mode, token) => {
    if (mode == 'buy') {
      setSwapData({ ...swapData, buyToken: token });
    } else {
      setSwapData({ ...swapData, sellToken: token });
    }
    setTokenModal({ ...tokenModal, isActive: false });
  };

  return (
    <>
      <div className={darkModeClassnamegenerator('swap')}>
        {loader && <LoadingComponent></LoadingComponent>}
        {!loader && (
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
                    <img src={swapData.sellToken.logo} alt="" />
                    <div className="tokenDetails">
                      <h3>{swapData.sellToken.symbol}</h3>
                      <p>{swapData.sellToken.name}</p>
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
                    <img src={swapData.buyToken.logo} alt="" />
                    <div className="tokenDetails">
                      <h3>{swapData.buyToken.symbol}</h3>
                      <p>{swapData.buyToken.name}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="amountContainer">
                <span>Amount</span>
                <div className="details">
                  <img src={swapData.sellToken.logo} className="tokenLogo" alt="" />

                  <div className="inputdatacontainer">
                    <input
                      onChange={(e) => {
                        console.log(swapData);
                        setSwapData({ ...swapData, amountToSell: e.target.value });
                      }}
                      value={swapData.amountToSell}
                      type="number"
                      placeholder="0"
                    />
                    <div className="buttonContainer">
                      <button
                        onClick={() => {
                          console.log(swapData.sellToken);
                          setSwapData({ ...swapData, amountToSell: applyDecimals(swapData.sellToken.balance, swapData.sellToken.decimals) });
                        }}
                      >
                        Max
                      </button>
                    </div>
                    <p className="usdPrice">${BigNumber(swapData.amountToSell).multipliedBy(swapData.sellToken.price).toNumber() || 0}</p>
                    <span className="balance">available/ {applyDecimals(swapData.sellToken.balance, swapData.sellToken.decimals) || 0}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log(isComparisonActive);
                  setIsComparisonActive(!isComparisonActive);
                }}
                className="swap_btn"
              >
                Review Swap
              </button>
            </div>
            <div className={isComparisonActive ? 'swap__routes active' : 'swap__routes'}>
              <div className="swapAndTimer">
                <h2 className="title">Select Route</h2>
                <Countdown onCountdownComplete={() => {}} />
              </div>

              <div className="dexs">
                <div className="dex selected">
                  <p className="badge">Best Return</p>
                  <div className="return__details">
                    <img src="/ckBTC.png" alt="" />
                    <div className="returnDetails">
                      <h3 className="amount">1.0324 ckBTC</h3>
                      <div className="dexAndusdPrice">
                        <p>$1.545</p>
                        <div className="dexDetails">
                          <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACF0lEQVR4AWJAB2xsbEZAajofH99Nfn7+n0Aa0DYZQKoVR2FcVaoqKqgSEoB5HhAGbKwJDIRhEBhWGAQEAIzkuZ6ZASiRlARDG0BRKRMqqUpCBFd0+3a+ybXuOny693/P+Z1zzv90kvcJz0SPovsWiURcgUDgmzxqXq8XNpsNAoC8/yuNIOYxxjtisdgvBuXzefR6PXS7Xbx5/RFWq8sIoX7cQCTzM7OVy2XQdrsdFosFPn/q4NXL7/cAkFYVxtIew+GwlkgkQGu1WpLVyhbw4f0XvHv78y5A2tRCodADAYr0j0wmA1o6ndadGo0Gvj63/wu2WCzweDyQxAoBEwKSySRopVIJZrMZdKzVathsNlBVFfP5HLlcDna7HWyXPsFgcELASR7YE/r9Pi6XC9rtNiqVCobDIVarFVjJbDYDrVAoEE4Iqzj9BfDa5L5ZEur1Os7nMzRNw2AwwHK5BAOcTidGoxGOxyOD4XA4GKMSwIW5uXN+lJtBs9nUAVSxWAQtHo+zYsZMCFBMJhNp8Pv9N8PiDNbrNQiPRqOYTqc4HA6cA/2ZRCGA66kxq9vths/ngwB1AGfQ6XSw3W5B46IRKABN2tJXmyS4XC4KnAmVSqVQrVax3+8xHo+RzWY5CwL4+3TzH7quJ3sjnRPmfdORlXG5eE4ZV1k3q6jIdkRsQw9gVQRdvz0Zg4324ur0W6RexWeePRid/wCDN2DtFwT6ywAAAABJRU5ErkJggg=="
                            alt=""
                          />
                          <p>IcpEx</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dex">
                  <div className="return__details">
                    <img src="/ckBTC.png" alt="" />
                    <div className="returnDetails">
                      <h3 className="amount">1.0324 ckBTC</h3>
                      <div className="dexAndusdPrice">
                        <p>$1.545</p>
                        <div className="dexDetails">
                          <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADMklEQVR4AbXVAURccQDH8afurta6UtsuS7SmuiZVA5JQRqqoKJElKChAAIKkVZEL5EIKQJFI28ZaykpVQVCrqZipu3ZQdrvuqt9+/8c91b137j3Xlw89f++99/q///8kHSXTe5qgLTonP12Rm9bJSc2USFHrDU3RP0KELslJWWS4J+SgAMEgH/WRmXSVTpuEKPlONoqot/SbEGVHZKewvaRfhEdyTC/CzfkG4ZGtkIVCchCMyMvLw8zMDNxuNy4uLrC6uor29nbExsZqndOjstSMfe1tbW3w+/1Qa35+HhaLRe08L6WT0hRBr7KyMlxfX0O0vb2Njo4OtLa2YnZ2FsEGBwe1zh8huSTyEvRaWlqCaG1tDXFxcffGHA4HRF6vF4mJiWrneyiOpFaCXqmpqcrb19TUhIzbbDYEq6io0LpOFUkTBL3ERZk8/yaTKWQ8Pj4egUBA4wEVwyRtEfSqq6uDyOVyqY43NjYiWFZWltZ1PpP0hxCJpKQkZGZmyvNdWloKEd9S/g+kpKSIuZb/rq+vx/n5OUSLi4vhrnlAkp8QTmVlJdbX13F7ewuR0+kUN1SOCwsLUVJSIn8TPp8PwTweD3JycsJd20XSFUFLZ2dn8EZKKysr8tjJyQmYvBckJyfjbsvLy8jNzQ37YnRGkpugJj8/X/mQdnZ2UFtbi4KCAjQ1NcnjCwsLEPX398vH1dXVaGhoUL+xun3S3v/HxsYgOj4+htVqDRkXU8HkbZjHRnwkyUlQs7GxAdHQ0JDq+OTkJERzc3NGH+ADSc0ENZubmxANDAyojosPUzQ6Omr0Ad6R9JQuCQ+Nj49DdHh4iISEhHtjxcXFyk7Ib8PIzV1kIqYxDUVFRbi5uQGTf2LLy8uRkZGBlpYWnJ6eQrS3t4eYmBgjD9BLSq/JR3iou7s7ZBneXedcFUZufkZWuldfuG13d3cXTNn/p6enkZ2dbXTuuygkM30jaElLS4PdbofZbBbHRi1RLKn2nI4Ij+SAbBQ2O/0kRNkhvaKIeqY+HYZ9JRvpykw99JdgkIu6KIYMl04j5NG5zHrJSlHLQlU0TF/oB7nJRfv0ifrpHZkoov4DbvZk8gNd6AQAAAAASUVORK5CYII="
                            alt=""
                          />
                          <p>ICPSwap</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dex">
                  <div className="return__details">
                    <img src="/ckBTC.png" alt="" />
                    <div className="returnDetails">
                      <h3 className="amount">1.0324 ckBTC</h3>
                      <div className="dexAndusdPrice">
                        <p>$1.545</p>
                        <div className="dexDetails">
                          <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAMFBMVEUADQEPPSgADQEQPioACQACKxcAEAEINiEAIQ4AFwYN6aAAAAAB/ZEEvHEDYTsFkFpBcIP4AAAABHRSTlPk5CYmVbbOUAAAAMhJREFUKJF90IsOgzAIQFF8AEVs/f+/XUuhutnsGhPjETTCCvsrsmCFt5GjTGxMisyWOtIMfVL+Tk7xNaneDJWLxXovDlQ8PY1BCVQNY31u7ZPZ7dLRQL2yV0pcabUEbcX9sZrPw7q0odBoJy1uRyFJFVuuymF1MDVMEr6T05HNEqRQkT0HmiFCsuwJzU9riKH1pP4T0a1iLaFP24spjA2r+oIR3oj3/CBkBmZGHupHN8MW/mQ3Ax8LhjEs/Azt8BbYvrU/0W37AJ26FYpy4y15AAAAAElFTkSuQmCC"
                            alt=""
                          />
                          <p>Sonic</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dex">
                  <div className="return__details">
                    <img src="/ckBTC.png" alt="" />
                    <div className="returnDetails">
                      <h3 className="amount">1.0324 ckBTC</h3>
                      <div className="dexAndusdPrice">
                        <p>$1.545</p>
                        <div className="dexDetails">
                          <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAOVBMVEVHcEwspuAspuAspuAspuAspuAspuAspuAspuAspuAspuAspuAspuAspuAspuAspuAspuAspuAspuB4KyaFAAAAE3RSTlMAVtSeIA49jLjDdy1pr1waS+b6HH8xuwAAAQFJREFUeAF10tGyAxEMBuBIRAQB7/+wp13VObuj/7jhy8gA/I9D8nAMB0KJmk6cRSkAl2i1PailaI6voqTU782ill3PQVDylzKhrE7dL46YeFWmYeGzwdS21gpqv1aGg5U651QPi0n91e/TrdELv5XObghlGOKe1CdiSz/R2WvwETmH/h6ZD9hxII45Yj4gOOuEZu3YsyNSqz+wYuGq0R+xUKAolo+YUMWHeMO6UbRDUAy36xtlnVMKyxDr66JN/X6eCyPG1sy9KY342cELUgYmLJBpVOCuWhl2umkKVFtRshT2x9jhEhWFrLOgUoBHfMJpnhNa5+PPRVKtDc4JKjf6A3JMDEmVDDq0AAAAAElFTkSuQmCC"
                            alt=""
                          />
                          <p>ICDex</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
                    handleSelect(tokenModal.modalType, token);
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


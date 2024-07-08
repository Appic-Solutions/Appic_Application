'use client';

import { useEffect, useRef, useState } from 'react';
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
import { icpSwapAmountOut, sonicSwapAmountOut, getTxHistory, getTxStatus } from '@/helper/swapHelperFunction';

function Swap({ setActiveComponent }) {
  const [tokenModal, setTokenModal] = useState({ isActive: false, modalType: 'sell', tokens: [] }); // modalType: buy, sell
  const [transactionModal, setTransactionModal] = useState(false);
  const [transactionStep1, setTransationStep1] = useState('notTriggered'); // inProgress, notTriggered, Rejected, Fialed , Successful
  const [transactionStep2, setTransationStep2] = useState('notTriggered'); // inProgress, notTriggered, Rejected, Fialeds
  const [transactionStepFailure, setTransactionStepFailure] = useState(null);
  const intervalRef = useRef(null);

  const intervalTransactionSatus = useRef(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [tokenContractToShow, setTokenContractToShow] = useState('');
  const [isComparisonActive, setIsComparisonActive] = useState(false);
  const [swapData, setSwapData] = useState({
    sellToken: {
      id: '',
      name: 'Select Token',
      symbol: 'XYZ',
      logo: '/blankToken.png',
    },
    buyToken: {
      id: '',
      name: 'Select Token',
      symbol: 'ABC',
      logo: '/blankToken.png',
    },
    amountToSell: 0,
    swpaPairs: [],
    shouldReview: true,
  });
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
  const handleSelect = async (mode, token) => {
    if (mode == 'buy') {
      setSwapData({ ...swapData, buyToken: token, swpaPairs: [], shouldReview: true });
    } else {
      setSwapData({ ...swapData, sellToken: token, swpaPairs: [], shouldReview: true });
    }
    setTokenModal({ ...tokenModal, isActive: false });
    setIsComparisonActive(false);
  };

  // Get Dex logo
  const getDexLogo = (dex) => {
    switch (dex) {
      case 'ICPSwap':
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADMklEQVR4AbXVAURccQDH8afurta6UtsuS7SmuiZVA5JQRqqoKJElKChAAIKkVZEL5EIKQJFI28ZaykpVQVCrqZipu3ZQdrvuqt9+/8c91b137j3Xlw89f++99/q///8kHSXTe5qgLTonP12Rm9bJSc2USFHrDU3RP0KELslJWWS4J+SgAMEgH/WRmXSVTpuEKPlONoqot/SbEGVHZKewvaRfhEdyTC/CzfkG4ZGtkIVCchCMyMvLw8zMDNxuNy4uLrC6uor29nbExsZqndOjstSMfe1tbW3w+/1Qa35+HhaLRe08L6WT0hRBr7KyMlxfX0O0vb2Njo4OtLa2YnZ2FsEGBwe1zh8huSTyEvRaWlqCaG1tDXFxcffGHA4HRF6vF4mJiWrneyiOpFaCXqmpqcrb19TUhIzbbDYEq6io0LpOFUkTBL3ERZk8/yaTKWQ8Pj4egUBA4wEVwyRtEfSqq6uDyOVyqY43NjYiWFZWltZ1PpP0hxCJpKQkZGZmyvNdWloKEd9S/g+kpKSIuZb/rq+vx/n5OUSLi4vhrnlAkp8QTmVlJdbX13F7ewuR0+kUN1SOCwsLUVJSIn8TPp8PwTweD3JycsJd20XSFUFLZ2dn8EZKKysr8tjJyQmYvBckJyfjbsvLy8jNzQ37YnRGkpugJj8/X/mQdnZ2UFtbi4KCAjQ1NcnjCwsLEPX398vH1dXVaGhoUL+xun3S3v/HxsYgOj4+htVqDRkXU8HkbZjHRnwkyUlQs7GxAdHQ0JDq+OTkJERzc3NGH+ADSc0ENZubmxANDAyojosPUzQ6Omr0Ad6R9JQuCQ+Nj49DdHh4iISEhHtjxcXFyk7Ib8PIzV1kIqYxDUVFRbi5uQGTf2LLy8uRkZGBlpYWnJ6eQrS3t4eYmBgjD9BLSq/JR3iou7s7ZBneXedcFUZufkZWuldfuG13d3cXTNn/p6enkZ2dbXTuuygkM30jaElLS4PdbofZbBbHRi1RLKn2nI4Ij+SAbBQ2O/0kRNkhvaKIeqY+HYZ9JRvpykw99JdgkIu6KIYMl04j5NG5zHrJSlHLQlU0TF/oB7nJRfv0ifrpHZkoov4DbvZk8gNd6AQAAAAASUVORK5CYII=';

      case 'SonicSwap':
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAMFBMVEUADQEPPSgADQEQPioACQACKxcAEAEINiEAIQ4AFwYN6aAAAAAB/ZEEvHEDYTsFkFpBcIP4AAAABHRSTlPk5CYmVbbOUAAAAMhJREFUKJF90IsOgzAIQFF8AEVs/f+/XUuhutnsGhPjETTCCvsrsmCFt5GjTGxMisyWOtIMfVL+Tk7xNaneDJWLxXovDlQ8PY1BCVQNY31u7ZPZ7dLRQL2yV0pcabUEbcX9sZrPw7q0odBoJy1uRyFJFVuuymF1MDVMEr6T05HNEqRQkT0HmiFCsuwJzU9riKH1pP4T0a1iLaFP24spjA2r+oIR3oj3/CBkBmZGHupHN8MW/mQ3Ax8LhjEs/Azt8BbYvrU/0W37AJ26FYpy4y15AAAAAElFTkSuQmCC';
    }
  };

  // Get the return amount from different dexs
  const getReturnAmount = async () => {
    if (swapData.buyToken.symbol == 'ABC' || swapData.sellToken.symbol == 'XYZ') {
      return;
    }

    // get the return amount for icpswap
    let icpswapResult = await icpSwapAmountOut(
      swapData.sellToken.id,
      'ICRC1',
      swapData.buyToken.id,
      'ICRC1',
      BigNumber(swapData.amountToSell)
        .multipliedBy(10 ** swapData.sellToken.decimals)
        .toNumber()
    );

    // get the retuen amount for sonic
    let sonicResult = await sonicSwapAmountOut(
      swapData.sellToken.id,
      swapData.buyToken.id,
      BigNumber(swapData.amountToSell)
        .multipliedBy(10 ** swapData.sellToken.decimals)
        .toNumber()
    );

    // remove the decimnals
    let transformedICPSwapResult = BigNumber(icpswapResult)
      .dividedBy(10 ** swapData.buyToken.decimals)
      .toNumber();
    let transformedSonicResult = BigNumber(sonicResult)
      .dividedBy(10 ** swapData.buyToken.decimals)
      .toNumber();

    // calculate the usd price
    let ICPSwapUSD = BigNumber(transformedICPSwapResult).multipliedBy(swapData.buyToken.price).toNumber();
    let sonicUSD = BigNumber(transformedSonicResult).multipliedBy(swapData.buyToken.price).toNumber();

    let dexsObject = [
      { dex: 'ICPSwap', amountOut: transformedICPSwapResult, usdValue: ICPSwapUSD, selected: false },
      { dex: 'SonicSwap', amountOut: transformedSonicResult, usdValue: sonicUSD, selected: false },
    ].sort((a, b) => b.amountOut - a.amountOut);

    dexsObject[0].selected = true;

    setSwapData({ ...swapData, swpaPairs: dexsObject, shouldReview: false });
    setTimeLeft(30);
  };

  // Hook for updating the pairs after everychange
  // useEffect(() => {
  //   const getRetuenAmountHandler = async () => {
  //     await getReturnAmount();
  //   };
  //   getRetuenAmountHandler();
  // }, [swapData.sellToken, swapData.buyToken]);

  // Switch buy and sell token
  const switchBuyAndSell = async () => {
    let newSwpaData = { ...swapData, buyToken: swapData.sellToken, sellToken: swapData.buyToken, amountToSell: 0, swpaPairs: [] };
    setIsComparisonActive(false);
    setSwapData(newSwpaData);
  };

  const handleSwap = async () => {
    // Validate selected tokens and check if routes are selected
    if (swapData.shouldReview == true || swapData.buyToken.symbol == 'ABC' || swapData.sellToken.symbol == 'XYZ' || swapData.swpaPairs.length == 0) {
      console.log('please provide enough data');
      return;
    }
    // Validate slected Route
    let slectedRoute = swapData.swpaPairs.find((pair) => pair.selected == true);
    if (slectedRoute.amountOut <= 0) {
      console.log('please selecte a route with liquidity');
      return;
    }
    console.log(slectedRoute);
    clearInterval(intervalRef.current);
    setTimeLeft(0);
    setTransactionModal(true);
    setTransationStep1('inProgress');
    switch (slectedRoute.dex) {
      case 'ICPSwap':
        await swapWithICPswap(
          swapData.sellToken.id,
          swapData.buyToken.id,
          swapData.sellToken.tokenType,
          swapData.buyToken.tokenType,
          BigNumber(swapData.amountToSell)
            .multipliedBy(10 ** swapData.sellToken.decimals)
            .toNumber()
        );
        break;

      case 'SonicSwap':
        await swapWithSonic(
          swapData.sellToken.id,
          swapData.buyToken.id,
          swapData.sellToken.tokenType,
          swapData.buyToken.tokenType,
          BigNumber(swapData.amountToSell)
            .multipliedBy(10 ** swapData.sellToken.decimals)
            .toNumber()
        );
        break;
    }
  };

  /**
   * @notice This function swaps tokens using the Sonic platform.
   * @param sellToken The principal ID of the token to sell.
   * @param buyToken The principal ID of the token to buy.
   * @param sellTokenType The type of the token to sell (e.g., 'ICRC1', 'ICRC2', 'YC', 'DIP20').
   * @param buyTokenType The type of the token to buy.
   * @param amtSell The amount of the sell token to swap.
   * @return The transaction result of the swap.
   * @example
   * await swapWithSonic('qbizb-wiaaa-aaaaq-aabwq-cai', 'ryjl3-tyaaa-aaaaa-aaaba-cai', 'ICRC1', 'ICRC2', '1000000000000');
   */
  async function swapWithSonic(sellToken, buyToken, sellTokenType, buyTokenType, amtSell) {
    console.log(sellToken, buyToken, sellTokenType, buyTokenType, amtSell);
    try {
      // Get the amount of buyToken that can be obtained for amtSell of sellToken.
      let amountOut = await sonicSwapAmountOut(sellToken, buyToken, amtSell);
      if (amountOut == 0) {
        setTransationStep1('Failed');
        setTransactionStepFailure('No liquidity Found');
        return;
      }
      if (amountOut != 0) {
        // Create an actor to interact with the APPIC multiswap canister.
        let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_MULTISWAP, AppicMultiswapidlFactory, false);
        let caller = Principal.fromText(principalID);
        let fee;

        // Get the sub-account for the caller.
        const subAccount = await AppicActor.getICRC1SubAccount(caller);

        // Handle different sell token types.
        if (sellTokenType === 'ICRC1') {
          // Create an actor for the sell token canister.
          let icrc1 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
          fee = await icrc1.icrc1_fee();
          // Transfer the sell token to the APPIC multiswap canister.
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
          console.log(tx);
        } else if (sellTokenType === 'ICRC2') {
          // Create an actor for the sell token canister.
          let icrc2 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
          fee = await icrc2.icrc1_fee();

          // Approve the APPIC multiswap canister to spend the sell token.
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
          // Create an actor for the sell token canister.
          let dip20 = await artemisWalletAdapter.getCanisterActor(sellToken, dip20IdleFactory, false);
          fee = await dip20.getTokenFee();

          // Approve the APPIC multiswap canister to spend the sell token.
          const tx = await dip20.approve(Principal.fromText(canistersIDs.APPIC_MULTISWAP), BigNumber(amtSell).minus(fee).toNumber());
        }
        setTransationStep1('Successful');
        setTransationStep2('inProgress');
        intervalTransactionSatus.current = setInterval(async () => {
          let swapResult = await getTxStatus(principalID);
          if (swapResult == true) {
            setTransationStep2('Successful');
            clearInterval(intervalTransactionSatus);
            return;
          }
        }, 10000);
        // Perform the swap.
        let sendMultiTras = await AppicActor.sonicSwap(
          Principal.fromText(sellToken),
          Principal.fromText(buyToken),
          sellTokenType,
          buyTokenType,
          BigNumber(amtSell).minus(fee).toNumber()
        );
        // setTransationStep2('Successful');
        return sendMultiTras;
      }
    } catch (error) {
      console.log('Failed', error.message);
      setTransationStep1('Failed');
      setTransationStep2('Failed');
      setTransactionStepFailure(error.message || 'Transaction failed');
    }
  }

  /**
   * @notice This function swaps tokens using the ICPswap platform.
   * @param sellToken The principal ID of the token to sell.
   * @param buyToken The principal ID of the token to buy.
   * @param sellTokenType The type of the token to sell (e.g., 'ICRC1', 'ICRC2', 'YC', 'DIP20').
   * @param buyTokenType The type of the token to buy.
   * @param amtSell The amount of the sell token to swap.
   * @return The transaction result of the swap.
   * @example
   * await swapWithICPswap('qbizb-wiaaa-aaaaq-aabwq-cai', 'ryjl3-tyaaa-aaaaa-aaaba-cai', 'ICRC1', 'ICRC2', '1000000000000');
   */
  async function swapWithICPswap(sellToken, buyToken, sellTokenType, buyTokenType, amtSell) {
    try {
      // Get the amount of buyToken that can be obtained for amtSell of sellToken.
      console.log(sellToken, buyToken, amtSell);
      let amountOut = await icpSwapAmountOut(sellToken, buyToken, amtSell);
      if (amountOut == 0) {
        setTransationStep1('Failed');
        setTransactionStepFailure('No liquidity Found');
        return;
      }

      if (amountOut != 0) {
        // Create an actor to interact with the APPIC multiswap canister.
        let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_MULTISWAP, AppicMultiswapidlFactory, false);
        let caller = Principal.fromText(principalID);
        let fee;

        // Get the sub-account for the caller.
        const subAccount = await AppicActor.getICRC1SubAccount(caller);
        console.log('subAccount', subAccount);

        // Handle different sell token types.
        if (sellTokenType === 'ICRC1') {
          // Create an actor for the sell token canister.
          let icrc1 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
          fee = await icrc1.icrc1_fee();

          // Transfer the sell token to the APPIC multiswap canister.
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
          // Create an actor for the sell token canister.
          let icrc2 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
          fee = await icrc2.icrc1_fee();

          // Approve the APPIC multiswap canister to spend the sell token.
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
          // Create an actor for the sell token canister.
          let dip20 = await artemisWalletAdapter.getCanisterActor(sellToken, dip20IdleFactory, false);
          fee = await dip20.getTokenFee();

          // Approve the APPIC multiswap canister to spend the sell token.
          const tx = await dip20.approve(Principal.fromText(canistersIDs.APPIC_MULTISWAP), BigNumber(amtSell).minus(fee).toNumber());
        }
        setTransationStep1('Successful');
        setTransationStep2('inProgress');
        intervalTransactionSatus.current = setInterval(async () => {
          let swapResult = await getTxStatus(principalID);
          if (swapResult == true) {
            setTransationStep2('Successful');
            clearInterval(intervalTransactionSatus);
            return;
          }
        }, 10000);

        // Perform the swap.
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
    } catch (error) {
      console.log('Failed', error.message);
      setTransationStep1('Failed');
      setTransationStep2('Failed');
      setTransactionStepFailure(error.message || 'Transaction failed');
    }
  }

  /**
   * @notice This function compares the swap results between Sonic and ICPswap platforms and chooses the best one.
   * @param sellToken The principal ID of the token to sell.
   * @param buyToken The principal ID of the token to buy.
   * @param sellTokenType The type of the token to sell (e.g., 'ICRC1', 'ICRC2', 'YC', 'DIP20').
   * @param buyTokenType The type of the token to buy.
   * @param amtSell The amount of the sell token to swap.
   * @return The transaction result of the best swap.
   * @example
   * await comparisionSwap('qbizb-wiaaa-aaaaq-aabwq-cai', 'ryjl3-tyaaa-aaaaa-aaaba-cai', 'ICRC1', 'ICRC2', '1000000000000');
   */
  async function comparisionSwap(sellToken, buyToken, sellTokenType, buyTokenType, amtSell) {
    // Get the amount of buyToken that can be obtained from both platforms.
    let amountOut0 = await icpSwapAmountOut(sellToken, buyToken, amtSell);
    let amountOut1 = await sonicSwapAmountOut(sellToken, buyToken, amtSell);

    if (amountOut1 != 0 && amountOut0 != 0) {
      // Create an actor to interact with the APPIC multiswap canister.
      let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_MULTISWAP, AppicMultiswapidlFactory, false);
      let caller = Principal.fromText(principalID);
      let fee;

      // Get the sub-account for the caller.
      const subAccount = await AppicActor.getICRC1SubAccount(caller);
      console.log('subAccount', subAccount);

      // Handle different sell token types.
      if (sellTokenType === 'ICRC1') {
        // Create an actor for the sell token canister.
        let icrc1 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, true);
        fee = await icrc1.icrc1_fee();

        // Transfer the sell token to the APPIC multiswap canister.
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
        // Create an actor for the sell token canister.
        let icrc2 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, true);
        fee = await icrc2.icrc1_fee();

        // Approve the APPIC multiswap canister to spend the sell token.
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
        // Create an actor for the sell token canister.
        let dip20 = await artemisWalletAdapter.getCanisterActor(sellToken, dip20IdleFactory, false);
        fee = await dip20.getTokenFee();

        // Approve the APPIC multiswap canister to spend the sell token.
        const tx = await dip20.approve(Principal.fromText(canistersIDs.APPIC_MULTISWAP), BigNumber(amtSell).minus(fee).toNumber());
      }

      // Perform the best swap based on comparison.
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

  /**
   * @notice This function swaps tokens using a mid token as an intermediary for better rates.
   * @param sellToken The principal ID of the token to sell.
   * @param buyToken The principal ID of the token to buy.
   * @param sellTokenType The type of the token to sell (e.g., 'ICRC1', 'ICRC2', 'YC', 'DIP20').
   * @param buyTokenType The type of the token to buy.
   * @param amtSell The amount of the sell token to swap.
   * @return The transaction result of the swap.
   * @example
   * await swapWithMidToken('qbizb-wiaaa-aaaaq-aabwq-cai', 'ryjl3-tyaaa-aaaaa-aaaba-cai', 'ICRC1', 'ICRC2', '1000000000000');
   */
  async function swapWithMidToken(sellToken, buyToken, sellTokenType, buyTokenType, amtSell) {
    // Get the intermediary token swap amounts from both platforms.
    let amountOut00 = await icpSwapAmountOut(sellToken, canistersIDs.NNS_ICP_LEDGER, amtSell);
    let amountOut01 = await icpSwapAmountOut(canistersIDs.NNS_ICP_LEDGER, buyToken, amountOut00);
    let amountOut10 = await sonicSwapAmountOut(sellToken, canistersIDs.NNS_ICP_LEDGER, amtSell);
    let amountOut11 = await sonicSwapAmountOut(canistersIDs.NNS_ICP_LEDGER, buyToken, amountOut10);

    if (amountOut11 != 0 && amountOut01 != 0) {
      let midToken = Principal.fromText(canistersIDs.NNS_ICP_LEDGER);
      // Create an actor to interact with the APPIC multiswap canister.
      let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_MULTISWAP, AppicMultiswapidlFactory, false);
      let caller = Principal.fromText(principalID);
      let fee;

      // Get the sub-account for the caller.
      const subAccount = await AppicActor.getICRC1SubAccount(caller);
      console.log('subAccount', subAccount);

      // Handle different sell token types.
      if (sellTokenType === 'ICRC1') {
        // Create an actor for the sell token canister.
        let icrc1 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
        fee = await icrc1.icrc1_fee();

        // Transfer the sell token to the APPIC multiswap canister.
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
        // Create an actor for the sell token canister.
        let icrc2 = await artemisWalletAdapter.getCanisterActor(sellToken, icrcIdlFactory, false);
        fee = await icrc2.icrc1_fee();

        // Approve the APPIC multiswap canister to spend the sell token.
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
        // Create an actor for the sell token canister.
        let dip20 = await artemisWalletAdapter.getCanisterActor(sellToken, dip20IdleFactory, false);
        fee = await dip20.getTokenFee();

        // Approve the APPIC multiswap canister to spend the sell token.
        const tx = await dip20.approve(Principal.fromText(canistersIDs.APPIC_MULTISWAP), BigNumber(amtSell).minus(fee).toNumber());
      }

      // Perform the swap with the intermediary token.
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" onClick={switchBuyAndSell}>
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
                        setSwapData({ ...swapData, amountToSell: e.target.value, shouldReview: true });
                      }}
                      value={swapData.amountToSell}
                      type="number"
                      placeholder="0"
                    />
                    <div className="buttonContainer">
                      <button
                        onClick={() => {
                          setSwapData({
                            ...swapData,
                            amountToSell: applyDecimals(swapData.sellToken.balance, swapData.sellToken.decimals),
                            shouldReview: true,
                          });
                        }}
                      >
                        Max
                      </button>
                    </div>
                    <p className="usdPrice">${BigNumber(swapData.amountToSell).multipliedBy(swapData.sellToken.price).toNumber() || 0}</p>
                    <span className="balance">
                      available/ {formatSignificantNumber(applyDecimals(swapData.sellToken.balance, swapData.sellToken.decimals)) || 0}
                    </span>
                  </div>
                </div>
              </div>
              <button
                disabled={swapData.buyToken.symbol == 'ABC' || swapData.sellToken.symbol == 'XYZ'}
                onClick={async () => {
                  if (swapData.shouldReview) {
                    setIsComparisonActive(true);
                    setSwapData({ ...swapData, swpaPairs: [] });
                    await getReturnAmount();
                  } else {
                    await handleSwap();
                  }
                }}
                className={swapData.shouldReview ? 'swap_btn review' : 'swap_btn confirm'}
              >
                {(swapData.buyToken.symbol == 'ABC' || swapData.sellToken.symbol == 'XYZ') && 'Select tokens'}
                {swapData.shouldReview && !(swapData.buyToken.symbol == 'ABC' || swapData.sellToken.symbol == 'XYZ') && 'Review Swap'}
                {!swapData.shouldReview && !(swapData.buyToken.symbol == 'ABC' || swapData.sellToken.symbol == 'XYZ') && 'Start Swapping'}
              </button>
            </div>
            <div className={isComparisonActive ? 'swap__routes active' : 'swap__routes'}>
              <div className="swapAndTimer">
                <h2 className="title">Select Route</h2>
                <Countdown
                  timeLeft={timeLeft}
                  setTimeLeft={setTimeLeft}
                  onCountdownComplete={async () => {
                    setSwapData({ ...swapData, swpaPairs: [] });
                    await getReturnAmount();
                  }}
                  intervalRef={intervalRef}
                />
              </div>

              <div className="dexs">
                {swapData.swpaPairs == 0 && <LoadingComponent></LoadingComponent>}
                {swapData.swpaPairs.map((pair, index) => {
                  return (
                    <div
                      key={pair.dex}
                      onClick={() => {
                        let newPairsObject = swapData.swpaPairs.map((pair) => {
                          pair.selected = false;
                          return pair;
                        });

                        newPairsObject[index].selected = true;
                        setSwapData({ ...swapData, swpaPairs: newPairsObject });
                      }}
                      className={pair.selected ? 'dex selected' : 'dex'}
                    >
                      <div className="badges">
                        {pair.amountOut == 0 ? (
                          <p className="badge">No liquidity Available</p>
                        ) : (
                          <>
                            {index == 0 && <p className="badge">Best Return</p>}
                            {pair.selected && <p className="badge">Selected</p>}
                          </>
                        )}
                      </div>
                      <div className="return__details">
                        <img src={swapData.buyToken.logo} alt="" />
                        <div className="returnDetails">
                          <h3 className="amount">
                            ~{formatSignificantNumber(pair.amountOut)} {swapData.buyToken.symbol}
                          </h3>
                          <div className="dexAndusdPrice">
                            <p>$~{formatDecimalValue(pair.usdValue)}</p>
                            <div className="dexDetails">
                              <img src={getDexLogo(pair.dex)} alt="" />
                              <p>{pair.dex}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                <div key={token.id}>
                  {token.id == swapData.sellToken.id || token.id == swapData.buyToken.id ? (
                    // If already selected add already selected look and text
                    <div
                      className="token selected"
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
                          <h3 className="token_name">
                            {token.name} <span className="selectedBadge">selected</span>
                          </h3>
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
                  ) : (
                    <div
                      onClick={() => {
                        handleSelect(tokenModal.modalType, token);
                      }}
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Transaction Modal */}
      <Modal active={transactionModal}>
        <div className={darkModeClassnamegenerator('transactionModal')}>
          <div className="topSection">
            <button className="backBTN"></button>
            <h3 className="title">Approve Transaction</h3>

            <button
              disabled={transactionStep1 == 'inProgress' || transactionStep2 == 'inProgress'}
              onClick={() => {
                setTransactionModal(false);
                setTransationStep1('notTriggered');
                setTransationStep2('notTriggered');
                setTransactionStepFailure(null);
                setSwapData({ ...swapData, swpaPairs: [], shouldReview: true });
                setIsComparisonActive(false);
              }}
              className="closeBTN"
            >
              {!(transactionStep1 == 'inProgress' || transactionStep2 == 'inProgress') && (
                <svg fill="none" viewBox="0 0 16 16">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M2.54 2.54a1 1 0 0 1 1.42 0L8 6.6l4.04-4.05a1 1 0 1 1 1.42 1.42L9.4 8l4.05 4.04a1 1 0 0 1-1.42 1.42L8 9.4l-4.04 4.05a1 1 0 0 1-1.42-1.42L6.6 8 2.54 3.96a1 1 0 0 1 0-1.42Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              )}
            </button>
          </div>
          <div className="seprator">
            <span></span>
          </div>
          <div className="stepContainer Approval">
            <h1>Step 1</h1>
            <div
              className={`imagesContainer ${transactionStep1 == 'inProgress' ? 'active' : ''} ${transactionStep1 == 'Failed' ? 'Failed' : ''} ${
                transactionStep1 == 'Successful' ? 'Successful' : ''
              }`}
            >
              <div className="iconLoading">
                <div className="coverBG"></div>
                <div className="rotator"></div>
              </div>
              {transactionStep1 == 'inProgress' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
              )}
              {transactionStep1 == 'Successful' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                </svg>
              )}
              {transactionStep1 == 'Failed' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                </svg>
              )}
            </div>
            <p className="transactionDetail">{transactionStep1 == 'Failed' ? transactionStepFailure : 'Please approve the transaction.'}</p>
          </div>
          <div className="stepContainer dcaCreation">
            <h1>Step 2</h1>
            <div
              className={`imagesContainer ${transactionStep2 == 'inProgress' ? 'active' : ''} ${transactionStep2 == 'Failed' ? 'Failed' : ''} ${
                transactionStep2 == 'Successful' ? 'Successful' : ''
              }`}
            >
              <div className="iconLoading">
                <div className="coverBG"></div>

                <div className="rotator"></div>
              </div>
              {transactionStep2 == 'notTriggered' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
              )}
              {transactionStep2 == 'inProgress' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
              )}
              {transactionStep2 == 'Successful' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                </svg>
              )}
              {transactionStep2 == 'Failed' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                </svg>
              )}
            </div>
            <p className="transactionDetail">
              {transactionStep2 == 'Failed' ? transactionStepFailure : 'Please wait until the swap is done. It can take up to 2 miutes'}
            </p>
          </div>
          {transactionStep1 == 'Successful' && transactionStep2 == 'Successful' && (
            <button
              className="viewPosition"
              onClick={() => {
                setActiveComponent('');
              }}
            >
              View your Position
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}

export default Swap;


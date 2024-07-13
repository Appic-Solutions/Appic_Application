import { useCallback, useEffect, useState } from 'react';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import canistersIDs from '@/config/canistersIDs';
import { AppicIdlFactory, dip20IdleFactory, icrcIdlFactory, sonicIdlFactory } from '@/did';
import { initTokens } from '@/redux/features/supportedTokensSlice';
import { useDispatch } from 'react-redux';
import { Principal } from '@dfinity/principal';

import { initPairs } from '@/redux/features/supportedPairs';
import BigNumber from 'bignumber.js';
import { initPositions } from '@/redux/features/dcaPositions';
import { getTxHistory } from '@/helper/swapHelperFunction';
import { initHistory } from '@/redux/features/swapHistory';

export const useUserSwapHistory = (userPrinciplaId, supportedTokens) => {
  const dispatch = useDispatch();
  const [getUserSwapHistoryError, setGetUserSwapHistoryError] = useState(null);
  useEffect(() => {
    // Fetch all Pairs from Appic canister
    if (userPrinciplaId == null || userPrinciplaId == '') return;
    if (supportedTokens.length == 0 || supportedTokens == '') return;

    async function getUserHistory() {
      try {
        const swapHistory = await getTxHistory(userPrinciplaId);
        dispatch(initHistory(_formatSwapHistory(swapHistory, supportedTokens)));
      } catch (error) {
        console.log(error);
        setGetUserSwapHistoryError(error);
      }
    }
    getUserHistory();
    return () => {};
  }, [userPrinciplaId, supportedTokens]);
  return { getUserSwapHistoryError };
};

function _formatSwapHistory(swapHistory, supportedTokens) {
  return swapHistory.map((history) => {
    // Parse swaps object
    const tokenIn = supportedTokens.find((token) => {
      return token.id == history.p2;
    });
    const tokenOut = supportedTokens.find((token) => {
      return token.id == history.p3;
    });

    const amountSold = BigNumber(history.n1)
      .dividedBy(10 ** tokenIn.decimals)
      .toNumber();
    const amountBought = BigNumber(history.n2)
      .dividedBy(10 ** tokenOut.decimals)
      .toNumber();

    const transactionTimeInMillieSeconds = BigNumber(history.time).dividedBy(1e6).toNumber();
    const transactionTime = new Date(transactionTimeInMillieSeconds).toLocaleString();

    const newHistory = { amountSold, amountBought, tokenIn, tokenOut, transactionTime, txStatus: history.txStatus };
    return newHistory;
  });
}


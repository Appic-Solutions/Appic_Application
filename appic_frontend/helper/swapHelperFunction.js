import { icpSwapPools, icpSwapFactory, sonicIdlFactory } from '@/did';
import canistersIDs from '@/config/canistersIDs';
import { artemisWalletAdapter } from '@/utils/walletConnector';

/**
 * @notice This function gets the amount of token1 that can be obtained for a given amount of token0 using the ICPswap platform.
 * @param token0Address The principal ID of the token to sell (token0).
 * @param token0Standard The standard of token0 (e.g., 'ICRC1', 'ICRC2').
 * @param token1Address The principal ID of the token to buy (token1).
 * @param token1Standard The standard of token1.
 * @param amountIn The amount of token0 to swap.
 * @return The amount of token1 that can be obtained, or 0 if the swap fails.
 * @example
 * await icpSwapAmountOut('qbizb-wiaaa-aaaaq-aabwq-cai', 'ICRC1', 'ryjl3-tyaaa-aaaaa-aaaba-cai', 'ICRC2', '1000000000000');
 */
async function icpSwapAmountOut(token0Address, token0Standard, token1Address, token1Standard, amountIn) {
  // Get the swap factory canister actor.
  let swapFactoryCanister = await artemisWalletAdapter.getCanisterActor(canistersIDs.ICP_SWAP_FACTORY, icpSwapFactory, true);

  // Define token0 and token1 objects.
  const token0 = { address: token0Address, standard: token0Standard };
  const token1 = { address: token1Address, standard: token1Standard };

  // Define pool arguments.
  const poolArgs = { fee: 3000, token0, token1 };

  try {
    // Get the pool details from the factory canister.
    const poolResult = await swapFactoryCanister.getPool(poolArgs);

    if (poolResult.ok) {
      // Extract pool data and canister ID.
      const poolData = poolResult.ok;
      let canID = new Principal(poolData.canisterId._arr).toString();

      // Get the swap pool canister actor.
      const swapPoolCanister = await artemisWalletAdapter.getCanisterActor(canID, icpSwapPools, true);
      const zto = poolData.token0.address === token0Address;

      // Define swap arguments.
      const swapArgs = {
        amountIn: amountIn.toString(),
        zeroForOne: zto,
        amountOutMinimum: '0',
      };

      // Get the quote from the swap pool canister.
      const quoteResult = await swapPoolCanister.quote(swapArgs);
      console.log(quoteResult.ok);

      if (quoteResult.ok) {
        // Return the amount of token1.
        return parseInt(quoteResult.ok);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
}

/**
 * @notice This function gets the amount of token1 that can be obtained for a given amount of token0 using the Sonic platform.
 * @param t0 The principal ID of the token to sell (token0).
 * @param t1 The principal ID of the token to buy (token1).
 * @param amountIn The amount of token0 to swap.
 * @return The amount of token1 that can be obtained, or 0 if the swap fails.
 * @example
 * await sonicSwapAmountOut('qbizb-wiaaa-aaaaq-aabwq-cai', 'ryjl3-tyaaa-aaaaa-aaaba-cai', '1000000000000');
 */
async function sonicSwapAmountOut(t0, t1, amountIn) {
  /**
   * @notice Internal function to calculate the amount of output tokens for a given input amount and reserves.
   * @param amountIn The amount of input tokens.
   * @param reserveIn The reserve of input tokens in the pool.
   * @param reserveOut The reserve of output tokens in the pool.
   * @return A tuple containing the amount of output tokens and the actual amount used.
   */
  function getAmountOut(amountIn, reserveIn, reserveOut) {
    const actualAmount = (amountIn * 997n) / 1000n; // Apply a 0.3% fee.
    const amountInWithFee = amountIn * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;
    return [numerator / denominator, amountIn - actualAmount];
  }

  try {
    // Get the swap factory canister actor.
    let swapFactoryCanister = await artemisWalletAdapter.getCanisterActor(canistersIDs.SONIC_SWAP_FACTORY, sonicIdlFactory, true);

    // Get the pair details from the factory canister.
    const pairResult = await swapFactoryCanister.getPair(Principal.fromText(t0), Principal.fromText(t1));
    if (pairResult[0]) {
      // Extract pair data and reserves.
      const p = pairResult[0];
      const [reserveIn, reserveOut] = p.token0 === t0 ? [p.reserve0, p.reserve1] : [p.reserve1, p.reserve0];

      // Calculate the amount of output tokens.
      const [amountOut, _] = getAmountOut(BigInt(amountIn), BigInt(reserveIn), BigInt(reserveOut));
      console.log(amountOut);

      // Return the amount of token1.
      return Number(amountOut);
    } else {
      return 0;
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
}

/**
 * @notice This function retrieves the transaction history for a given user address.
 * @param userAddress The principal ID of the user whose transaction history is to be fetched.
 * @return The transaction history of the user.
 * @example
 * await getTxHistory('ryjl3-tyaaa-aaaaa-aaaba-cai');
 */
async function getTxHistory(userAddress) {
  // Create an actor to interact with the APPIC multiswap canister.
  let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_MULTISWAP, AppicMultiswapidlFactory, true);
  // Fetch the user's transaction history from the canister.
  let history = await AppicActor.getUserHistory(userAddress);
  // Log the fetched history for debugging purposes.
  console.log(history);
  // Return the user's transaction history.
  return history;
}

// Export the functions
export { icpSwapAmountOut, sonicSwapAmountOut, getTxHistory };


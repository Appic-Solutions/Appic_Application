import { icpSwapPools, icpSwapFactory, sonicIdlFactory } from '@/did';
import canistersIDs from '@/config/canistersIDs';
import { artemisWalletAdapter } from '@/utils/walletConnector';
async function icpSwapAmountOut(token0Address, token0Standard, token1Address, token1Standard, amountIn) {
  let swapFactoryCanister = await artemisWalletAdapter.getCanisterActor(canistersIDs.ICP_SWAP_FACTORY, icpSwapFactory, true);
  const token0 = { address: token0Address, standard: token0Standard };
  const token1 = { address: token1Address, standard: token1Standard };

  const poolArgs = { fee: 3000, token0, token1 };

  try {
    const poolResult = await swapFactoryCanister.getPool(poolArgs);

    if (poolResult.ok) {
      const poolData = poolResult.ok;
      let canID = new Principal(poolData.canisterId._arr).toString();
      const swapPoolCanister = await artemisWalletAdapter.getCanisterActor(canID, icpSwapPools, true);
      const zto = poolData.token0.address === token0Address;

      const swapArgs = {
        amountIn: amountIn.toString(),
        zeroForOne: zto,
        amountOutMinimum: '0',
      };

      const quoteResult = await swapPoolCanister.quote(swapArgs);
      console.log(quoteResult.ok);

      if (quoteResult.ok) {
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
async function sonicSwapAmountOut(t0, t1, amountIn) {
  function getAmountOut(amountIn, reserveIn, reserveOut) {
    const actualAmount = (amountIn * 997n) / 1000n;
    const amountInWithFee = amountIn * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;
    return [numerator / denominator, amountIn - actualAmount];
  }
  try {
    let swapFactoryCanister = await artemisWalletAdapter.getCanisterActor(canistersIDs.SONIC_SWAP_FACTORY, sonicIdlFactory, true);
    const pairResult = await swapFactoryCanister.getPair(Principal.fromText(t0), Principal.fromText(t1));
    if (pairResult[0]) {
      const p = pairResult[0];
      const [reserveIn, reserveOut] = p.token0 === t0 ? [p.reserve0, p.reserve1] : [p.reserve1, p.reserve0];
      const [amountOut, _] = getAmountOut(BigInt(amountIn), BigInt(reserveIn), BigInt(reserveOut));
      console.log(amountOut);
      return Number(amountOut);
    } else {
      return 0;
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
}

// Export the functions
export { icpSwapAmountOut, sonicSwapAmountOut };


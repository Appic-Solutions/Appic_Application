export const AppicMultiswapidlFactory = ({ IDL }) => {
  const TransferReceipt = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
  const TokenActor = IDL.Service({
    allowance: IDL.Func([IDL.Principal, IDL.Principal], [IDL.Nat], []),
    approve: IDL.Func([IDL.Principal, IDL.Nat], [TransferReceipt], []),
    balanceOf: IDL.Func([IDL.Principal], [IDL.Nat], []),
    decimals: IDL.Func([], [IDL.Nat8], []),
    name: IDL.Func([], [IDL.Text], []),
    symbol: IDL.Func([], [IDL.Text], []),
    totalSupply: IDL.Func([], [IDL.Nat], []),
    transfer: IDL.Func([IDL.Principal, IDL.Nat], [TransferReceipt], []),
    transferFrom: IDL.Func([IDL.Principal, IDL.Principal, IDL.Nat], [TransferReceipt], []),
  });
  const Subaccount = IDL.Vec(IDL.Nat8);
  const ICRCAccount = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(Subaccount),
  });
  const ICRCTransferArg = IDL.Record({
    to: ICRCAccount,
    from_subaccount: IDL.Opt(Subaccount),
    amount: IDL.Nat,
  });
  const ICRC1TokenActor = IDL.Service({
    icrc1_balance_of: IDL.Func([ICRCAccount], [IDL.Nat], []),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], []),
    icrc1_name: IDL.Func([], [IDL.Text], []),
    icrc1_symbol: IDL.Func([], [IDL.Text], []),
    icrc1_total_supply: IDL.Func([], [IDL.Nat], []),
    icrc1_transfer: IDL.Func([ICRCTransferArg], [TransferReceipt], []),
  });
  const ICRC2TransferArg = IDL.Record({
    to: ICRCAccount,
    from: ICRCAccount,
    amount: IDL.Nat,
  });
  const ICRC2TokenActor = IDL.Service({
    icrc1_balance_of: IDL.Func([ICRCAccount], [IDL.Nat], []),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], []),
    icrc1_name: IDL.Func([], [IDL.Text], []),
    icrc1_symbol: IDL.Func([], [IDL.Text], []),
    icrc1_total_supply: IDL.Func([], [IDL.Nat], []),
    icrc1_transfer: IDL.Func([ICRCTransferArg], [TransferReceipt], []),
    icrc2_allowance: IDL.Func([Subaccount, IDL.Principal], [IDL.Nat, IDL.Opt(IDL.Nat64)], []),
    icrc2_approve: IDL.Func([IDL.Opt(Subaccount), IDL.Principal, IDL.Nat], [TransferReceipt], []),
    icrc2_transfer_from: IDL.Func([ICRC2TransferArg], [TransferReceipt], []),
  });
  const TokenActorVariable = IDL.Variant({
    DIPtokenActor: TokenActor,
    ICRC1TokenActor: ICRC1TokenActor,
    ICRC2TokenActor: ICRC2TokenActor,
  });
  return IDL.Service({
    _getTokenActorWithType: IDL.Func([IDL.Text, IDL.Text], [TokenActorVariable], ['query']),
    changeFee: IDL.Func([IDL.Nat], [], []),
    changeOwner: IDL.Func([IDL.Principal], [], []),
    getSubAccount: IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
    icpSwapAmountOut: IDL.Func([IDL.Principal, IDL.Text, IDL.Principal, IDL.Text, IDL.Nat], [IDL.Nat], []),
    multiswap: IDL.Func(
      [
        IDL.Vec(IDL.Principal),
        IDL.Vec(IDL.Principal),
        IDL.Vec(IDL.Nat),
        IDL.Vec(IDL.Nat),
        IDL.Principal,
        IDL.Text,
        IDL.Vec(IDL.Text),
        IDL.Vec(IDL.Text),
        IDL.Principal,
      ],
      [],
      ['oneway']
    ),
    principalToBlobICPswap: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat8)], []),
    sonicSwapAmountOut: IDL.Func([IDL.Principal, IDL.Principal, IDL.Nat], [IDL.Nat], []),
    swapWithICPSwap: IDL.Func([IDL.Principal, IDL.Principal, IDL.Text, IDL.Text, IDL.Nat], [IDL.Nat], []),
    swapWithSonic: IDL.Func([IDL.Principal, IDL.Principal, IDL.Text, IDL.Nat], [IDL.Nat], []),
    withdrawTokens: IDL.Func([IDL.Text, IDL.Principal, IDL.Principal, IDL.Nat], [TransferReceipt], []),
    withdrawTransferICRC1: IDL.Func([IDL.Principal], [], []),
  });
};


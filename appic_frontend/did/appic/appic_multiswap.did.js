export const AppicMultiswapidlFactory = ({ IDL }) => {
  const ERR = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat,
    }),
    TemporarilyUnavailable: IDL.Null,
    InsufficientAllowance: IDL.Record({ allowance: IDL.Nat }),
    BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
    Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    AllowanceChanged: IDL.Record({ current_allowance: IDL.Nat }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    Expired: IDL.Record({ ledger_time: IDL.Nat64 }),
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
  });
  const TransferReceipt = IDL.Variant({ Ok: IDL.Nat, Err: ERR });
  const TokenActor = IDL.Service({
    allowance: IDL.Func([IDL.Principal, IDL.Principal], [IDL.Nat], []),
    approve: IDL.Func([IDL.Principal, IDL.Nat], [TransferReceipt], []),
    balanceOf: IDL.Func([IDL.Principal], [IDL.Nat], []),
    decimals: IDL.Func([], [IDL.Nat8], []),
    getTokenFee: IDL.Func([], [IDL.Nat], []),
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
    icrc1_fee: IDL.Func([], [IDL.Nat], []),
    icrc1_name: IDL.Func([], [IDL.Text], []),
    icrc1_symbol: IDL.Func([], [IDL.Text], []),
    icrc1_total_supply: IDL.Func([], [IDL.Nat], []),
    icrc1_transfer: IDL.Func([ICRCTransferArg], [TransferReceipt], []),
  });
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(Subaccount),
  });
  const ApproveArg = IDL.Record({ amount: IDL.Nat, spender: Account });
  const ICRC2TransferArg = IDL.Record({
    to: ICRCAccount,
    from: ICRCAccount,
    amount: IDL.Nat,
  });
  const ICRC2TokenActor = IDL.Service({
    icrc1_balance_of: IDL.Func([ICRCAccount], [IDL.Nat], []),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], []),
    icrc1_fee: IDL.Func([], [IDL.Nat], []),
    icrc1_name: IDL.Func([], [IDL.Text], []),
    icrc1_symbol: IDL.Func([], [IDL.Text], []),
    icrc1_total_supply: IDL.Func([], [IDL.Nat], []),
    icrc1_transfer: IDL.Func([ICRCTransferArg], [TransferReceipt], []),
    icrc2_allowance: IDL.Func([Subaccount, IDL.Principal], [IDL.Nat, IDL.Opt(IDL.Nat64)], []),
    icrc2_approve: IDL.Func([ApproveArg], [TransferReceipt], []),
    icrc2_transfer_from: IDL.Func([ICRC2TransferArg], [TransferReceipt], []),
  });
  const TokenActorVariable = IDL.Variant({
    DIPtokenActor: TokenActor,
    ICRC1TokenActor: ICRC1TokenActor,
    ICRC2TokenActor: ICRC2TokenActor,
  });
  const TxHistory = IDL.Record({
    n1: IDL.Nat,
    n2: IDL.Nat,
    p2: IDL.Text,
    p3: IDL.Text,
    time: IDL.Int,
    txStatus: IDL.Text,
  });
  return IDL.Service({
    _getTokenActorWithType: IDL.Func([IDL.Text, IDL.Text], [TokenActorVariable], ['query']),
    changeFee: IDL.Func([IDL.Nat], [], []),
    changeOwner: IDL.Func([IDL.Principal], [], []),
    getICRC1SubAccount: IDL.Func([IDL.Principal], [Subaccount], ['query']),
    getTxNumber: IDL.Func([], [IDL.Nat], ['query']),
    getTxStatus: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    getUserHistory: IDL.Func([IDL.Text], [IDL.Vec(TxHistory)], ['query']),
    getUserPrincipal: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    icpSwap: IDL.Func([IDL.Principal, IDL.Principal, IDL.Text, IDL.Text, IDL.Nat], [IDL.Nat], []),
    icpSwapAmountOut: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [IDL.Nat], []),
    singleComparedSwap: IDL.Func([IDL.Principal, IDL.Principal, IDL.Text, IDL.Text, IDL.Nat], [IDL.Nat], []),
    sonicSwap: IDL.Func([IDL.Principal, IDL.Principal, IDL.Text, IDL.Text, IDL.Nat], [IDL.Nat], []),
    sonicSwapAmountOut: IDL.Func([IDL.Principal, IDL.Principal, IDL.Nat], [IDL.Nat], []),
    swapWithMidToken: IDL.Func([IDL.Principal, IDL.Principal, IDL.Principal, IDL.Nat, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    withdrawTransferICRC1: IDL.Func([IDL.Principal], [], []),
  });
};


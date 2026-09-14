import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  aixBalance: '0',
  ethBalance: '0',
  error: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    connectStart: (state) => {
      state.isConnecting = true;
      state.error = null;
    },
    connectSuccess: (state, action) => {
      const { address, chainId, aixBalance, ethBalance } = action.payload;
      state.address = address;
      state.chainId = chainId || null;
      state.aixBalance = aixBalance || '0';
      state.ethBalance = ethBalance || '0';
      state.isConnected = true;
      state.isConnecting = false;
      state.error = null;
    },
    connectFailure: (state, action) => {
      state.error = action.payload;
      state.isConnecting = false;
    },
    disconnectWallet: (state) => {
      state.address = null;
      state.chainId = null;
      state.isConnected = false;
      state.isConnecting = false;
      state.aixBalance = '0';
      state.ethBalance = '0';
      state.error = null;
    },
    updateBalances: (state, action) => {
      const { aixBalance, ethBalance } = action.payload;
      if (aixBalance !== undefined) state.aixBalance = aixBalance;
      if (ethBalance !== undefined) state.ethBalance = ethBalance;
    },
    setChainId: (state, action) => {
      state.chainId = action.payload;
    },
  },
});

export const {
  connectStart,
  connectSuccess,
  connectFailure,
  disconnectWallet,
  updateBalances,
  setChainId,
} = walletSlice.actions;

export default walletSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface streamState {
    apiKey: string
    token: string
}

const initialState: streamState = {
    apiKey: 'no key',
    token: 'no token'
};

export const streamSlice = createSlice({
    name: 'stream',
    initialState,
    reducers: {
        setCurrentAPIKey: (state, action: PayloadAction<string>) => {
            state.apiKey = action.payload;
        },
        setCurrentToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        }
    }
});

export const { setCurrentAPIKey, setCurrentToken } = streamSlice.actions;
export const getCurrentAPIKey = (state: RootState) => state.stream.apiKey;
export const getCurrentToken = (state: RootState) => state.stream.token;
export default streamSlice.reducer;
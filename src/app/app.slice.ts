import { createSlice, createEntityAdapter, createAsyncThunk, type EntityState } from '@reduxjs/toolkit';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { RootState } from './store';

export type Breed = {
  label: string;
  subs: string[];
};

export type Option = {
  id: string;
  breed: Breed | null;
  sub: string | null;
  count: number;
};

type AppState = {
  open: boolean;
  loading: boolean;
  breeds: Breed[];
  options: EntityState<Option>;
  images: string[];
};

const optionsAdapter = createEntityAdapter<Option>();
const optionsSelector = optionsAdapter.getSelectors();

export const { selectAll: getOptions } = optionsSelector;

export const fetchBreeds = createAsyncThunk('app/fetchBreeds', () => {
  return axios.get('https://dog.ceo/api/breeds/list/all').then((res: any) => res.data.message);
});

export const generate = createAsyncThunk<any, void, { state: RootState }>('app/generate', (_, thunkAPI) => {
  const options = getOptions(thunkAPI.getState().app.options);
  const promises = options.map(({ breed, sub, count }) => {
    if (sub === null) {
      return axios.get(`https://dog.ceo/api/breed/${breed?.label}/images/random/${count}`);
    }

    return axios.get(`https://dog.ceo/api/breed/${breed?.label}/${sub}/images/random/${count}`);
  });

  return Promise.all(promises);
});

const appSlice = createSlice({
  name: 'app',
  initialState: {
    open: false,
    loading: false,
    breeds: [],
    options: optionsAdapter.getInitialState(),
    images: [],
  } as AppState,
  reducers: {
    closeModal: (state) => {
      state.open = false;
    },
    addOption: (state, action) => {
      optionsAdapter.addOne(state.options, {
        ...action.payload,
        id: uuidv4(),
      });
    },
    removeOption: (state, action) => {
      optionsAdapter.removeOne(state.options, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBreeds.fulfilled, (state, action) => {
      state.breeds = Object.keys(action.payload).map((key) => ({
        label: key,
        subs: action.payload[key],
      }));
    });

    builder.addCase(generate.pending, (state) => {
      state.loading = true;
      state.open = true;
    });

    builder.addCase(generate.fulfilled, (state, action) => {
      state.loading = false;
      state.images = action.payload.map((promise: any) => promise.data.message).flat();
    });
  },
});

export const { closeModal, addOption, removeOption } = appSlice.actions;

export default appSlice.reducer;

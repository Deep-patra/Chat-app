import { createStore } from 'redux';
import reducer from './reducer';

const store = createStore(reducer);

store.subscribe(() => console.log("changes are made in the store!"));

export default store;

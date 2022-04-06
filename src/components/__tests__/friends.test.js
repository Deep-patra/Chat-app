import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { CHANGE_FRIEND_LIST } from '../../store/action';
import Friends from '../Friends/friends';
import { render, screen, cleanup } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/:userId/friends', (req, res, ctx) => {
    return ctx.json({ friends: [
      {
        name: 'XYZ',
        profilePicture: 'yauhd'
      },
      {
        name: 'ABC',
        profilePicture: 'shfdfkf',
      }
    ] });
  }),
);

const initialState = {
  userId: '124566',
  friends: [],
};

const reducer = (state, action) => {
  const { type, friends } = action;
  if (type === CHANGE_FRIEND_LIST) {
    return { ...initialState, friends };
  }
  return { ...initialState };
}

const store = createStore(reducer);

beforeAll(() => server.listen());
afterEach(() => { server.resetHandlers(); cleanup(); });
afterAll(() => server.close());

test('Testing the friends component', () => {
  const { container } = render(
    <Provider store={store}>
      <Friends/>
    </Provider>
  );

  expect(container).toMatchSnapshot();
});


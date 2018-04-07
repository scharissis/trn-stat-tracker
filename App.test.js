import "react-native";
import React from 'react';
import App from './App';

import renderer from 'react-test-renderer';

it('renders without crashing', () => {
  const rendered = renderer.create(<App />);
  expect(rendered).toBeTruthy();
  expect(rendered).toMatchSnapshot();
});

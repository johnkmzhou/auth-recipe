import React, { Component } from 'react';
import { Provider } from 'react-redux';

import './App.css';
import { createInitialStore } from './firebase';
import LoginPage from './LoginPage';

class App extends Component {
  constructor(props) {
    super(props);
    this.store = createInitialStore();
  }
  render() {
    return (
      <Provider store={this.store}>
        <LoginPage />
      </Provider>
    );
  }
}

export default App;

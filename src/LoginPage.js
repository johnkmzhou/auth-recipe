import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
// import GoogleButton from 'react-google-button' // optional

export class LoginPage extends Component {
  getProviderForProviderId = (providerId) => {
    if (providerId === 'google.com') {
      return { provider: 'google', type: 'redirect' };
    } else if (providerId === 'facebook.com') {
      return { provider: 'facebook', type: 'redirect' };
    }
  };

  componentDidMount() {
    const pendingCred = JSON.parse(localStorage.getItem('pendingCred'));
    if (pendingCred) {
      this.props.firebase.auth().getRedirectResult()
        .then((result) => {
          console.log('Pending credentials.');
          console.log(result);
          console.log(pendingCred);
          const token = this.props.firebase.auth.FacebookAuthProvider.credential(pendingCred);
          result.user.linkWithCredential(token);
        });
      localStorage.removeItem('pendingCred');
    } else {
      this.props.firebase.auth().getRedirectResult()
        .then((result) => {
          console.log('No pending credentials.');
          console.log(result);
        })
        .catch((error) => {
          console.log(error);
          if (error.code === 'auth/account-exists-with-different-credential') {
            localStorage.setItem('pendingCred', JSON.stringify(error.credential));
            const email = error.email;
            this.props.firebase.auth().fetchProvidersForEmail(email)
              .then((providers) => {
                if (providers[0] === 'password') {
                  // prompt user for password
                  console.log(providers);
                  return;
                } else {
                  const provider = this.getProviderForProviderId(providers[0]);
                  this.props.firebase.login(provider);
                }
              });
          }
        });
    }
  }

  render() {
    return (
      <div>
        <button // <GoogleButton/> button can be used instead
          onClick={() => this.props.firebase.login({ provider: 'google', type: 'redirect' })}>
          Login With Google</button>
        <button onClick={() => this.props.firebase.login({ provider: 'facebook', type: 'redirect' })}>
          Login with Facebook</button>
        <button onClick={() => this.props.firebase.logout()}>Logout</button>
        <div>
          <h2>Auth</h2>
          {
            !isLoaded(this.props.auth)
              ? <span>Loading...</span>
              : isEmpty(this.props.auth)
                ? <span>Not Authed</span>
                : <pre>{JSON.stringify(this.props.auth, null, 2)}</pre>
          }
        </div>
      </div>
    )
  };
};

LoginPage.propTypes = {
  firebase: PropTypes.shape({
    login: PropTypes.func.isRequired
  }),
  auth: PropTypes.object
};

export default compose(
  firebaseConnect(), // withFirebase can also be used
  connect(({ firebase: { auth } }) => ({ auth }))
)(LoginPage);
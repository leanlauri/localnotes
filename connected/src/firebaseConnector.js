/**
 * @flow
 */
import config from './firebaseConfig.json';

declare var firebase: any;

type Status = 'none' | 'initialised' | 'init_failed';

let status: Status = 'none';
const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: 'http://localhost:3000/finishLogin/',
    //url: 'https://www.example.com/finishSignUp?cartId=1234',
    // This must be true.
    handleCodeInApp: true,
    // iOS: {
    //   bundleId: 'com.example.ios'
    // },
    // android: {
    //   packageName: 'com.example.android',
    //   installApp: true,
    //   minimumVersion: '12'
    // },
    // dynamicLinkDomain: 'example.page.link'
};

function init() {
    if (firebase) {
        console.log('Initialising Firebase');
        firebase.initializeApp(config);
        status = 'initialised';
    } else {
        console.log('Firebase script not loaded. Cannot initialise.');
        status = 'init_failed';
    }
}

function connect(): boolean {
    if (status === 'none') init();
    if (status === 'init_failed') return false;

    return true;
}

// const createActionCodeSettings = (sessionId: string) => ({
//     ...actionCodeSettingsBase,
//     url:  actionCodeSettingsBase.url + sessionId,
// });

function startLogin(email: string): Promise {
    if (status !== 'initialised') init();

    return firebase
        .auth()
        .sendSignInLinkToEmail(email, actionCodeSettings);
        // .then(function() {
        //     // The link was successfully sent. Inform the user.
        //     // Save the email locally so you don't need to ask the user for it again
        //     // if they open the link on the same device.
        //     window.localStorage.setItem('emailForSignIn', email);
        // })
        // .catch(function(error) {
        //     // Some error occurred, you can inspect the code: error.code
        // });
}

// const address = window.location.href;
function finishLogin(address: string, email: string): Promise {
    // Confirm the link is a sign-in with email link.
    if (firebase.auth().isSignInWithEmailLink(address)) {
        // Additional state parameters can also be passed via URL.
        // This can be used to continue the user's intended action before triggering
        // the sign-in operation.
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        // var email = window.localStorage.getItem('emailForSignIn');
        // if (!email) {
        // // User opened the link on a different device. To prevent session fixation
        // // attacks, ask the user to provide the associated email again. For example:
        // email = window.prompt('Please provide your email for confirmation');
        // }
        // The client SDK will parse the code from the link for you.
        return firebase
            .auth()
            .signInWithEmailLink(email, window.location.href);
            // .then(function(result) {
            //     // Clear email from storage.
            //     window.localStorage.removeItem('emailForSignIn');
            //     // You can access the new user via result.user
            //     // Additional user info profile not available via:
            //     // result.additionalUserInfo.profile == null
            //     // You can check if the user is new or existing:
            //     // result.additionalUserInfo.isNewUser
            // })
            // .catch(function(error) {
            //     // Some error occurred, you can inspect the code: error.code
            //     // Common errors could be invalid email and invalid or expired OTPs.
            // });
    } else {
        return new Promise((resolve, reject) => {
            reject(new Error('Address is not a valid login link'));
        });
    }
}

function logout(): Promise {
    return firebase.auth().signOut();
}

export default {
    connect,
    startLogin,
    finishLogin,
    logout,
};

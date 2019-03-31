/**
 * @flow
 */
import config from './firebaseConfig.json';

declare var firebase: any;

type Status = 'none' | 'initialised' | 'init_failed';

let status: Status = 'none';
const actionCodeSettingsBase = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: 'http://localhost/finishLogin?sessionId=',
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

const createActionCodeSettings = (sessionId: string) => ({
    ...actionCodeSettingsBase,
    url:  actionCodeSettingsBase.url + sessionId,
});

function login(email: string): Promise {
    if (status !== 'initialised') init();

    const settings = createActionCodeSettings('12345');
    return firebase
        .auth()
        .sendSignInLinkToEmail(email, settings);
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

export default {
    connect,
    login,
};

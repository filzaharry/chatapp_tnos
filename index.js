// /**
//  * @format
//  */

// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);

/**
 * @format
 */
import * as React from 'react';
import {AppRegistry} from 'react-native';
import { Provider } from 'react-redux';
import App from './App';
import {name as appName} from './app.json';
import store from './app/Redux/Store'
import messaging from '@react-native-firebase/messaging';


messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

const provider = () =>{
    return(
        <Provider store={store} >
            <App />
        </Provider>
    )
}
AppRegistry.registerComponent(appName, () => provider);
// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow strict-local
//  */
// import DocumentPicker, {
//   DirectoryPickerResponse,
//   DocumentPickerResponse,
//   isCancel,
//   isInProgress,
//   types,
// } from 'react-native-document-picker'
// import React from 'react';
// import {Node} from 'react';
// import {
//   Button,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
// } from 'react-native';

// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';

// /* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
//  * LTI update could not be added via codemod */
// const Section = ({children, title}) => {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Button
//         title="open picker for multi file selection"
//         onPress={() => {
//           console.log('asd');

//           DocumentPicker.pick({ allowMultiSelection: true }).then(setResult).catch()
//         }}
//       />
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// };

// const App = () => {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   return (
//     <SafeAreaView style={backgroundStyle}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <ScrollView
//         contentInsetAdjustmentBehavior="automatic"
//         style={backgroundStyle}>
//         <Header />
//         <View
//           style={{
//             backgroundColor: isDarkMode ? Colors.black : Colors.white,
//           }}>
//           <Section title="Step One">
//             Edit <Text style={styles.highlight}>App.js</Text> to change this
//             screen and then come back to see your edits.
//           </Section>
//           <Section title="See Your Changes">
//             <ReloadInstructions />
//           </Section>
//           <Section title="Debug">
//             <DebugInstructions />
//           </Section>
//           <Section title="Learn More">
//             Read the docs to discover what to do next:
//           </Section>
//           <LearnMoreLinks />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });

// export default App;

import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import AppStack from './app/Navigation/AppStack';
import AuthStack from './app/Navigation/AuthStack';
import {COLORS} from './app/Component/Constant/Color';
import Navigation from './app/Service/Navigation';
import Auth from './app/Service/Auth';
import {useDispatch, useSelector} from 'react-redux';
import {setUser} from './app/Redux/reducer/user';
import {NativeBaseProvider, extendTheme} from 'native-base';
import { SSRProvider } from '@react-aria/ssr';


const Stack = createStackNavigator();
// const newColorTheme = {
//   brand: {
//     900: '#5B8DF6',
//     800: '#ffffff',
//     700: '#cccccc',
//   },
// };

// const theme = extendTheme({
//   colors: newColorTheme,
// });

export default function App() {
  const dispatch = useDispatch();

  const {userData, login} = useSelector(state => state.User);

  const [loginChk, setloginChk] = useState(true);


  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    let data = await Auth.getAccount();
    console.log('login ======', login);
    console.log('dataa ======', data);
    if (data != null) {
      dispatch(setUser(data));
      setloginChk(false);
    } else {
      setloginChk(false);
    }
  };

  if (loginChk) {
    return null;
  }

  return (
    <SSRProvider> 
    <NativeBaseProvider>
      <NavigationContainer ref={r => Navigation.setTopLevelNavigator(r)}>
        <Stack.Navigator
          detachInactiveScreens={false}
          initialRouteName="Auth"
          screenOptions={{
            cardStyle: {backgroundColor: COLORS.white},
            gestureEnabled: true,
            backgroundColor: COLORS.button,
            gestureDirection: 'horizontal',
            headerShown:false,
            ...TransitionPresets.SlideFromRightIOS,
          }}>
          {!login ? (
            <Stack.Screen name="Auth" component={AuthStack} />
            ) : (
            // <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="AppStack" component={AppStack} />
          )}
          {/* <Stack.Screen name="Auth" component={AuthStack} /> : */}
          {/* <Stack.Screen name="AppStack" component={AppStack} />  */}
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
    </SSRProvider> 
  );
}

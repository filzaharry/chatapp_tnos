import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { COLORS } from '../Component/Constant/Color';
import Home from '../Screen/Home';
import AllUser from '../Screen/User/AllUser';
import AllOptions from '../Screen/AllOptions/AllOptions';
import SingleChatMitra from '../Screen/Chat/SingleChatMitra';
import SingleChatUser from '../Screen/Chat/SingleChatUser';
import InvoiceChat from '../Screen/Chat/InvoiceChat';
import PreviewImage from '../Screen/Chat/PreviewImage';
import PreviewPdf from '../Screen/Chat/PreviewPdf';
import HomeMitraDetail from '../Screen/Home/indexDetailUser';
import PreviewAllFile from '../Screen/Chat/PreviewAllFile';
import OpenImgInChat from '../Screen/Chat/OpenImgInChat';
const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator 
    screenOptions={{
      // cardStyle :{ backgroundColor: COLORS.button},
      gestureEnabled: true,
      // backgroundColor:COLORS.button,
      headerShown:false,
      gestureDirection: 'horizontal',
      ...TransitionPresets.SlideFromRightIOS,
    }}
    initialRouteName="Home" headerShown="false">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="HomeMitraDetail" component={HomeMitraDetail} />
        <Stack.Screen name="AllUser" component={AllUser} />
        <Stack.Screen name="AllOptions" component={AllOptions} />
        <Stack.Screen name="SingleChatMitra" component={SingleChatMitra} />
        <Stack.Screen name="SingleChatUser" component={SingleChatUser} />
        <Stack.Screen name="InvoiceChat" component={InvoiceChat} />
        <Stack.Screen name="PreviewImage" component={PreviewImage} />
        <Stack.Screen name="PreviewPdf" component={PreviewPdf} />
        <Stack.Screen name="PreviewAllFile" component={PreviewAllFile} />
        <Stack.Screen name="OpenImgInChat" component={OpenImgInChat} />
    </Stack.Navigator>
  );
}

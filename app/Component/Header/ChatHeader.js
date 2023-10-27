// //import liraries
// import {Icon} from 'native-base';
// import React, {Component, useEffect, useState} from 'react';
// import {View, Text, StyleSheet, Image, StatusBar, Platform, TouchableOpacity} from 'react-native';
// import moment from 'moment';
// import {COLORS} from '../Constant/Color';
// import {FONTS} from '../Constant/Font';
// import {Avatar} from 'react-native-elements/dist/avatar/Avatar';
// import Navigation from '../../Service/Navigation';

// // create a component
// const ChatHeader = props => {
//   const {data} = props;
//   console.log('cht saa', data);

//   const [lastSeen, setlastSeen] = useState('');

//   return (
//     <View style={styles.container}>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor={COLORS.theme}
//         translucent={false}
//       />
//       <Icon
//         style={{
//           marginHorizontal: 10,
//           color: COLORS.black,
//         }}
//         name="chevron-back"
//         type="Ionicons"
//         onPress={() => Navigation.back()}
//       />
//       {data.img != '' ? (
//         <Avatar
//           source={require('../../Assets/user-icon.png')}
//           rounded
//           size="small"
//         />
//       ) : (
//         <Avatar source={{uri: data.img}} rounded size="small" />
//       )}

//       <View style={{flex: 1, marginLeft: 10}}>
//         <Text
//           numberOfLines={1}
//           style={{
//             color: COLORS.black,
//             fontSize: 16,
//             fontFamily: FONTS.SemiBold,
//             textTransform: 'capitalize',
//           }}>
//           {data.name}
//         </Text>
//         {/* parameter status isMitra or isConsument */}
//         {data.role == 'user' && (
//           <Text
//             style={{
//               color: COLORS.black,
//               fontSize: 10,
//               fontFamily: FONTS.Regular,
//             }}>
//             Chat Legal Consultant
//           </Text>
//         )}
//       </View>

//       <TouchableOpacity
//       onPress={() => setModalVisible(true)}
//         style={{
//             height: 24,
//             width: 24,
//             borderRadius: 40,
//             backgroundColor: COLORS.orangeBgIcon,
//             alignItems: 'center',
//             justifyContent: 'center',
//             marginBottom: 5,
//             marginRight: 20,
//             marginHorizontal: 10,
//             color: COLORS.black,
//         }}>
//         <Text style={{fontSize:14, fontWeight:'bold', color:COLORS.white}}>?</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // define your styles
// const styles = StyleSheet.create({
//   container: {
//     height: 70,
//     backgroundColor: COLORS.white,
//     elevation: 5,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
// });

// //make this component available to the app
// export default ChatHeader;

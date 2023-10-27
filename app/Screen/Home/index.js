import {CircleIcon, Container, Icon, SearchIcon, View} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  FlatList,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {ListItem, Avatar} from 'react-native-elements';
import {COLORS} from '../../Component/Constant/Color';
import {FONTS} from '../../Component/Constant/Font';
import HomeHeader from '../../Component/Header/HomeHeader';
import Navigation from '../../Service/Navigation';
import {useSelector} from 'react-redux';
import database from '@react-native-firebase/database';
import SimpleToast from 'react-native-simple-toast';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import NotificationService from '../../Service/Notification';

const listData = [
  {
    name: 'Personal',
    img: '',
    about: 'Lakukan chat secara personal dengan mitra kami',
    category: 'personal',
    lastMsg: '123',
  },
  {
    name: 'Corporate',
    img: '',
    about: 'Konsultasikan Perusahaan Anda dengan mitra kami',
    category: 'corp',
    lastMsg: '123',
  },
];

const Home = () => {
  const {userData} = useSelector(state => state.User);
  const [chatList, setchatList] = useState([]);
  const [allUser, setAllUser] = useState([]);

  

  useEffect(() => {
    getFCMToken();
    requestPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('remoteMessage --->>>', JSON.stringify(remoteMessage));
      DisplayNotification(remoteMessage);
    });

    return unsubscribe;
  }, []);

  const getFCMToken = () => {
    messaging().getToken().then(token => {
      console.log('tokeennn ====>>>>', token);
      let tokenFcm = {
        tokenFcm: token,
      };

      database()
        .ref('/users/' + userData?.id)
        .update(tokenFcm)
        .then(() => console.log('FCM Token Updated.'));
    })
  }

  const requestPermission = async () => {
  await messaging().requestPermission();
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }
  };

  async function DisplayNotification(remoteMessage) {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
    const dataRes = await notifee.displayNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
      },
    });
  }

 
  useEffect(() => {
    chatListUpdate();
  }, []);

  const chatListUpdate = async () => {
    let routePath;
    if (userData?.role == 'mitra') {
      routePath = '/chatlist';
      database()
        .ref('users')
        .on('value', snapshot => {
          const dataUser = Object.values(snapshot.val()).filter(function (el) {
            return el.role == 'user';
          });
          setAllUser(dataUser);
        });
    } else if (userData?.role == 'user') {
      routePath = '/chatlist/' + userData?.id;
      database()
        .ref(routePath)
        .on('value', snapshot => {
          if (snapshot.val() == null) {
            setchatList([]);
          } else {
            // console.log('User data: ', Object.values(snapshot.val()));
            setchatList(Object.values(snapshot.val()));
          }
        });
    }
  };

  // const gotoRoom = data => {
  //   if (userData?.role == 'mitra') {
  //     if (data.isMitraId == '' || data.isMitraId == userData?.id) {
  //       let mitraData = {
  //         isMitraId: userData?.id,
  //         isMitraName: userData?.name,
  //       };

  //       // console.log('RECEIVER DATA ===>', receiverData);
  //       database()
  //         .ref('/chatlist/' + data.id + '/' + data.category)
  //         .update(mitraData)
  //         .then(() => {
  //           Navigation.navigate('SingleChatMitra', {
  //             receiverData: data,
  //             mitraId: userData?.id,
  //           });
  //         });
  //     } else {
  //       Alert.alert('Sudah Ada Mitra Di Sesi Ini', [
  //         {
  //           text: 'Tutup',
  //           onPress: () => console.log('Tutup Pressed'),
  //         },
  //       ]);
  //       return false;
  //     }
  //   } else {
  //     //check status ny close atau open
  //     // jika open maka langsung masuk
  //     // jika close maka buat orderId baru

  //     let mitraData = {
  //       isMitraId: userData?.id,
  //       isMitraName: userData?.name,
  //     };
  //     database()
  //       .ref('/chatlist/' + data.id + '/' + data.category)
  //       .update(mitraData)
  //       .then(() => {
  //         Navigation.navigate('SingleChatUser', {
  //           receiverData: data,
  //           mitraId: '',
  //         });
  //       });
  //   }
  // };

  const renderItem = ({item}) => (
    <ListItem
      containerStyle={{paddingVertical: 8, marginVertical: 0}}
      onPress={() => {
        if (item.status == 2) {
          Alert.alert(
            'Perhatian',
            'Anda sudah mengakhiri sesi ini, Apakah Anda ingin memulai kembali ?',
            [
              {
                text: 'Ya',
                onPress: () => {
                  // console.log('12312312312');
                  let myData = {
                    isMitraId: '',
                    isMitraName: '',
                    isUserReply: false,
                    status: 0, //chatlist is open
                  };

                  database()
                    .ref('/chatlist/' + userData.id + '/' + item.category)
                    .update(myData)
                    .then(() => console.log('Data updated.'));

                  SimpleToast.show('Memulai Konsultasi Mohon Tunggu ...');
                  Navigation.navigate('SingleChatUser', {
                    receiverData: item,
                    mitraId: '',
                  });
                },
              },
              {
                text: 'Tutup',
                onPress: () => console.log('Tutup Pressed'),
              },
            ],
          );
          return false;
        } else {
          if (userData?.role == 'user') {
            // gotoRoom(item)
            Navigation.navigate('SingleChatUser', {
              receiverData: item,
              mitraId: '',
            });
          } else {
            Navigation.navigate('HomeMitraDetail', {userDetail: item});
          }
        }
      }}>
        <Avatar
          source={require('../../Assets/user-icon.png')}
          rounded
          size="small"
        />

      <ListItem.Content>
        {userData.role == 'user' ? (
          <>
            <ListItem.Title style={{fontFamily: FONTS.Medium, fontSize: 14}}>
              {item.category + ' - ' + item.orderBatch}
            </ListItem.Title>
            {item.msgType == 'img' ? (
              <ListItem.Subtitle
                style={{fontFamily: FONTS.Regular, fontSize: 8}}
                numberOfLines={1}>
                <View style={{flexDirection: 'row'}}>
                  <CircleIcon
                    // name="image"
                    // type="FontAwesome5"
                    mt="0.5"
                    color="emerald.500"
                    // style={{color: COLORS.orangeBgIcon, marginRight: 10}}
                  />
                  <Text style={{color: COLORS.black}}> Foto</Text>
                </View>
              </ListItem.Subtitle>
            ) : item.msgType == 'file' ? (
              <ListItem.Subtitle
                style={{fontFamily: FONTS.Regular, fontSize: 8}}
                numberOfLines={1}>
                <View style={{flexDirection: 'row'}}>
                  <CircleIcon
                    mt="0.5"
                    color="red.500"
                    // style={{color: COLORS.orangeBgIcon, marginRight: 10}}
                  />
                  <Text style={{color: COLORS.black}}> Dokumen</Text>
                </View>
              </ListItem.Subtitle>
            ) : (
              <ListItem.Subtitle
                style={{fontFamily: FONTS.Regular, fontSize: 12}}
                numberOfLines={1}>
                {item.lastMsg == ''
                  ? item.status == 2
                    ? 'Livechat ditutup'
                    : 'Belum ada chat'
                  : item.lastMsg}
              </ListItem.Subtitle>
            )}
          </>
        ) : (
          <>
            <ListItem.Title style={{fontFamily: FONTS.Medium, fontSize: 14}}>
              {item.name}
            </ListItem.Title>
            <ListItem.Subtitle
              style={{fontFamily: FONTS.Regular, fontSize: 12}}
              numberOfLines={1}>
              {item.id}
            </ListItem.Subtitle>
          </>
        )}
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <HomeHeader />

      {userData.role == 'user' ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          data={chatList}
          renderItem={renderItem}
        />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          data={allUser}
          renderItem={renderItem}
        />
      )}

      {userData.role == 'user' ? (
        chatList.length == 2 ? (
          <></>
        ) : (
          <TouchableOpacity
            style={styles.but}
            onPress={() => Navigation.navigate('AllOptions')}>
            <SearchIcon style={{color: COLORS.white, fontSize: 20}} />
          </TouchableOpacity>
        )
      ) : (
        // <TouchableOpacity
        //   style={styles.but}
        //   onPress={() => Navigation.navigate('AllUser')}>
        //   <Icon
        //     name="users"
        //     type="FontAwesome5"
        //     style={{color: COLORS.white, fontSize: 20}}
        //   />
        // </TouchableOpacity>
        <View></View>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  but: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.theme,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});

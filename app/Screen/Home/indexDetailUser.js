import {CircleIcon, Container, Icon, SearchIcon, View} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
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
import moment from 'moment';

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

const HomeMitraDetail = props => {
  const {userData} = useSelector(state => state.User);
  const {userDetail} = props.route.params;
  const [chatList, setchatList] = useState([]);

  useEffect(() => {
    chatListUpdate();
  }, []);

  const chatListUpdate = async () => {
    let routePath;
    routePath = '/chatlist/' + userDetail?.id;
    console.log(routePath);
    database()
      .ref(routePath)
      .on('value', snapshot => {
        console.log(snapshot.val());
        if (snapshot.val() == null) {
          setchatList([]);
        } else {
          // console.log('User data: ', Object.values(snapshot.val()));
          setchatList(Object.values(snapshot.val()));
        }
      });
  };

  const gotoRoom = data => {
    // console.log('yooooooooo');
    // console.log(data.isMitraId);
    // console.log('yooooooooo');
    // console.log(userData.id);
    // console.log('yooooooooo');
    if (data.isMitraId == '' || data.isMitraId == userData?.id) {
      let mitraData = {
        isMitraId: userData?.id,
        isMitraName: userData?.name,
        orderBatch:
          data.isMitraId == '' ? data.orderBatch + 1 : data.orderBatch,
        transactionId: moment().format('x'),
        status: 1, // status is handle of mitra
        // orderBatch: data.status ==
      };

      // console.log('RECEIVER DATA ===>', receiverData);
      database()
        .ref('/chatlist/' + data.id + '/' + data.category)
        .update(mitraData)
        .then(() => {
          Navigation.navigate('SingleChatMitra', {
            receiverData: data,
            mitraId: userData?.id,
          });
        });
    } else {
      Alert.alert('Perhatian', 'Sudah Ada Mitra Di Sesi Ini', [
        {
          text: 'Tutup',
          onPress: () => console.log('Tutup Pressed'),
        },
      ]);
      return false;
    }
  };

  const renderItem = ({item}) => (
    <ListItem
      containerStyle={{paddingVertical: 8, marginVertical: 0}}
      onPress={() => {
        console.log('123123');
        if (item.status == 2) {
          Alert.alert('Informasi', 'Chat ini sudah kadaluwarsa', [
            {
              text: 'Tutup',
              onPress: () => console.log('Tutup Pressed'),
            },
          ]);
          return false;
        } else {
          gotoRoom(item)
        }
      }}>
      <Avatar
        source={require('../../Assets/user-icon.png')}
        rounded
        size="small"
      />

      <ListItem.Content>
        <ListItem.Title
          style={
            item.isMitraName == ''
              ? {
                  fontFamily: FONTS.Medium,
                  fontSize: 14,
                  fontStyle: 'italic',
                }
              : {
                  fontFamily: FONTS.Medium,
                  fontSize: 14,
                }
          }>
          {item.isMitraName == ''
            ? item.status == 2
              ? item.category + '-' + item.userName
              : item.category + ' : Menunggu Konsultasi ...'
            : item.category + '-' + item.userName}
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
              <Text style={{color:COLORS.black}}> Foto</Text>
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
              <Text style={{color:COLORS.black}}> Dokumen</Text>
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
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {chatList.length == 0 ? (
        <View
          style={{
            marginTop: 200,
            alignSelf: 'center',
            flexDirection: 'column',
          }}>
          <Text style={{color:COLORS.black}}>Belum Ada Request Konsultasi</Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          data={chatList}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default HomeMitraDetail;

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

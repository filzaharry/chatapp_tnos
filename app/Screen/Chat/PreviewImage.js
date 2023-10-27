import {
  View,
  Text,
  Image,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../Component/Constant/Color';
import {ChevronLeftIcon, Icon, PlayIcon} from 'native-base';
import {FONTS} from '../../Component/Constant/Font';
import Navigation from '../../Service/Navigation';
import SimpleToast from 'react-native-simple-toast';
import {forEach} from 'lodash';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import moment from 'moment';

const {width} = Dimensions.get('window');

const PreviewImage = props => {
  const {receiverData, userData, imageData, getIdOrderChat, category, roomId} =
    props.route.params;
  const [caption, setCaption] = useState('');
  const [disabled, setdisabled] = useState(false);
  const urlMedia = 'https://firebasestorage.googleapis.com/v0/b/chatapp-bc4ce.appspot.com/o/chatMedia'

  const uploadImgNCaption = async () => {
    const sumSizeImg = imageData.reduce((accumulator, object) => {
      return accumulator + object.size;
    }, 0);

    // validasi maksimal foto 5 biji
    if (imageData.length >= 5) {
      Alert.alert('Upload Foto / Gambar Gagal', 'Jumlah Lebih dari 5 Foto / Gambar', [
        {text: 'Tutup', onPress: () => console.log('Tutup Pressed')},
      ]);
      return false;
    } else if (sumSizeImg >= 3000000) {
      // validasi ukuran maksimum semua foto 3 mb
      Alert.alert('Upload Foto / Gambar Gagal', 'Ukuran Semua Image Lebih dari 3 MB', [
        {text: 'Tutup', onPress: () => console.log('Tutup Pressed')},
      ]);
      return false;
    } else if (caption == '') {
      // validasi caption masih kosong
      Alert.alert('Upload Foto / Gambar Gagal', 'Anda Belum Mengisi Keterangan', [
        {text: 'Tutup', onPress: () => console.log('Tutup Pressed')},
      ]);
      return false;
    } else {
      // let msgData = {
      //   message: caption,
      //   from: userData?.id,
      //   to: receiverData.id,
      //   sendTime: moment().format(),
      //   msgType: 'img',
      //   // orderId: 'LC-' + receiverData.roomId + '-' + getIdOrderChat,
      //   status: 0, // this is status of end chat
      //   tnosBon: 3,
      //   category: category,
      // };
  
      // const newReference = database()
      //   .ref('/messages/' + receiverData.id + '/' + receiverData.roomId)
      //   .push();
  
      // msgData.id = newReference.key;
      // newReference.set(msgData).then(() => {
  
      //   let chatListUpdate = {
      //     lastMsg: msgData.message,
      //     sendTime: msgData.sendTime,
      //     msgType: msgData.msgType,
      //   };
  
      //   database()
      //     .ref('/chatlist/' + userData?.id + '/' + receiverData.category)
      //     .update(chatListUpdate)
      //     .then(() => console.log('Data updated.'));
      // })
  
      imageData.forEach(async function (image,index) {
        // console.log(
        //   'PROCCESS UPLOAD MULTI IMAGE AND CAPTION =============>>>>>>>>>>>>>>',
        // );
  
        let imgName = image.path.substring(image.path.lastIndexOf('/') + 1);
        let ext = imgName.split('.').pop();
        let name = imgName.split('.')[0];
        let newName = name + Date.now() + '.' + ext;
  
        const reference = storage().ref('chatMedia/img/' + newName);
        await reference.putFile(image.path);
        const imgUrl = await storage()
          .ref('chatMedia/img/' + newName)
          .getDownloadURL();
        // console.log('url ======>', url);
        let msgData = {
          message: imgUrl.replace(urlMedia, ''),
          from: userData?.id,
          to: receiverData.id,
          sendTime: moment().format(),
          msgType: 'img',
          // orderId: 'LC-' + receiverData.roomId + '-' + getIdOrderChat,
          status: '0',
          tnosBon: '0',
          category:category,
          caption: index == 0 ? caption : '',
          urlMedia: urlMedia
        };
  
  
      // console.log("receiverData");
      // console.log(receiverData);
  
  
      updateMsgToFirebase(msgData, receiverData);
        // if (userData?.role == 'user') {
        // } else if (userData?.role == 'mitra') {
        //   updateMsgToFirebaseMitra(msgData, receiverData, category);
        // }
      });
    }



  };

  // const updateMsgToFirebaseMitra = async (msgData, receiverData, category) => {
  //   const newReference = database()
  //     .ref('/messages/' + receiverData.id + '/' + receiverData.roomId)
  //     .push();

  //   msgData.id = newReference.key;
  //   newReference.set(msgData).then(() => {
  //     let chatListUpdate = {
  //       lastMsg: msg,
  //       sendTime: msgData.sendTime,
  //     };
  //     const finalRes = tnosBon - tnosBonCut;
  //     setTnosBon(finalRes);

  //     database()
  //       .ref('/users/' + receiverData.id)
  //       .update({tnosBon: finalRes})
  //       .then(() => console.log('TNOS Bon updated.'))
  //       .catch(err => console.log('err', err));

  //     database()
  //       .ref('/chatlist/' + receiverData.id + '/' + category)
  //       .update(chatListUpdate)
  //       .then(() => console.log('Last Msg updated.'));

  //     setCaption('');
  //     SimpleToast.show('Upload Gambar Berhasil!');
  //     Navigation.back();
  //   });
  // };

  const updateMsgToFirebase = async (msgData, receiverData) => {
    const newReference = database()
      .ref('/messages/' + userData?.id + '/' + roomId)
      .push();

    msgData.id = newReference.key;
    newReference.set(msgData).then(() => {
      let chatListUpdate = {
        lastMsg: msgData.message,
        sendTime: msgData.sendTime,
        msgType: msgData.msgType,
      };

      database()
        .ref('/chatlist/' + userData?.id + '/' + category)
        .update(chatListUpdate)
        .then(() => console.log('Data updated.'));

      setCaption('');
      SimpleToast.show('Upload Gambar Berhasil!');
      Navigation.back();
    });
  };

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          height: 70,
          backgroundColor: COLORS.white,
          elevation: 5,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.theme}
          translucent={false}
        />
        <ChevronLeftIcon
          style={{
            marginHorizontal: 10,
            color: COLORS.black,
          }}
          onPress={() => Navigation.back()}
        />

        <View style={{flex: 1, marginLeft: 10}}>
          <Text
            numberOfLines={1}
            style={{
              color: COLORS.black,
              fontSize: 16,
              fontFamily: FONTS.SemiBold,
              textTransform: 'capitalize',
            }}>
            Upload Gambar
          </Text>
        </View>
      </View>
      <ScrollView style={{flexDirection: 'column'}}>
        {imageData.map((img, i) => {
          return (
            <View key={i} style={{flexDirection:'row'}}>
              <Image
                source={{uri: img.path}}
                style={{
                  height: 100,
                  width: 100,
                  resizeMode: 'cover',
                  borderRadius: 5,
                  marginTop: 10,
                  marginLeft: 10,
                }}
              />
              <View style={{marginLeft: 10, marginTop:30, alignSelf:'flex-start'}}>
                <Text style={{fontWeight:'bold',color:COLORS.black,}}>
                  {img.path.replace(
                    'file:///data/user/0/com.chatapp/cache/react-native-image-crop-picker/',
                    '',
                  )}
                </Text>
                <Text style={{marginLeft: 10,color:COLORS.black,}}>{img.size / 1000 + 'KB'}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          paddingVertical: 7,
        }}>
        <TextInput
          style={{
            width: '80%',
            borderRadius: 25,
            borderWidth: 0.5,
            borderColor: COLORS.black,
            paddingHorizontal: 15,
            color: COLORS.black,
            backgroundColor:'white'
          }}
          placeholder="Tambah Keterangan"
          placeholderTextColor={COLORS.black}
          //   multiline={true}
          value={caption}
          onChangeText={val => {
            if (val.length > 1000) {
              Alert.alert(
                'Jumlah karakter pesan yang di perbolehkan maksimal 1000 Karakter',
                [
                  {
                    text: 'Tutup',
                    onPress: () => console.log('Tutup Pressed'),
                  },
                ],
              );
              return false;
            }
            setCaption(val);
          }}
        />
        <TouchableOpacity disabled={disabled} onPress={uploadImgNCaption}>
          <PlayIcon
            style={{
              color: COLORS.orangeBgIcon,
            }}
            size="8"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreviewImage;

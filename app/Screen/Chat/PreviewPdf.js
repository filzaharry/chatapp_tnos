import {
  View,
  Text,
  Image,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ImageBackground,
  FlatList,
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

const PreviewPdf = props => {
  const {receiverData, userData, pdfData, getIdOrderChat,category, roomId} = props.route.params;
  const [caption, setCaption] = useState('');
  const [disabled, setdisabled] = useState(false);
  const [process, setProcess] = useState('');
  const urlMedia = 'https://firebasestorage.googleapis.com/v0/b/chatapp-bc4ce.appspot.com/o/chatMedia';


  const uploadPdfCaption = async () => {
    // console.log('PROCCESS UPLOAD PDF AND CAPTION =============>>>>>>>>>>>>>>');
    // console.log(pdfData);

    // validasi ukuran maksimum semua foto 1 mb
    if (pdfData.size >= 1000000) {
      if (caption == '') {
        Alert.alert('Upload Dokumen Gagal', 'Ukuran File Lebih Dari 1 MB', [
          {text: 'Tutup', onPress: () => console.log('Tutup Pressed')},
        ]);
        return false;
      }
    }else if (caption == '') {
      Alert.alert('Upload Dokumen Gagal', 'Anda Belum Mengisi Keterangan', [
        {text: 'Tutup', onPress: () => console.log('Tutup Pressed')},
      ]);
      return false;
    } else {
      const reference = storage().ref('chatMedia/pdf/' + pdfData.name);
      const task = reference.putFile(pdfData.fileCopyUri.replace('file://', ''));
      task.on('state_changed', taskSnapshot => {
        const result = `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`;
        setProcess(result);
        console.log(result);
      });
      task.then(async () => {
        
        setProcess('');
        const pdfUrl = await storage()
          .ref('chatMedia/pdf/' + pdfData.name)
          .getDownloadURL();
        // console.log('url ======>', url);
        let msgData = {
          filename: pdfData.name,
          message: pdfUrl.replace(urlMedia, ''),
          from: userData?.id,
          to: receiverData.id,
          sendTime: moment().format(),
          msgType: 'file',
          orderId: 'LC-' + receiverData.roomId + '-' + getIdOrderChat,
          status: '0',
          tnosBon: '0',
          caption: caption,
          urlMedia: urlMedia
        };
        updateMsgToFirebase(msgData, receiverData);
        // if (userData?.role == 'user') {
        // } else if (userData?.role == 'mitra') {
        //   updateMsgToFirebaseMitra(msgData, receiverData);
        // }
      });
    }

    
  };

  // const updateMsgToFirebaseMitra = async (msgData, receiverData) => {
  //   const newReference = database()
  //     .ref('/messages/' + receiverData.id + roomId)
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
  //       .ref('/chatlist/' + userData?.id + '/' + category)
  //       .update(chatListUpdate)
  //       .then(() => console.log('Last Msg updated.'));

  //     setCaption('');
  //     SimpleToast.show('Dokumen Berhasil Di Kirim');
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
            Upload Dokumen PDF
          </Text>
        </View>
      </View>
      <View style={{flex: 1, backgroundColor: '#E9E9EB'}}>
        <View
          style={{
            marginTop: 200,
            alignContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={require('../../Assets/file_solid.png')}
            style={{height: 80, width: 80}}
          />
          <Text style={{marginLeft: 10, fontSize: 20,color:COLORS.black,}}>{pdfData.name}</Text>
          <Text style={{marginLeft: 10,color:COLORS.black,}}>{pdfData.size / 1000 + 'KB'}</Text>
          {process != '' ? (<Text></Text>) : (<Text>{process}</Text>)}
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          paddingVertical: 7,
          backgroundColor:'white'
        }}>
        <TextInput
          style={{
            width: '80%',
            borderRadius: 25,
            borderWidth: 0.5,
            borderColor: COLORS.black,
            paddingHorizontal: 15,
            color: COLORS.black,
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
        <TouchableOpacity disabled={disabled} onPress={uploadPdfCaption}>
          <PlayIcon
            style={{
              color: COLORS.orangeBgIcon,
            }}
            size="8"
          />
        </TouchableOpacity>
      </View>
      {/* <ScrollView style={{flexDirection: 'column', marginBottom: 100}}>
        {pdfData.map((item, i) => {
          return (
            <View key={i}>
              <Image
                source={require('../../Assets/file_solid.png')}
                style={{height: 40, width: 40}}
              />
              <Text style={{color: COLORS.black, fontSize: 10}}>
                Invoice ...
              </Text>
              <Text style={{marginLeft: 10}}>{item.name}</Text>
              <Text style={{marginLeft: 10}}>{item.size / 1000 + 'KB'}</Text>
            </View>
          );
        })}
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
            }}
            placeholder="Type a caption ..."
            placeholderTextColor={COLORS.black}
            //   multiline={true}
            value={caption}
            onChangeText={val => {
              if (val.length > 1000) {
                SimpleToast.show(
                  'Jumlah karakter pesan yang di perbolehkan maksimal 1000 Karakter',
                );
                // return false;
              }
              setCaption(val);
            }}
          />
          <TouchableOpacity disabled={disabled} onPress={uploadPdfCaption}>
            <PlayIcon
              style={{
                color: COLORS.orangeBgIcon
              }}
              size="6"
            />
          </TouchableOpacity>
        </View>
      </ScrollView> */}
    </View>
  );
};

export default PreviewPdf;

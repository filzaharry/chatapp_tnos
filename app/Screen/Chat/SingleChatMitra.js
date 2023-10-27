//import liraries
import {
  ChevronLeftIcon,
  CloseIcon,
  Icon,
  PlayIcon,
  WarningIcon,
} from 'native-base';
import React, {Component, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  SectionList,
  TouchableOpacity,
  FlatList,
  Modal,
  StatusBar,
  Image,
  Button,
  Alert,
} from 'react-native';
import moment from 'moment';
import MsgComponent from '../../Component/Chat/MsgComponent';
import {COLORS} from '../../Component/Constant/Color';
import ChatHeader from '../../Component/Header/ChatHeader';
import {useSelector} from 'react-redux';
import database from '@react-native-firebase/database';
import SimpleToast from 'react-native-simple-toast';
import {Pressable} from 'react-native';
import HelpChat from '../../Component/Chat/HelpChat';
import {Avatar} from 'react-native-elements';
import {FONTS} from '../../Component/Constant/Font';
import Navigation from '../../Service/Navigation';
import {MyModal} from '../../Component/Chat/MyModal';
import NotificationService from '../../Service/Notification';

const SingleChatMitra = props => {
  const {userData} = useSelector(state => state.User);
  const {receiverData, mitraId} = props.route.params;

  const [msg, setMsg] = useState('');
  const [disabled, setdisabled] = useState(false);
  const [allChat, setallChat] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tnosBonVisible, setTnosBonVisible] = useState(false);
  const [modalAskVisible, setModalAskVisible] = useState(false);
  const [modalAskUpload, setModalAskUpload] = useState(false);
  const [modalAskConfirm, setModalAskConfirm] = useState(false);
  const [timeModalAsk, setTimeModalAsk] = useState(0);
  const [modalText, setModalText] = useState('');
  const [roomId, setRoomId] = useState('');
  const [statusChat, setStatusChat] = useState('');
  const [orderBatch, setOrderBatch] = useState('');
  const tonsCutString = 2;
  const tonsCutImgCaption = 3;
  const tonsCutFileCaption = 7;
  const [tnosBonCut, setTnosBonCut] = useState(0);
  const [tnosBon, setTnosBon] = useState(0);
  const [tnosBonTemp, setTnosBonTemp] = useState(0);
  const [isMitraReply, setIsMitraReply] = useState(true);
  const [fcmTokenReceiver, setFcmTokenReceiver] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [popUpClicked, setPopUpClicked] = useState(false);

  const [statusLast, setStatusLast] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingUser, setIsTypingUser] = useState(false);

  const msgvalid = txt => txt && txt.replace(/\s/g, '').length;

  let timeOutSet1;
  let timeOutSet2;
  let timeOutSet3;
  let timeOutSet4;
  let timeOutSet5;

  let allOrderChat;
  let getIdOrderChat;

  // check waktu buka live chat dari jam 08.00 - 21.59
  const currentDate = new Date();
  const sendTime = currentDate.getTime();
  var startTime = '12:00:00';
  // var startTime = '08:00:00';
  // var endTime = '23:59:00';
  var endTime = '17:59:00';
  // var endTime = '21:59:00';

  useEffect(() => {
    let triggerIsTyping = {
      mitraIsTyping: isTyping,
    };
    database()
      .ref('/chatlist/' + receiverData.id + '/' + receiverData.category)
      .update(triggerIsTyping);
  }, [isTyping]);

  useEffect(() => {
    getTnosBonUpdate();
  }, [tnosBon, tnosBonTemp, isMitraReply, isTypingUser, statusLast]);

  const getTnosBonUpdate = async () => {
    database()
      .ref('/users/' + receiverData?.id)
      .on('value', snapshot => {
        setTnosBon(snapshot.val().tnosBon);
        // console.log('TNOS BON TEMP DATA: ', snapshot.val().tnosBon);
        setTnosBonTemp(snapshot.val().tnosBonTemp);
        setFcmTokenReceiver(snapshot.val().tokenFcm);
        setReceiverName(snapshot.val().name);
      });

    database()
      .ref('/chatlist/' + receiverData.id + '/' + receiverData.category)
      .on('value', snapshot => {
        // console.log('IS MITRA REPLY: ', snapshot.val().isMitraReply);
        setIsMitraReply(snapshot.val().isMitraReply);
        // console.log('ORDER BATCH: ', snapshot.val().orderBatch);
        setOrderBatch(snapshot.val().orderBatch);
        setIsTypingUser(snapshot.val().userIsTyping);
        setStatusLast(snapshot.val().status);
      });
  };

  useEffect(() => {
    const onChildAdd = database()
      .ref('/messages/' + receiverData.id + '/' + receiverData.roomId)
      .on('child_added', snapshot => {
        // console.log('A new node has been added MITRA', snapshot.val());
        if (snapshot.val() == 2) {
          Navigation.back();
          return false;
        }
        setallChat(state => [snapshot.val(), ...state]);
        // if (snapshot.val().msgType == 'text') {
        //   setTnosBonCut(tonsCutString);
        // } else if (snapshot.val().msgType == 'img') {
        //   setTnosBonCut(tonsCutImgCaption);
        // } else if (snapshot.val().msgType == 'file') {
        //   setTnosBonCut(tonsCutFileCaption);
        // } else {
        //   setTnosBonCut(0);
        // }
      });

    // Stop listening for updates when no longer required
    return () =>
      database()
        .ref('/messages/' + receiverData.id + '/' + receiverData.roomId)
        .off('child_added', onChildAdd);
  }, []);

  // useEffect(() => {
  //   database()
  //   .ref('chatlist/' + receiverData.id + '/' + receiverData.category)
  //   .once('value')
  //   .then(snapshot => {
  //       console.log('123', snapshot.val());
  //   //     setRoomId(snapshot.val().roomId);
  //   //     statusChat(snapshot.val().status);
  //       setOrderBatch(snapshot.val().orderBatch);
  //     });
  // }, []);

  // const checkOpenTime = (sendTime) => {

  //   return valid;
  // }

  const sendMsg = () => {
    setModalAskConfirm(false);
    if (msg == '' && msgvalid(msg) == 0) {
      SimpleToast.show('Ketik Sesuatu Untuk Menjawab Pesan');
      return false;
    }

    database()
      .ref('chatlist/' + receiverData.id + '/' + receiverData.category)
      .once('value')
      .then(snapshot => {
        if (snapshot.val().isMitraId == userData?.id) {
          allOrderChat = allChat.filter(item => item.status == '2');
          getIdOrderChat = allOrderChat.length + 1;

          startDate = new Date(sendTime);
          startDate.setHours(startTime.split(':')[0]);
          startDate.setMinutes(startTime.split(':')[1]);
          startDate.setSeconds(startTime.split(':')[2]);

          endDate = new Date(sendTime);
          endDate.setHours(endTime.split(':')[0]);
          endDate.setMinutes(endTime.split(':')[1]);
          endDate.setSeconds(endTime.split(':')[2]);

          validTime = startDate < sendTime && endDate > sendTime;
          console.log(validTime);
          let msgData;
          if (validTime == false) {
            Alert.alert(
              'Informasi',
              'Chat Anda Terkirim namun karna batas waktu konsultasi adalah jam 08.00 - 21.59',
            );
          } 
          msgData = {
            message: msg,
            from: userData?.id,
            to: receiverData.id,
            sendTime: moment().format(),
            msgType: 'text',
            status: '0',
            tnosBon: tnosBonCut,
          };
          // console.log("msgData =====>>>>>>>>>>>>>>>>");
          // console.log(msgData);

          const newReference = database()
            .ref('/messages/' + receiverData.id + '/' + receiverData.roomId)
            .push();

          msgData.id = newReference.key;
          newReference.set(msgData).then(() => {
            let chatListUpdate = {
              lastMsg: msg,
              sendTime: msgData.sendTime,
              isMitraReply: true, // jika true maka mitra tidak boleh membalas sampai status isMitraReply berubah jadi false
              isUserReply: false, // jika true maka user tidak boleh mengirim pesan sampai status isUserReply berubah jadi false
            };
            const finalRes = tnosBon - tnosBonTemp;
            setTnosBon(finalRes);

            database()
              .ref('/users/' + receiverData.id)
              .update({tnosBon: finalRes, tnosBonTemp: 0}); // tnosBon di update, tnosbontemp di reset
            // .then(() => console.log('TNOS Bon updated.'))
            // .catch(err => console.log('err', err));

            database()
              .ref('/chatlist/' + receiverData.id + '/' + receiverData.category)
              .update(chatListUpdate);
            // .then(() => console.log('Last Msg updated.'));

            setMsg('');
            setIsTyping(false);
            setTimeModalAsk(0);
            clearTimeout(timeOutSet1);
            clearTimeout(timeOutSet2);
            clearTimeout(timeOutSet3);
            clearTimeout(timeOutSet4);
            clearTimeout(timeOutSet5);
            // console.log("receiverData ====>>>>>>");
            // console.log(receiverData);
            sendNotification(msgData.message);
          });
        } else {
          SimpleToast.show(
            'Anda Tidak Bisa Mengirim Konsultasi Di Sesi Ini ...',
          );
          return false;
        }
      });
  };

  const sendNotification = async message => {
    try {
      let notificationData = {
        title: 'mitra : ' + userData?.name + ' membalas',
        body: message,
        token: fcmTokenReceiver,
      };
      // console.log("notificationDataMitra");
      // console.log(notificationData);
      await NotificationService.sendSingleDeviceNotification(notificationData);
    } catch (error) {
      // console.log('Cannot Send FCM');
      console.log(error);
    }
  };
  // const sendNotificationToThisUser = async (message) => {
  //   try {

  //     let notificationData = {
  //       title: 'Perhatian',
  //       body: message,
  //       token: userData?.tokenFcm,
  //     };
  //     // console.log("userData FCM =====>>>>>>>>>>>");
  //     // console.log(notificationData);
  //     await NotificationService.sendSingleDeviceNotification(notificationData);
  //   } catch (error) {
  //     // console.log('Cannot Send FCM');
  //     console.log(error);
  //   }
  // };

  const modalToggle = () => {
    modalVisible ? setModalVisible(false) : setModalVisible(true);
  };
  const tnosBonToggle = () => {
    // console.log('tnosBonVisible', tnosBonVisible);
    tnosBonVisible ? setTnosBonVisible(false) : setTnosBonVisible(true);
  };

  // setTimeout(() => {
  //   modalVisible && setModalVisible(false);
  // }, 5000);

  const renderEndChat = () => {
    allOrderChat = allChat.filter(item => item.status == '2');
    getIdOrderChat = allOrderChat.length + 1;

    let msgData = {
      message: '',
      from: receiverData.id,
      to: userData?.id,
      sendTime: moment().format(),
      msgType: 'text',
      orderId: 'LC-' + receiverData.roomId + '-' + getIdOrderChat,
      status: '2', // this is status of end chat
      tnosBon: '10',
    };

    const newReference = database()
      .ref('/messages/' + receiverData.id + '/' + receiverData.roomId)
      .push();

    msgData.id = newReference.key;
    newReference.set(msgData).then(() => {
      SimpleToast.show('Terimakasih atas Konsultasinya');
      // Navigation.back()
    });
    setTimeModalAsk(99);
    clearTimeout(timeOutSet1);
    clearTimeout(timeOutSet2);
    clearTimeout(timeOutSet3);
    clearTimeout(timeOutSet4);
    clearTimeout(timeOutSet5);
  };

  // const modalAskNo = () => {
  //   setModalAskVisible(false);
  //   if (timeModalAsk == 0) {
  //     setTimeModalAsk(1);
  //   }
  //   if (timeModalAsk == 1) {
  //     setTimeModalAsk(2);
  //   }
  //   if (timeModalAsk == 2) {
  //     setTimeModalAsk(3);
  //   }
  // };

  // const modalAskYes = () => {
  //   setModalAskVisible(false);
  //   renderEndChat();
  // };
  const modalAskYes = () => {
    setPopUpClicked(true);
    // console.log('Reset timeout');
    setTimeModalAsk(0);
    // console.log(timeModalAsk);
    setModalAskVisible(false);
  };

  const modalAskNo = () => {
    setPopUpClicked(true);
    // console.log('modal ask No ===== >');
    // console.log('Thank You, This Is Invoice');
    setModalAskVisible(false);
    // renderEndChat();
    // send information
    // send information
    // send information
    // send information
    // send information
    fcmMitraNotRes();
  };

  const fcmMitraNotRes = async () => {
    let notificationData = {
      title:
        'mitra : ' +
        userData?.name +
        ' Tidak merespon chat Anda, segera kirim ulang pesan Anda',
      body: msg,
      token: fcmTokenReceiver,
    };

    let chatListUpdate = {
      mitraIsResponse: 'not_response',
    };

    database()
      .ref('/chatlist/' + receiverData.id + '/' + receiverData.category)
      .update(chatListUpdate);
    await NotificationService.sendSingleDeviceNotification(notificationData);
  };

  useEffect(() => {

    startDate = new Date(sendTime);
    startDate.setHours(startTime.split(':')[0]);
    startDate.setMinutes(startTime.split(':')[1]);
    startDate.setSeconds(startTime.split(':')[2]);

    endDate = new Date(sendTime);
    endDate.setHours(endTime.split(':')[0]);
    endDate.setMinutes(endTime.split(':')[1]);
    endDate.setSeconds(endTime.split(':')[2]);

    validTime = startDate < sendTime && endDate > sendTime;
    console.log("startDate ======");
    console.log("startDate ======");
    console.log("startDate ======");
    console.log("startDate ======");
    console.log(startDate);
    console.log(sendTime);
    console.log(endDate);
    console.log(sendTime);
    let msgData;
    if (validTime == false) {
      console.log('not working hour');
    }else{
      setTimeout(() => {
        if (timeModalAsk == 0) {
          // console.log('USE EFFECT TIMEMODDAL ASK', timeModalAsk);
          setModalText(
            `Sudah 20 menit pertannyaan belum di respon oleh Anda, segera balas pesan ini`,
          );
          timeOutSet1 = setTimeout(() => {
            setModalAskVisible(true);
            setTimeModalAsk(1);
            // sendNotificationToThisUser('Anda belum menjawab pertanyaan user');
          }, 1000 * 60 * 2);
        }
        if (timeModalAsk == 1) {
          // console.log('USE EFFECT TIMEMODDAL ASK', timeModalAsk);
          setModalText(
            `Sudah 40 menit pertannyaan belum di respon oleh Anda, segera balas pesan ini`,
          );
          timeOutSet2 = setTimeout(() => {
            setModalAskVisible(true);
            setTimeModalAsk(2);
            // sendNotificationToThisUser('Anda belum menjawab pertanyaan user');
          }, 1000 * 60 * 2);
        }
        if (timeModalAsk == 2) {
          // console.log('USE EFFECT TIMEMODDAL ASK', timeModalAsk);
          setModalText(
            `Sudah 1 jam pertannyaan belum di respon oleh mitra pengacara konsultasi, dengan ini sistem akan mengakhiri chat konsultasi anda secara otomatis.`,
          );
          timeOutSet3 = setTimeout(() => {
            setModalAskVisible(true);
            setTimeModalAsk(3);
            // sendNotificationToThisUser('Anda belum menjawab pertanyaan user');
            // renderEndChat();
            // fcmMitraNotRes()
            // closePopUp3 = setTimeout(() => {
            //   if (popUpClicked == false) {
            //     modalClosePopUp();
            //   }
            // }, 8000);
          }, 1000 * 60 * 2);
        }
      }, 1000 * 60 * 2);
    }
    
  }, [timeModalAsk, popUpClicked, modalText]);

  // const modalClosePopUp = () => {
  //   setModalAskVisible(false);
  //   if (timeModalAsk == 0) {
  //     setTimeModalAsk(1);
  //   }
  //   if (timeModalAsk == 1) {
  //     setTimeModalAsk(2);
  //   }
  //   if (timeModalAsk == 2) {
  //     setTimeModalAsk(3);
  //   }
  // };

  // const uploadImages = () => {
  //   ImagePicker.openPicker({
  //     cropping: false,
  //     multiple: true,
  //     mediaType: 'photo',
  //   }).then(async images => {
  //     // console.log(images);
  //     setModalAskUpload(false);
  //     Navigation.navigate('PreviewImage', {
  //       receiverData,
  //       userData,
  //       imageData: images,
  //       getIdOrderChat,
  //       category,
  //     });
  //   });
  // };

  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={modalAskConfirm}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.red,
                alignSelf: 'flex-end',
                borderRadius: 100,
                padding: 4,
              }}
              onPress={() => setModalAskConfirm(false)}>
              <CloseIcon
                style={{
                  color: COLORS.white,
                }}
              />
            </TouchableOpacity>
            <Text style={{fontSize: 18, color: COLORS.black}}>
              Konfirmasi Jawaban
            </Text>
            <View style={{paddingVertical: 10, paddingHorizontal: 20}}>
              <Text
                style={{fontSize: 12, marginBottom: 10, color: COLORS.black}}>
                Apakah Anda Yakin akan mengirim jawaban ini ?
              </Text>

              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                  onPress={sendMsg}
                  style={{
                    backgroundColor: COLORS.green,
                    borderRadius: 4,
                    paddingHorizontal: 10,
                    marginHorizontal: 5,
                  }}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: 14,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}>
                    Ya
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalAskConfirm(false)}
                  style={{
                    backgroundColor: COLORS.red,
                    borderRadius: 4,
                    paddingHorizontal: 10,
                    marginHorizontal: 5,
                  }}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: 14,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}>
                    Tidak
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* <Modal animationType="slide" transparent={true} visible={modalAskUpload}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Icon
              style={{
                backgroundColor: COLORS.red,
                borderRadius: 10,
                paddingTop: 10,
                paddingHorizontal: 10,
                color: COLORS.black,
                fontSize: 14,
                height: 34,
                alignSelf: 'flex-end',
              }}
              name="close"
              type="Ionicons"
              onPress={() => setModalAskUpload(false)}
            />
            <Text style={{fontSize: 18, marginBottom: 10}}>Upload File ?</Text>
            <View style={{padding: 20}}>
              <Text style={{fontSize: 12, marginBottom: 10}}>Ketentuan : </Text>
              <Text style={{fontSize: 12, marginBottom: 10}}>
                File attachment yang di perbolehkan ( JPG, JPEG, PNG dan PDF )
              </Text>
              <Text style={{fontSize: 12, marginBottom: 10}}>
                Attachment berupa gambar bisa di kirim secara banyak (multiple)
                dalam sekali kirim maksimal 5 File Foto
              </Text>
              <Text style={{fontSize: 12, marginBottom: 10}}>
                Attachment berupa document PDF hanya bisa dikirim 1 file dalam
                sekali kirim
              </Text>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                  onPress={{}}
                  style={{
                    backgroundColor: COLORS.green,
                    borderRadius: 4,
                    paddingHorizontal: 10,
                    marginHorizontal: 5,
                  }}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: 14,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}>
                    Dokumen
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={uploadImages}
                  style={{
                    backgroundColor: COLORS.red,
                    borderRadius: 4,
                    paddingHorizontal: 10,
                    marginHorizontal: 5,
                  }}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: 14,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}>
                    Gambar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal> */}
      <Modal animationType="slide" transparent={true} visible={modalAskVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  maxWidth: 300,
                  borderRadius: 20,
                  marginBottom: 10,
                  backgroundColor: COLORS.orangeBgIconTrans,
                }}>
                <WarningIcon
                  style={{
                    color: COLORS.red,
                    fontSize: 8,
                    alignSelf: 'flex-start',
                  }}
                />
                <Text
                  style={{
                    color: COLORS.black,
                    marginRight: 10,
                    marginLeft: 10,
                    opacity: 1,
                    width: 200,
                  }}>
                  {modalText}
                </Text>
              </View>
              {/* {timeModalAsk == 2 ? (
                <View></View>
              ) : ( */}
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                  onPress={modalAskYes}
                  style={{
                    backgroundColor: COLORS.green,
                    borderRadius: 4,
                    paddingHorizontal: 10,
                    marginHorizontal: 5,
                  }}>
                  <Text style={{color: COLORS.white}}>Tutup</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                    onPress={modalAskNo}
                    style={{
                      backgroundColor: COLORS.red,
                      borderRadius: 4,
                      paddingHorizontal: 10,
                      marginHorizontal: 5,
                    }}>
                    <Text style={{color: COLORS.white}}>Tidak</Text>
                  </TouchableOpacity> */}
              </View>
              {/* )} */}
            </View>
          </View>
        </View>
      </Modal>

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

        <TouchableOpacity onPress={() => Navigation.back()}>
          <ChevronLeftIcon
            size="5"
            mt="0.5"
            color="emerald.500"
            style={{
              marginHorizontal: 10,
              color: COLORS.black,
            }}
          />
        </TouchableOpacity>
        {/* {receiverData.img == '' ? ( */}
        <Avatar
          source={require('../../Assets/user-icon.png')}
          rounded
          size="small"
        />
        {/*  ) : (
           <Avatar source={{uri: receiverData.img}} rounded size="small" />
         )} */}

        <View style={{flex: 1, marginLeft: 10}}>
          <Text
            numberOfLines={1}
            style={{
              color: COLORS.black,
              fontSize: 16,
              fontFamily: FONTS.SemiBold,
              textTransform: 'capitalize',
            }}>
            {'User : ' + receiverData.userName}
          </Text>
          {isTypingUser == true ? (
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 12,
                  fontFamily: FONTS.Regular,
                }}>
                {receiverData.userName + 'sedang mengetik ...'}
              </Text>
            </View>
          ) : (
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 12,
                  fontFamily: FONTS.Regular,
                }}>
                {'Konsultasi ke : ' + orderBatch} -{' '}
              </Text>

              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 10,
                  fontFamily: FONTS.Regular,
                }}>
                {receiverData.category}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={modalToggle}
          style={{
            height: 24,
            width: 24,
            borderRadius: 40,
            backgroundColor: COLORS.orangeBgIcon,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 5,
            marginRight: 20,
            marginHorizontal: 10,
            color: COLORS.black,
          }}>
          <Text style={{fontSize: 14, fontWeight: 'bold', color: COLORS.white}}>
            ?
          </Text>
        </TouchableOpacity>
      </View>

      <ImageBackground
        source={require('../../Assets/chatbg.png')}
        style={{flex: 1}}>
        <FlatList
          style={{flex: 1}}
          //   data={sorted()}
          data={allChat}
          // data={Data}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index}
          inverted
          renderItem={({item}) => {
            // console.log("WAAAAAAAA===2==>");
            // console.log(item);
            return (
              <MsgComponent
                sender={item.from == userData.id}
                // message={item.message}
                item={item}
                roomId={receiverData.roomId}
                receiverId={receiverData.id}
              />
            );
          }}
        />
        <TouchableOpacity
          onPress={tnosBonToggle}
          style={{
            position: 'absolute',
            right: 20,
            bottom: 100,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
            }}>
            {/* {tnosBonVisible && (
              <View
                style={{
                  backgroundColor: COLORS.white,
                  flexDirection: 'row',
                  borderColor: 'black',
                  borderWidth: 2,
                  borderRadius: 40,
                  paddingHorizontal: 10,
                }}>
                <TouchableOpacity onPress={endSession}>
                  <Text
                    style={{
                      marginTop: 5,
                      fontSize: 10,
                      color: COLORS.black,
                      fontWeight: 'bold',
                    }}>
                    Akhiri Konsultasi User
                  </Text>
                </TouchableOpacity>
              </View>
            )} */}
            {/* <Image
              source={require('../../Assets/tnos-logo.png')}
              style={{height: 30, width: 30}}
            /> */}
          </View>
        </TouchableOpacity>
      </ImageBackground>

      <View
        style={{
          backgroundColor: COLORS.white,
          elevation: 5,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 7,
          justifyContent: 'space-evenly',
        }}>
        {statusChat == 2 ? (
          <View style={{flexDirection: 'row'}}>
            <CircleIcon></CircleIcon>
            <Text>
              Anda Tidak Bisa Input Karena Chat Sudah Ditutup Oleh User
            </Text>
          </View>
        ) : (
          <>
            {isMitraReply == true ? (
              <Text
                style={{
                  width: '90%',
                  borderRadius: 25,
                  borderWidth: 0.5,
                  borderColor: COLORS.black,
                  paddingHorizontal: 15,
                  color: COLORS.black,
                  paddingVertical: 10,
                }}>
                {statusLast == 2
                  ? 'Pesan telah berakhir'
                  : 'Menunggu user membalas ...'}
              </Text>
            ) : (
              <>
                <TextInput
                  style={{
                    width: '80%',
                    borderRadius: 25,
                    borderWidth: 0.5,
                    borderColor: COLORS.black,
                    paddingHorizontal: 15,
                    color: COLORS.black,
                  }}
                  placeholder="Ketik Pesan"
                  placeholderTextColor={COLORS.black}
                  maxHeight={100}
                  multiline={true}
                  value={msg}
                  onChangeText={val => {
                    // console.log("val mitra !!!!!!!");
                    // console.log(val);
                    if (val.length != 0) {
                      setIsTyping(true);
                    } else {
                      setIsTyping(false);
                    }
                    setMsg(val);
                  }}
                />
                <TouchableOpacity
                  disabled={disabled}
                  onPress={() => setModalAskConfirm(true)}>
                  <PlayIcon
                    size="10"
                    style={{
                      color: COLORS.orangeBgIcon,
                    }}
                  />
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>

      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <HelpChat />
          </View>
        </View>
      </Modal> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    marginTop: 90,
    backgroundColor: COLORS.orangeBgIconTrans,
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 2,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#FC8585',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

//make this component available to the app
export default SingleChatMitra;

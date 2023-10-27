//import liraries
import {
  AddIcon,
  ChevronLeftIcon,
  CircleIcon,
  CircularProgress,
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
  SectionList,
  TouchableOpacity,
  FlatList,
  Modal,
  StatusBar,
  Image,
  Button,
  ScrollView,
  Keyboard,
  PermissionsAndroid,
  Alert,
  Linking,
} from 'react-native';
import moment from 'moment';
import MsgComponent from '../../Component/Chat/MsgComponent';
import {COLORS} from '../../Component/Constant/Color';
import ChatHeader from '../../Component/Header/ChatHeader';
import {useSelector} from 'react-redux';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import SimpleToast from 'react-native-simple-toast';
import {Pressable} from 'react-native';
import HelpChat from '../../Component/Chat/HelpChat';
import {Avatar} from 'react-native-elements';
import {FONTS} from '../../Component/Constant/Font';
import Navigation from '../../Service/Navigation';
import {MyModal} from '../../Component/Chat/MyModal';
import {TextInput} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker, {types} from 'react-native-document-picker';
import NotificationService from '../../Service/Notification';
import {sendEmail} from '../../Service/SendEmail';

const SingleChatUser = props => {
  const {userData} = useSelector(state => state.User);
  const {receiverData} = props.route.params;

  const [msg, setMsg] = useState('');
  const [disabled, setdisabled] = useState(false);
  const [allChat, setallChat] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tnosBonVisible, setTnosBonVisible] = useState(false);
  const [modalAskVisible, setModalAskVisible] = useState(false);
  const [modalAskUpload, setModalAskUpload] = useState(false);

  const [timeModalAsk, setTimeModalAsk] = useState(0);
  const [modalText, setModalText] = useState('');

  const [roomId, setRoomId] = useState('');
  const [tnosBonCut, setTnosBonCut] = useState(10);
  const [tnosBon, setTnosBon] = useState(0);

  const [isCloseSession, setIsCloseSession] = useState(false);
  const [popUpClicked, setPopUpClicked] = useState(false);

  const [isMitraName, setMitraName] = useState(false);
  const [category, setCategory] = useState(false);

  const [isMitraReply, setIsMitraReply] = useState(false);
  const [isUserReply, setIsUserReply] = useState(false);
  const [fcmTokenUser, setFcmTokenUser] = useState('');
  const [fcmTokenReceiver, setFcmTokenReceiver] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingMitra, setIsTypingMitra] = useState(false);
  const [mitraIsResponse, setMitraIsResponse] = useState('');

  const [lastSendTime, setLastSendTime] = useState('');

  let alertMitra1;
  let alertMitra2;
  let alertMitra3;
  let timeOutSet1;
  let timeOutSet2;
  let timeOutSet3;
  let closePopUp1;
  let closePopUp2;
  let closePopUp3;

  // check waktu buka live chat dari jam 08.00 - 21.59
  const currentDate = new Date();
  const sendTime = currentDate.getTime();
  var startTime = '12:00:00';
  // var startTime = '08:00:00';
  // var endTime = '23:59:00';
  var endTime = '17:59:00';
  // var endTime = '21:59:00';

  const msgvalid = txt => txt && txt.replace(/\s/g, '').length;

  let allOrderChat;
  let getIdOrderChat;

  useEffect(() => {
    let triggerIsTyping = {
      userIsTyping: isTyping,
      // mitraIsTyping: isTypingMitra,
    };
    database()
      .ref('/chatlist/' + userData?.id + '/' + receiverData.category)
      .update(triggerIsTyping);
  }, [isTyping]);

  useEffect(() => {
    getTnosBonUpdate();
    // alertMitra();
    console.log(lastSendTime);
  }, [tnosBon, isMitraName, isTypingMitra, mitraIsResponse, lastSendTime]);

  const getTnosBonUpdate = async () => {
    database()
      .ref('/users/' + userData?.id)
      .on('value', snapshot => {
        if (snapshot.val() == null) {
          setTnosBon(0);
        } else {
          setTnosBon(snapshot.val().tnosBon);
          setFcmTokenUser(snapshot.val().tokenFcm);
        }
      });
    database()
      .ref('/chatlist/' + userData?.id + '/' + receiverData.category)
      .on('value', snapshot => {
        if (snapshot.val() == null) {
          setMitraName(false);
        } else {
          setMitraName(snapshot.val().isMitraName);
          setIsUserReply(snapshot.val().isUserReply);
          setIsMitraReply(snapshot.val().isMitraReply);
          setIsTypingMitra(snapshot.val().mitraIsTyping);
          setMitraIsResponse(snapshot.val().mitraIsResponse);
          // setLastSendTime(snapshot.val().sendTime);

          if (isMitraReply == false) {
            if (snapshot.val().sendTime != undefined) {
              var time_start = new Date();
              var time_end = new Date();
              const lastSendTime = snapshot
                .val()
                .sendTime.split('T')[1]
                .split('+')[0]
                .split(':');
              const currentTime = currentDate
                .toTimeString()
                .split(' ')[0]
                .split(':');
  
              time_start.setHours(
                lastSendTime[0],
                lastSendTime[1],
                lastSendTime[2],
                0,
              );
              time_end.setHours(
                currentTime[0],
                currentTime[1],
                currentTime[2],
                0,
              );
              const getDuration = time_end - time_start;
              const resultConvToHour = msToTime(getDuration);
  
              if (resultConvToHour.split(':')[0] != '00') {
                setModalText(
                  `Sudah 1 jam lebih Mitra tidak merespon`,
                );
                setModalAskVisible(true);
              }
            }
          } else {
            console.log('mitra is replied');
          }

          database()
            .ref('/users/' + snapshot.val().isMitraId)
            .on('value', snapshot => {
              setFcmTokenReceiver(snapshot.val().tokenFcm);
            });
        }
      });
  };

  function msToTime(duration) {
    var milliseconds = Math.floor((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
  }

  useEffect(() => {
    database()
      .ref('chatlist/' + userData?.id + '/' + receiverData.category)
      .once('value')
      .then(snapshot => {
        // console.log(Object.values(snapshot.val()));
        setRoomId(snapshot.val().roomId);
        setCategory(snapshot.val().category);
      });
  }, []);

  useEffect(() => {
    const onChildAdd = database()
      .ref('/messages/' + userData?.id + '/' + roomId)
      .on('child_added', snapshot => {
        startDate = new Date(sendTime);
        startDate.setHours(startTime.split(':')[0]);
        startDate.setMinutes(startTime.split(':')[1]);
        startDate.setSeconds(startTime.split(':')[2]);
        endDate = new Date(sendTime);
        endDate.setHours(endTime.split(':')[0]);
        endDate.setMinutes(endTime.split(':')[1]);
        endDate.setSeconds(endTime.split(':')[2]);
        validTime = startDate < sendTime && endDate > sendTime;
        if (snapshot.val().status == '99' && validTime == true) {
          let pointUpdate = {
            status: '0',
          };
          database()
            .ref(
              '/messages/' +
                userData?.id +
                '/' +
                roomId +
                '/' +
                snapshot.val().id,
            )
            .update(pointUpdate);

          database()
            .ref('/chatlist/' + userData?.id + '/' + receiverData.category)
            .on('value', snapshotChatlist => {
              database()
                .ref('/users/' + snapshotChatlist.val().isMitraId)
                .on('value', async snapshotUser => {
                  let notificationData = {
                    title: 'Pesan belum terbaca dari user : ' + userData?.name,
                    body: snapshot.val().message,
                    token: snapshotUser.val().tokenFcm,
                  };
                  await NotificationService.sendSingleDeviceNotification(
                    notificationData,
                  );
                });
            });
        }
        setallChat(state => [snapshot.val(), ...state]);
        // console.log('A new node has been added', Object.values(snapshot.val()));
      });

    // Stop listening for updates when no longer required
    return () =>
      database()
        .ref('/messages/' + userData?.id + '/' + roomId)
        .off('child_added', onChildAdd);
  }, [roomId]);

  // useEffect(() => {
  // set tiap 20 menit sekali utk check isUserReply masih true, kirim fcm lagi
  const alertMitra = () => {
    alertMitra1 = setTimeout(() => {
      database()
        .ref('/chatlist/' + userData?.id + '/' + receiverData.category)
        .on('value', snapshot => {
          database()
            .ref('/users/' + snapshot.val().isMitraId)
            .on('value', async snapshotUser => {
              if (snapshot.val().isUserReply == true) {
                console.log(snapshot.val().isUserReply);

                let notificationData = {
                  title:
                    'Anda belum membalas pesan dari user : ' + userData?.name,
                  body: '',
                  token: snapshotUser.val().tokenFcm,
                };

                await NotificationService.sendSingleDeviceNotification(
                  notificationData,
                );

                alertMitra2 = setTimeout(async () => {
                  if (snapshot.val().isUserReply == true) {
                    console.log(snapshot.val().isUserReply);
                    await NotificationService.sendSingleDeviceNotification(
                      notificationData,
                    );

                    alertMitra3 = setTimeout(async () => {
                      if (snapshot.val().isUserReply == true) {
                        console.log(snapshot.val().isUserReply);
                        let forMitra = {
                          title:
                            'Anda tidak merespon selama 1 jam maka konsultasi dinyatakan selesai',
                          body: '',
                          token: snapshotUser.val().tokenFcm,
                        };
                        await NotificationService.sendSingleDeviceNotification(
                          forMitra,
                        );

                        let forUser = {
                          title:
                            'Pesan anda tidak di respon oleh mitra selama 1 jam, maka konsultasi dinyatakan selesai, Anda bisa memulai dengan konsultasi baru',
                          body: '',
                          token: fcmTokenUser,
                        };

                        await NotificationService.sendSingleDeviceNotification(
                          forUser,
                        );
                        allOrderChat = allChat.filter(
                          item => item.status == '2',
                        );
                        getIdOrderChat = allOrderChat.length + 1;

                        let msgData = {
                          message: '',
                          from: receiverData.id,
                          to: userData?.id,
                          sendTime: moment().format(),
                          msgType: 'end',
                          status: 2, // this is status of end chat
                          tnosBon: 0,
                          category: category,
                        };

                        const newReference = database()
                          .ref(
                            '/messages/' +
                              receiverData.id +
                              '/' +
                              receiverData.roomId,
                          )
                          .push();

                        msgData.id = newReference.key;
                        newReference.set(msgData).then(() => {
                          let chatListUpdate = {
                            lastMsg: msgData.message,
                            sendTime: msgData.sendTime,
                            msgType: msgData.msgType,
                            isMitraReply: true,
                            isMitraId: '',
                            isMitraName: '',
                            status: 2, // status ended
                          };

                          database()
                            .ref(
                              '/chatlist/' +
                                userData?.id +
                                '/' +
                                receiverData.category,
                            )
                            .update(chatListUpdate)
                            .then(() => console.log('Data updated.'));
                        });
                      } else {
                        clearTimeout(alertMitra1);
                        clearTimeout(alertMitra2);
                        clearTimeout(alertMitra3);
                      }
                    }, 1000 * 60 * 2);
                  } else {
                    clearTimeout(alertMitra1);
                    clearTimeout(alertMitra2);
                    clearTimeout(alertMitra3);
                  }
                }, 1000 * 60 * 2);
              } else {
                clearTimeout(alertMitra1);
                clearTimeout(alertMitra2);
                clearTimeout(alertMitra3);
              }
            });
        });
    }, 1000 * 60 * 2);
  };
  // }, []);

  const sendMsg = () => {
    clearTimeout(alertMitra1);
    clearTimeout(alertMitra2);
    clearTimeout(alertMitra3);

    startDate = new Date(sendTime);
    startDate.setHours(startTime.split(':')[0]);
    startDate.setMinutes(startTime.split(':')[1]);
    startDate.setSeconds(startTime.split(':')[2]);
    endDate = new Date(sendTime);
    endDate.setHours(endTime.split(':')[0]);
    endDate.setMinutes(endTime.split(':')[1]);
    endDate.setSeconds(endTime.split(':')[2]);
    validTime = startDate < sendTime && endDate > sendTime;

    if (validTime == false) {
      console.log('not working hour');
    } else {
      alertMitra();
    }
    // console.log('msg =====>>>>');
    // console.log(msg);
    // validasi text lebih dari 1000 baris
    if (msg >= 1000) {
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
    // validasi jika tnosBon Kurang dari 2
    if (tnosBon < 2) {
      Alert.alert('TNOS Bon tidak cukup, segera topup poin Anda');
      return false;
    }
    if (msg == '' && msgvalid(msg) == 0) {
      SimpleToast.show('Enter something ...');
      return false;
    }

    allOrderChat = allChat.filter(item => item.status == '2');
    getIdOrderChat = allOrderChat.length + 1;

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
      tnosBon: 2, // kirim text pertanyaan = 2 point
      category: category,
    };

    updateMsgToFirebase(msgData);
  };

  const updateMsgToFirebase = async msgData => {
    const roomIdData =
      userData?.roomId == null ? roomId : userData?.roomId.length;
    const newReference = database()
      .ref('/messages/' + userData?.id + '/' + roomIdData)
      .push();

    // console.log("Timer has been Reset !!!!!");
    // clearTimeout(modalAskTimeout)
    // console.log('Auto generated key: ', newReference.key);
    msgData.id = newReference.key;
    newReference.set(msgData).then(() => {
      let chatListUpdate = {
        lastMsg: msgData.message,
        sendTime: msgData.sendTime,
        msgType: msgData.msgType,
        status: receiverData.status == 2 ?? 0,
        isMitraReply: false, // jika true maka user tidak boleh mengirim pesan sampai status isUserReply berubah jadi false
        isUserReply: true, // jika true maka mitra tidak boleh membalas sampai status isMitraReply berubah jadi false
      };
      let tnosBonTempUpdate = {
        tnosBonTemp: msgData.tnosBon,
      };

      database()
        .ref('/chatlist/' + userData?.id + '/' + receiverData.category)
        .update(chatListUpdate);
      // .then(() => console.log('Chatlist Data Updated.'));

      database()
        .ref('/users/' + userData?.id)
        .update(tnosBonTempUpdate);
      // .then(() => console.log('Tnos Bon Temporary Data Updated.'));

      setMsg('');
      setIsTyping(false);
      setTimeModalAsk(1);
      clearTimeout(timeOutSet1);
      clearTimeout(timeOutSet2);
      clearTimeout(timeOutSet3);
      sendNotification(msgData, receiverData);
    });
  };

  const sendNotification = async (msgData, receiverData) => {
    try {
      let notificationData = {
        title: 'user : ' + userData?.name + ' membalas',
        body: msgData.message,
        token: fcmTokenReceiver,
      };
      await NotificationService.sendSingleDeviceNotification(notificationData);
    } catch (error) {
      console.log('Cannot Send FCM');
      console.log(error);
    }
  };

  const modalToggle = () => {
    modalVisible ? setModalVisible(false) : setModalVisible(true);
  };
  const tnosBonToggle = () => {
    // console.log('tnosBonVisible', tnosBonVisible);
    tnosBonVisible ? setTnosBonVisible(false) : setTnosBonVisible(true);
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

    // if (validTime == false) {
    if (validTime == true) {
      console.log('not working hour');
    } else {
      setTimeout(() => {
        if (timeModalAsk == 1) {
          setModalText(
            `Sudah 1 jam setelah mitra menjawab, apakah anda ingin mengirim pertanyaan kembali?`,
          );
          timeOutSet1 = setTimeout(() => {
            setTimeModalAsk(2);
            setIsCloseSession(true);
          }, 1000 * 60 * 3);
        }
        if (timeModalAsk == 2) {
          setModalText(
            `Sudah 2 jam setelah mitra menjawab, apakah anda ingin mengirim pertanyaan kembali?`,
          );
          timeOutSet2 = setTimeout(() => {
            setTimeModalAsk(3);
            setIsCloseSession(true);
          }, 1000 * 60 * 3);
        }
        if (timeModalAsk == 3) {
          setModalText(
            `Sudah 3 jam setelah mitra menjawab, dengan ini sistem akan mengakhiri chat konsultasi anda secara otomatis.`,
          );
          timeOutSet3 = setTimeout(() => {
            setTimeModalAsk(4);
            setIsCloseSession(true);
            allOrderChat = allChat.filter(item => item.status == '2');
            getIdOrderChat = allOrderChat.length + 1;

            renderEndChat();
          }, 1000 * 60 * 3);
          // setModalAskVisible(false);
        }
      }, 1000 * 60 * 3);
    }
  }, [timeModalAsk, popUpClicked, modalText]);


  const endSession = () => {
    setIsCloseSession(true);
    setModalText(
      'Apabila sesi konsultasi chat dirasa sudah memenuhi ekspektasi anda',
    );
  };

  const renderEndChat = () => {
    allOrderChat = allChat.filter(item => item.status == '2');
    getIdOrderChat = allOrderChat.length + 1;

    let msgData = {
      message: '',
      from: receiverData.id,
      to: userData?.id,
      sendTime: moment().format(),
      msgType: 'end',
      status: 2, // this is status of end chat
      tnosBon: 0,
      category: category,
    };

    const newReference = database()
      .ref('/messages/' + userData?.id + '/' + roomId)
      .push();

    msgData.id = newReference.key;
    newReference.set(msgData).then(() => {

      let chatListUpdate = {
        lastMsg: msgData.message,
        sendTime: msgData.sendTime,
        msgType: msgData.msgType,
        isMitraReply: true,
        isMitraId: '',
        isMitraName: '',
        status: 2, // status ended
      };

      database()
        .ref('/chatlist/' + userData?.id + '/' + receiverData.category)
        .update(chatListUpdate)
        .then(() => console.log('Data updated.'));
    });
    setTimeModalAsk(99);

    Navigation.back();
    clearTimeout(timeOutSet1);
    clearTimeout(timeOutSet2);
    clearTimeout(timeOutSet3);
    clearTimeout(closePopUp1);
    clearTimeout(closePopUp2);
    clearTimeout(closePopUp3);
  };

  const modalAskYes = () => {
    setPopUpClicked(true);
    // console.log('Reset timeout');
    setTimeModalAsk(1);
    // console.log(timeModalAsk);
    setModalAskVisible(false);
  };

  const modalAskNo = () => {
    setPopUpClicked(true);
    setModalAskVisible(false);
    renderEndChat();
  };

  const isClosedYes = () => {
    setIsCloseSession(false);
  };

  const isClosedNo = () => {
    setIsCloseSession(false);
    renderEndChat();
  };

  const sendLastMessage = async () => {
    // fcm
    database()
      .ref('/chatlist/' + userData?.id + '/' + receiverData.category)
      .on('value', async snapshot => {
        let notificationData = {
          title: 'Pesan kembali dikirim',
          body: snapshot.message,
          token: fcmTokenReceiver,
        };
        await NotificationService.sendSingleDeviceNotification(
          notificationData,
        );
      });
  };

  const uploadFile = async () => {
    Navigation.navigate('PreviewAllFile', {
      receiverData,
      userData,
      // fileData: files,
      getIdOrderChat,
      category,
      roomId,
    });
  };


  return (
    <View style={styles.container}>
      <Modal
        onRequestClose={() => {
          setIsCloseSession(!isCloseSession);
        }}
        animationType="slide"
        transparent={true}
        visible={isCloseSession}>
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
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                  onPress={isClosedYes}
                  style={{
                    backgroundColor: COLORS.green,
                    borderRadius: 4,
                    paddingHorizontal: 10,
                    marginHorizontal: 5,
                  }}>
                  <Text style={{color: COLORS.white}}>Ya</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={isClosedNo}
                  style={{
                    backgroundColor: COLORS.red,
                    borderRadius: 4,
                    paddingHorizontal: 10,
                    marginHorizontal: 5,
                  }}>
                  <Text style={{color: COLORS.white}}>Tidak</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        onRequestClose={() => {
          setModalAskVisible(!modalAskVisible);
        }}
        animationType="slide"
        transparent={true}
        visible={modalAskVisible}>
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
            style={{
              marginHorizontal: 10,
              color: COLORS.black,
            }}
            // name="chevron-back"
            // type="Ionicons"
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
            {'Konsultasi : ' + receiverData.category}
          </Text>
          {/* parameter status isMitra or isConsument */}
          {/* <Text style={{color:"black"}}>{isMitraName}</Text> */}
          {isTypingMitra == true ? (
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 12,
                  fontFamily: FONTS.Regular,
                }}>
                Sedang mengetik ...
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
                {receiverData.orderBatch} -{' '}
              </Text>

              {isMitraName == '' ? (
                <Text
                  style={{
                    color: COLORS.black,
                    fontStyle: 'italic',
                    fontSize: 12,
                    fontFamily: FONTS.Regular,
                  }}>
                  Menunggu Mitra ...
                </Text>
              ) : (
                <Text
                  style={{
                    color: COLORS.black,
                    fontStyle: 'italic',
                    fontSize: 12,
                    fontFamily: FONTS.Regular,
                  }}>
                  {isMitraName}
                </Text>
              )}
            </View>
          )}
        </View>

        {isMitraReply == true && (
          <TouchableOpacity
            onPress={endSession}
            style={{
              height: 24,
              width: 24,
              borderRadius: 40,
              backgroundColor: COLORS.orangeBgIcon,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 5,
              marginRight: 2,
              color: COLORS.black,
            }}>
            <Text
              style={{fontSize: 14, fontWeight: 'bold', color: COLORS.white}}>
              X
            </Text>
          </TouchableOpacity>
        )}
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
            // console.log('KJQEFKVMALKCLAKSCKLSA', category);
            return (
              <MsgComponent
                sender={item.from == userData.id}
                category={category}
                // message={item.message}
                item={item}
                roomId={roomId}
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
            {tnosBonVisible && (
              <View
                style={{
                  backgroundColor: COLORS.white,
                  flexDirection: 'row',
                  borderColor: 'black',
                  borderWidth: 2,
                  borderRadius: 40,
                  paddingHorizontal: 10,
                }}>
                <View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: COLORS.black,
                      fontWeight: 'bold',
                    }}>
                    Total TNOS BONN saat ini:
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.orangeBgIcon,
                      fontWeight: 'bold',
                      marginTop: -5,
                    }}>
                    {tnosBon} Bonn
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 20,
                    color: COLORS.orangeBgIcon,
                    fontWeight: 'bold',
                    marginHorizontal: 4,
                    marginTop: -3,
                  }}>
                  +
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: COLORS.orangeBgIcon,
                    fontWeight: 'bold',
                    marginHorizontal: 4,
                    marginTop: -3,
                  }}>
                  :
                </Text>
              </View>
            )}
            <Image
              source={require('../../Assets/tnos-logo.png')}
              style={{height: 30, width: 30}}
            />
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
        {isMitraName == '' ? (
          <View style={{flexDirection: 'row'}}>
            <CircleIcon></CircleIcon>
            <Text style={{color: COLORS.black}}>
              {' '}
              Sedang Menunggu Mitra , Mohon Tunggu ...
            </Text>
          </View>
        ) : (
          <>
            {isUserReply == true ? (
              <>
                {mitraIsResponse == 'not_response' ? (
                  <>
                    <Row>
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
                        Mitra Tidak Merespon
                      </Text>
                      <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => sendLastMessage()}>
                        <Text style={styles.textStyle}>
                          Kirim Ulang Pesan Terakhir ?
                        </Text>
                      </Pressable>
                    </Row>
                  </>
                ) : (
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
                    Menunggu mitra membalas ...
                  </Text>
                )}
              </>
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
                  maxLength={1000}
                  value={msg}
                  onChangeText={val => {
                    // console.log('val !!!!!!!');
                    // console.log(val);
                    if (val.length != 0) {
                      setIsTyping(true);
                    } else {
                      setIsTyping(false);
                    }
                    setMsg(val);
                  }}
                />
                <TouchableOpacity disabled={disabled} onPress={uploadFile}>
                  {/* onPress={() => setModalAskUpload(true)}> */}
                  <AddIcon
                    size="4"
                    style={{
                      color: COLORS.orangeBgIcon,
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity disabled={disabled} onPress={sendMsg}>
                  <PlayIcon
                    size="6"
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View
            style={{
              margin: 20,
              marginTop: 90,
              backgroundColor: COLORS.orangeBgIconTrans,
              borderRadius: 20,
              padding: 10,
              alignItems: 'flex-end',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>x</Text>
            </Pressable>
            <HelpChat />
          </View>
        </View>
      </Modal>
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
export default SingleChatUser;

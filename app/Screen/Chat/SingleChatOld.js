//import liraries
import {Icon} from 'native-base';
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
// import AlertRed from '../../Assets/AlertRed';
// create a component

const Data = [
  {
    massage: 'Yes Ofcourse..',
    type: 'sender',
  },
  {
    massage: 'How are You ?',
    type: 'sender',
  },
  {
    massage: 'How Your Opinion about the one done app ?',
    type: 'sender',
  },
  {
    massage:
      'Well i am not satisfied with this design plzz make design better ',
    type: 'receiver',
  },
  {
    massage: 'could you plz change the design...',
    type: 'receiver',
  },
  {
    massage: 'How are You ?',
    type: 'sender',
  },
  {
    massage: 'How Your Opinion about the one done app ?',
    type: 'sender',
  },
  {
    massage:
      'Well i am not satisfied with this design plzz make design better ',
    type: 'receiver',
  },
  {
    massage: 'could you plz change the design...',
    type: 'receiver',
  },
  {
    massage: 'How are You ?',
    type: 'sender',
  },
  {
    massage: 'How Your Opinion about the one done app ?',
    type: 'sender',
  },
];

const SingleChat = props => {
  const {userData} = useSelector(state => state.User);

  const {receiverData} = props.route.params;

  // console.log('dataSingleChat', receiverData);

  const [msg, setMsg] = useState('');
  const [disabled, setdisabled] = useState(false);
  const [allChat, setallChat] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tnosBonVisible, setTnosBonVisible] = useState(false);
  const [modalAskVisible, setModalAskVisible] = useState(false);

  const [timeModalAsk, setTimeModalAsk] = useState(0);
  const [modalText, setModalText] = useState('');

  const [endChatToggle, setendChatToggle] = useState('');
  const [tnosBonCut, setTnosBonCut] = useState(10);
  const [tnosBon, setTnosBon] = useState(0);

  let timeOutSet1;
  let timeOutSet2;
  let timeOutSet3;
  let timeOutSet4;
  let timeOutSet5;

  useEffect(()=>{
    database()
      .ref('users/' + userData?.id)
      .once('value')
      .then(snapshot => {
        // console.log('all User data: ', snapshot.val().tnosBon);
        setTnosBon(snapshot.val().tnosBon)
      });
  }, [tnosBon])

  useEffect(() => {
    const onChildAdd = database()
      .ref('/messages/' + receiverData.roomId)
      .on('child_added', snapshot => {
        // console.log('A new node has been added', snapshot.val());
        setallChat(state => [snapshot.val(), ...state]);
      });

    // Stop listening for updates when no longer required
    return () =>
      database()
        .ref('/messages/' + receiverData.roomId)
        .off('child_added', onChildAdd);
  }, [receiverData.roomId]);

  const msgvalid = txt => txt && txt.replace(/\s/g, '').length;

  let allOrderChat;
  let getIdOrderChat;

  const sendMsg = () => {
    if (msg == '' && msgvalid(msg) == 0) {
      SimpleToast.show('Enter something ...');
      return false;
    }

    allOrderChat = allChat.filter(item => item.status == '2');
    getIdOrderChat = allOrderChat.length + 1;

    let msgData = {
      message: msg,
      from: userData?.id,
      to: receiverData.id,
      sendTime: moment().format(),
      msgType: 'text',
      orderId: 'LC-' + receiverData.roomId + '-' + getIdOrderChat,
      status: '0',
      tnosBon: userData?.role == 'user' ? '0' : tnosBonCut.toString(),
    };

    const newReference = database()
      .ref('/messages/' + receiverData.roomId)
      .push();

    // console.log("Timer has been Reset !!!!!");
    // clearTimeout(modalAskTimeout)
    // console.log('Auto generated key: ', newReference.key);
    msgData.id = newReference.key;
    newReference.set(msgData).then(() => {
      
      let chatListUpdate = {
        lastMsg: msg,
        sendTime: msgData.sendTime,
      };

      if (userData?.role == 'mitra') {
        database()
          .ref('/users/' + receiverData.id)
          .update({tnosBon: receiverData.tnosBon - tnosBonCut})
          .then(() => console.log('TNOS Bon updated.'));
      }

      database()
        .ref('/chatlist/' + receiverData.id + '/' + userData.id)
        .update(chatListUpdate)
        .then(() => console.log('Data updated.'));

      database()
        .ref('/chatlist/' + userData.id + '/' + receiverData.id)
        .update(chatListUpdate)
        .then(() => console.log('Data updated.'));

      setMsg('');
      setTimeModalAsk(0);
      clearTimeout(timeOutSet1);
      clearTimeout(timeOutSet2);
      clearTimeout(timeOutSet3);
      clearTimeout(timeOutSet4);
      clearTimeout(timeOutSet5);
    });
  };

  const modalToggle = () => {
    modalVisible ? setModalVisible(false) : setModalVisible(true);
  };
  const tnosBonToggle = () => {
    console.log('tnosBonVisible', tnosBonVisible);
    tnosBonVisible ? setTnosBonVisible(false) : setTnosBonVisible(true);
  };

  setTimeout(() => {
    modalVisible && setModalVisible(false);
  }, 5000);

  useEffect(() => {
    if (userData?.role == 'user') {
      if (timeModalAsk == 0) {
        setModalText(
          `Sudah 1 jam pertannyaan belum di respon oleh mitra pengacara konsultasi, apakah anda ingin mengirim pertanyaan kembali?`,
        );
        timeOutSet1 = setTimeout(() => {
          setModalAskVisible(true);
        }, 20000);
      }
      if (timeModalAsk == 1) {
        setModalText(
          `Sudah 2 jam pertannyaan belum di respon oleh mitra pengacara konsultasi, apakah anda ingin mengirim pertanyaan kembali?`,
        );
        timeOutSet2 = setTimeout(() => {
          setModalAskVisible(true);
        }, 20000);
      }
      if (timeModalAsk == 2) {
        setModalText(
          `Sudah 3 jam pertannyaan belum di respon oleh mitra pengacara konsultasi, dengan ini sistem akan mengakhiri chat konsultasi anda secara otomatis.`,
        );
        timeOutSet3 = setTimeout(() => {
          setModalAskVisible(true);
          timeOutSet4 = setTimeout(() => {
            setModalAskVisible(false);
            renderEndChat();
          }, 20000);
        }, 20000);
      }
    }
  }, [timeModalAsk]);

  const renderEndChat = () => {
    allOrderChat = allChat.filter(item => item.status == '2');
    getIdOrderChat = allOrderChat.length + 1;

    let msgData = {
      message:'',
      from: receiverData.id,
      to: userData?.id,
      sendTime: moment().format(),
      msgType: 'text',
      orderId: 'LC-' + receiverData.roomId + '-' + getIdOrderChat,
      status: '2', // this is status of end chat
      tnosBon: '10',
    };

    const newReference = database()
      .ref('/messages/' + receiverData.roomId)
      .push();

    msgData.id = newReference.key;
    newReference.set(msgData).then(() => {
      

      if (userData?.role == 'user') {
        const finalRes = tnosBon - tnosBonCut
        database()
          .ref('/users/' + userData.id)
          .update({tnosBon: finalRes})
          .then(() => console.log('TNOS Bon updated.'));

        console.log("Final Res ======", finalRes);
        setTnosBon(finalRes)
      }

      // let chatListUpdate = {
      //   lastMsg:
      //     'Terimakasih telah menggunakan layanan konsultasi chat hukum berbayar, terlampir adalah rincian biaya chat konsultasi hukum kamu.😊🙏🏻',
      //   sendTime: msgData.sendTime,
      // };

      // database()
      //   .ref('/chatlist/' + receiverData.id + '/' + userData.id)
      //   .update(chatListUpdate)
      //   .then(() => console.log('Data updated.'));

      // database()
      //   .ref('/chatlist/' + userData.id + '/' + receiverData.id)
      //   .update(chatListUpdate)
      //   .then(() => console.log('Data updated.'));
    });
    setTimeModalAsk(99);
    clearTimeout(timeOutSet1);
    clearTimeout(timeOutSet2);
    clearTimeout(timeOutSet3);
    clearTimeout(timeOutSet4);
    clearTimeout(timeOutSet5);
  };

  const modalAskNo = () => {
    setModalAskVisible(false);
    if (timeModalAsk == 0) {
      setTimeModalAsk(1);
    }
    if (timeModalAsk == 1) {
      setTimeModalAsk(2);
    }
    if (timeModalAsk == 2) {
      setTimeModalAsk(3);
    }
  };

  const modalAskYes = () => {
    console.log('modal ask Yes ===== >');
    console.log('Thank You, This Is Invoice');
    setModalAskVisible(false);
    renderEndChat();
  };

  //   const sorted = () => {
  //     return allChat.sort(function (a, b) {
  //       return new Date(b.sendTime) < new Date(a.sendTime)
  //         ? -1
  //         : new Date(b.sendTime) > new Date(a.sendTime)
  //         ? 1
  //         : 0;
  //     });
  //   };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAskVisible}
        // onRequestClose={() => {
        //   console.log('this is CLOSEEEEEE===');
        //   setModalAskVisible(!modalAskVisible);
        // }}
      >
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
                {/* <AlertRed style={{ marginTop: 20 }} /> */}
                {/* <View style={{backgroundColor: COLORS.red}}> */}
                <Icon
                  style={{
                    backgroundColor: COLORS.red,
                    borderRadius: 10,
                    paddingTop: 10,
                    paddingHorizontal: 10,
                    color: COLORS.black,
                    fontSize: 14,
                    height: 34,
                  }}
                  name="alert"
                  type="Ionicons"
                  onPress={() => Navigation.back()}
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
              {timeModalAsk == 2 ? (
                <View></View>
              ) : (
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <TouchableOpacity
                    onPress={modalAskYes}
                    style={{
                      backgroundColor: COLORS.green,
                      borderRadius: 4,
                      paddingHorizontal: 10,
                      marginHorizontal: 5,
                    }}>
                    <Text style={{color: COLORS.white}}>Ya</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={modalAskNo}
                    style={{
                      backgroundColor: COLORS.red,
                      borderRadius: 4,
                      paddingHorizontal: 10,
                      marginHorizontal: 5,
                    }}>
                    <Text style={{color: COLORS.white}}>Tidak</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* <ChatHeader data={receiverData} /> */}
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
        <Icon
          style={{
            marginHorizontal: 10,
            color: COLORS.black,
          }}
          name="chevron-back"
          type="Ionicons"
          onPress={() => Navigation.back()}
        />
        {receiverData.img == '' ? (
          <Avatar
            source={require('../../Assets/user-icon.png')}
            rounded
            size="small"
          />
        ) : (
          <Avatar source={{uri: receiverData.img}} rounded size="small" />
        )}

        <View style={{flex: 1, marginLeft: 10}}>
          <Text
            numberOfLines={1}
            style={{
              color: COLORS.black,
              fontSize: 16,
              fontFamily: FONTS.SemiBold,
              textTransform: 'capitalize',
            }}>
            {receiverData.name}
          </Text>
          {/* parameter status isMitra or isConsument */}
          {receiverData.role == 'mitra' && (
            <Text
              style={{
                color: COLORS.black,
                fontSize: 10,
                fontFamily: FONTS.Regular,
              }}>
              Chat Legal Consultant
            </Text>
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
            return (
              <MsgComponent
                sender={item.from == userData.id}
                // message={item.message}
                item={item}
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
                {userData?.role == 'mitra' ? (
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Modal Akhir');
                      setModalAskVisible(true);
                      setModalText(
                        'Apabila sesi konsultasi chat dirasa sudah memenuhi ekspektasi anda, maka silahkan klik tombol berikut untuk menyudahi sesi konsultasi.',
                      );
                    }}>
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
                ) : (
                  <>
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
                  </>
                )}
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
        <TextInput
          style={{
            width: '80%',
            borderRadius: 25,
            borderWidth: 0.5,
            borderColor: COLORS.black,
            paddingHorizontal: 15,
            color: COLORS.black,
          }}
          placeholder="Type a message"
          placeholderTextColor={COLORS.black}
          multiline={true}
          value={msg}
          onChangeText={val => setMsg(val)}
        />

        <TouchableOpacity disabled={disabled} onPress={sendMsg}>
          <Icon
            style={{
              color: COLORS.orangeBgIcon,
            }}
            name="paper-plane-sharp"
            type="Ionicons"
          />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>x</Text>
            </Pressable> */}
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
    justifyContent: 'flex-start',
    alignItems: 'center',
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
export default SingleChat;

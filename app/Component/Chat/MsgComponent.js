// import moment from 'moment';
import React, {Component, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import {COLORS} from '../Constant/Color';
import {FONTS} from '../Constant/Font';
import TimeDelivery from './TimeDelivery';
import {Icon} from 'native-base';
import Navigation from '../../Service/Navigation';
import {useSelector} from 'react-redux';
import Hyperlink from 'react-native-hyperlink';
import moment from 'moment';
import ReadMore from '@fawazahmed/react-native-read-more';

const {width} = Dimensions.get('window');

const MsgComponent = props => {
  const {userData} = useSelector(state => state.User);
  const {sender, message, item, sendTime, category, roomId, receiverId} = props;
  const [imgOpen, setimgOpen] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    const currentDate = new Date();
    const sendTime = currentDate.getTime();
    var startTime = '08:00:00';
    // var endTime = '23:59:00'; 
    var endTime = '21:59:00'; 
    startDate = new Date(sendTime);
    startDate.setHours(startTime.split(":")[0]);
    startDate.setMinutes(startTime.split(":")[1]);
    startDate.setSeconds(startTime.split(":")[2]);
    endDate = new Date(sendTime);
    endDate.setHours(endTime.split(":")[0]);
    endDate.setMinutes(endTime.split(":")[1]);
    endDate.setSeconds(endTime.split(":")[2]);
    validTime = startDate < sendTime && endDate > sendTime
    if (validTime == true) {
      setIsDraft(true);
    }
  }, [isDraft])
  

  return (
    <>
      {item.status == '2' && (
        <>
          <View>
            <Text style={{textAlign: 'center'}}>
              {moment(item.sendTime).format('LL')}
            </Text>
          </View>
        </>
      )}

      {item.msgType == 'img' ? (
        <Pressable
          style={{marginVertical: 0}}
          onPress={() => {
            Navigation.navigate('OpenImgInChat', {
              imgLink: item.urlMedia + item.message,
            });
          }}>
          <View
            style={[
              styles.TriangleShapeCSS,
              sender ? styles.right : [styles.left],
            ]}
          />
          <View
            style={[
              styles.masBox,
              {
                alignSelf: sender ? 'flex-end' : 'flex-start',
                backgroundColor: sender ? '#E9E9EB' : COLORS.theme,
              },
            ]}>
            <Image
              source={{uri: item.urlMedia + item.message}}
              style={{
                height: 150,
                width: width / 1.5,
                resizeMode: 'cover',
                borderRadius: 5,
              }}
            />
            <Text style={{color: sender ? COLORS.black : 'white'}}>
              {item.caption}
            </Text>
            <TimeDelivery sender={sender} item={item} />
          </View>
        </Pressable>
      ) : item.msgType == 'file' ? (
        <Pressable style={{marginVertical: 0}}>
          <View
            style={[
              styles.masBox,
              {
                alignSelf: sender ? 'flex-end' : 'flex-start',
                backgroundColor: sender ? '#E9E9EB' : COLORS.theme,
              },
            ]}>
            <TouchableOpacity
              style={{marginTop: 7, flexDirection: 'row'}}
              onPress={async () => {
                const url = item.urlMedia + item.message;
                const canOpen = await Linking.canOpenURL(url);
                if (canOpen) {
                  Linking.openURL(url);
                  SimpleToast.show('Mendownload File, Mohon Tunggu ...');
                }
              }}>
              <Image
                source={require('../../Assets/file_solid.png')}
                style={{height: 40, width: 40}}
              />
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 12,
                  fontStyle: 'italic',
                  marginTop: 10,
                }}>
                {item.filename.length > 40
                  ? item.filename.slice(0, 80) + '...'
                  : item.filename}
              </Text>
            </TouchableOpacity>
            <Text style={{marginHorizontal: 20, color: COLORS.black}}>
              {item.caption}
            </Text>
            <TimeDelivery sender={sender} item={item} />
          </View>
        </Pressable>
      ) : (
        <View>
          {/* <Text>{item.role}</Text> */}
          {item.status == 99 ? (
            <>
              {userData.role == 'user' ? (
                <Pressable style={{marginVertical: 0}}>
                  <View
                    style={[
                      styles.TriangleShapeCSS,
                      sender ? styles.right : [styles.left],
                    ]}
                  />

                  <View
                    style={[
                      styles.masBox,
                      {
                        alignSelf: sender ? 'flex-end' : 'flex-start',
                        // borderWidth:1,
                        backgroundColor: sender ? '#E9E9EB' : COLORS.theme,
                      },
                    ]}>
                      {isDraft == false && (
                    <Text
                      style={{
                        paddingLeft: 5,
                        color: 'red',
                        fontFamily: FONTS.Regular,
                        fontSize: 12,
                      }}>
                      Draft
                    </Text>
                      )}
                    <Hyperlink
                      linkStyle={{color: '#2980b9'}}
                      onPress={async url => {
                        const canOpen = await Linking.canOpenURL(url);
                        if (canOpen) {
                          Linking.openURL(url);
                          console.log('yooo');
                        }
                      }}>
                      {item.message.length >= 100 ? (
                        <ReadMore
                          numberOfLines={3}
                          seeMoreText="Lihat Selengkapnya ..."
                          seeLessText="Tutup"
                          style={{
                            paddingLeft: 5,
                            color: sender ? COLORS.black : COLORS.white,
                            fontFamily: FONTS.Regular,
                            fontSize: 13.5,
                          }}>
                          {item.message}
                        </ReadMore>
                      ) : (
                        <Text
                          style={{
                            paddingLeft: 5,
                            color: sender ? COLORS.black : COLORS.white,
                            fontFamily: FONTS.Regular,
                            fontSize: 13.5,
                          }}>
                          {item.message}
                        </Text>
                      )}
                    </Hyperlink>

                    <TimeDelivery sender={sender} item={item} />
                  </View>
                </Pressable>
              ) : (
                <></>
              )}
            </>
          ) : (
            <>
              {item.status == 2 ? (
                category == 'personal' ? (
                  <EndSessionPersonal roomId={roomId} receiverId={receiverId} />
                ) : category == 'personal' ? (
                  <EndSessionCorp roomId={roomId} receiverId={receiverId} />
                ) : userData.role == 'mitra' ? (
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: '#2FCC59',
                        marginHorizontal: 20,
                        borderRadius: 20,
                        padding: 20,
                      }}>
                      <TouchableOpacity
                        style={{marginTop: 7}}
                        onPress={() =>
                          Navigation.navigate('InvoiceChat', {
                            roomId,
                            receiverId,
                          })
                        }>
                        <Image
                          source={require('../../Assets/file_solid.png')}
                          style={{height: 40, width: 40}}
                        />
                        <Text style={{color: COLORS.black, fontSize: 10}}>
                          {/* {roomId} */}
                          Invoice ...
                        </Text>
                      </TouchableOpacity>
                      <Text style={{marginHorizontal: 20, color: COLORS.black}}>
                        Terimakasih telah memberikan konsultasi terbaik Anda
                        disini
                      </Text>
                    </View>
                    <Text
                      style={{
                        textAlign: 'center',
                        marginVertical: 10,
                        color: 'gray',
                      }}>
                      -- Sesi konsultasi chat saat ini selesai --
                    </Text>
                  </View>
                ) : (
                  // <View>
                  //   <View
                  //     style={{
                  //       flexDirection: 'row',
                  //       backgroundColor: COLORS.green,
                  //       marginHorizontal: 20,
                  //       borderRadius: 20,
                  //       padding: 20,
                  //     }}>
                  //     <Text style={{marginHorizontal: 20}}>
                  //       Terimakasih telah memberikan konsultasi terbaik Anda disini
                  //     </Text>
                  //   </View>
                  //   <Text
                  //     style={{
                  //       textAlign: 'center',
                  //       marginVertical: 10,
                  //       color: 'gray',
                  //     }}>
                  //     -- Sesi konsultasi chat saat ini selesai --
                  //   </Text>
                  // </View>
                  <></>
                )
              ) : (
                <Pressable style={{marginVertical: 0}}>
                  <View
                    style={[
                      styles.TriangleShapeCSS,
                      sender ? styles.right : [styles.left],
                    ]}
                  />
                  <View
                    style={[
                      styles.masBox,
                      {
                        alignSelf: sender ? 'flex-end' : 'flex-start',
                        // borderWidth:1,
                        backgroundColor: sender ? '#E9E9EB' : COLORS.theme,
                      },
                    ]}>
                    <Hyperlink
                      linkStyle={{color: '#2980b9'}}
                      onPress={async url => {
                        const canOpen = await Linking.canOpenURL(url);
                        if (canOpen) {
                          Linking.openURL(url);
                          console.log('yooo');
                        }
                      }}>
                      {item.message.length >= 100 ? (
                        <ReadMore
                          numberOfLines={3}
                          seeMoreText="Lihat Selengkapnya ..."
                          seeLessText="Tutup"
                          style={{
                            paddingLeft: 5,
                            color: sender ? COLORS.black : COLORS.white,
                            fontFamily: FONTS.Regular,
                            fontSize: 13.5,
                          }}>
                          {item.message}
                        </ReadMore>
                      ) : (
                        <Text
                          style={{
                            paddingLeft: 5,
                            color: sender ? COLORS.black : COLORS.white,
                            fontFamily: FONTS.Regular,
                            fontSize: 13.5,
                          }}>
                          {item.message}
                        </Text>
                      )}
                    </Hyperlink>

                    <TimeDelivery sender={sender} item={item} />
                  </View>
                </Pressable>
              )}
            </>
          )}
        </View>
      )}
    </>
  );
};

function EndSessionCorp(props) {
  const {roomId, receiverId} = props;
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: COLORS.green,
          marginHorizontal: 20,
          borderRadius: 20,
          padding: 20,
        }}>
        <Text style={{marginHorizontal: 20}}>
          Terimakasih telah menggunakan layanan konsultasi chat hukum
          berbayar.😊🙏🏻
        </Text>
      </View>
      <Text style={{textAlign: 'center', marginVertical: 10, color: 'gray'}}>
        -- Sesi konsultasi chat saat ini selesai --
      </Text>
    </View>
  );
}
function EndSessionPersonal(props) {
  const {roomId, receiverId} = props;
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#2FCC59',
          marginHorizontal: 20,
          borderRadius: 20,
          padding: 20,
        }}>
        <TouchableOpacity
          style={{marginTop: 7}}
          onPress={() =>
            Navigation.navigate('InvoiceChat', {roomId, receiverId})
          }>
          <Image
            source={require('../../Assets/file_solid.png')}
            style={{height: 40, width: 40}}
          />
          <Text style={{color: COLORS.black, fontSize: 10}}>Invoice ...</Text>
        </TouchableOpacity>
        <Text style={{marginHorizontal: 20, color: COLORS.black}}>
          Terimakasih telah menggunakan layanan konsultasi chat hukum berbayar,
          terlampir adalah rincian biaya chat konsultasi hukum kamu.😊🙏🏻
        </Text>
      </View>
      <Text style={{textAlign: 'center', marginVertical: 10, color: 'gray'}}>
        -- Sesi konsultasi chat saat ini selesai --
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  masBox: {
    alignSelf: 'flex-end',
    marginHorizontal: 10,
    minWidth: 80,
    maxWidth: '80%',
    paddingHorizontal: 10,
    marginVertical: 5,
    paddingTop: 5,
    borderRadius: 8,
  },
  timeText: {
    fontFamily: 'AveriaSerifLibre-Light',
    fontSize: 10,
  },
  dayview: {
    alignSelf: 'center',
    height: 30,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: COLORS.white,
    borderRadius: 30,
    marginTop: 10,
  },
  iconView: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: COLORS.themecolor,
  },
  TriangleShapeCSS: {
    position: 'absolute',
    // top: -3,
    width: 0,
    height: 0,
    // borderBottomLeftRadius:5,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 5,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    // borderBottomColor: '#757474'
  },
  left: {
    borderBottomColor: COLORS.theme,
    left: 2,
    bottom: 10,
    transform: [{rotate: '0deg'}],
  },
  right: {
    borderBottomColor: '#E9E9EB',
    right: 2,
    // top:0,
    bottom: 5,
    transform: [{rotate: '103deg'}],
  },
});

export default MsgComponent;

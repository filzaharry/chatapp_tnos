import {View, Text, FlatList, StatusBar, TouchableOpacity, Image, Dimensions} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import database from '@react-native-firebase/database';
import {COLORS} from '../../Component/Constant/Color';
import {ChevronLeftIcon, Icon} from 'native-base';
import {FONTS} from '../../Component/Constant/Font';
import {ScrollView} from 'react-native-gesture-handler';
import Navigation from '../../Service/Navigation';

const {width}= Dimensions.get("window")
const InvoiceChat = props => {
  const {userData} = useSelector(state => state.User);
  const {roomId, receiverId} = props.route.params;
  const [allChat, setallChat] = useState([]);
  const [receiverData, setReceiverData] = useState({});
  const [totalTnosBon, setTotalTnosBon] = useState(0);

  
  let pathGetChat = '';

  useEffect(() => {
    getTnosSum();
    getChatList();
    getReceiver(receiverId);
    
  }, [totalTnosBon]);

  const getReceiver = receiverId => {
    database()
      .ref('/users/' + receiverId)
      .once('value')
      .then(snapshot => {
        setReceiverData(snapshot.val());
      });
  };

  const getChatList = () => {
    if (userData?.role == 'mitra') {
      pathGetChat = '/messages/' + receiverId + '/' + roomId;
    } else if (userData?.role == 'user') {
      pathGetChat = '/messages/' + userData.id + '/' + roomId;
    }
    database()
      .ref(pathGetChat)
      .once('value')
      .then(snapshot => {
        setallChat(Object.values(snapshot.val()));

      });
  };
  const getTnosSum = () => {
    if (userData?.role == 'mitra') {
      pathGetChat = '/messages/' + receiverId + '/' + roomId;
    } else if (userData?.role == 'user') {
      pathGetChat = '/messages/' + userData.id + '/' + roomId;
    }

    // console.log("pathGetChat");
    // console.log(pathGetChat);
    database()
      .ref(pathGetChat)
      .once('value')
      .then(snapshot => {
        // setallChat(Object.values(snapshot.val()));

        let sumTnosBon = 0
        for (let i = 0; i < Object.values(snapshot.val()).length; i ++) {
          const number = parseFloat(Object.values(snapshot.val())[i].tnosBon);//Convert to numbers with parseFloat
          // sumTnosBon ++;//Sum the numbers
          sumTnosBon += number;//Sum the numbers
        }
        // console.log("sumTnosBon");
        // console.log(sumTnosBon);
        setTotalTnosBon(sumTnosBon)
      });
  };

  return (
    <View>
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
            {'Invoice Chat'}
          </Text>
          <Text
            style={{
              color: COLORS.black,
              fontSize: 10,
              fontFamily: FONTS.Regular,
            }}>
            {'OrderId : LC-' + roomId + '-1'}
          </Text>
        </View>
      </View>
      <ScrollView>
        {allChat.map((chat, i) => {
          return (
            <View key={i}
            style={{paddingBottom:4,marginVertical: 6,marginHorizontal:20, borderBottomWidth:1,borderBottomColor:'#A9A9A9'}}
            >
              {chat.from == userData.id ? (
                <Text style={{color:COLORS.black}}>{userData.name}</Text>
              ) : (
                <Text style={{color:COLORS.black}}>{receiverData.name}</Text>
                )}
              <Text style={{fontSize:10,fontStyle:'italic', color:COLORS.black}}>{chat.sendTime}</Text>
              {chat.msgType == 'text' && <Text>{chat.message == ''? 'Tidak Ada Pesan' : chat.message }</Text>}
              {chat.msgType == 'img' && (
                <Image
                  source={{uri: chat.urlMedia + chat.message}}
                  style={{
                    height: 150,
                    width: width / 1.5,
                    resizeMode: 'cover',
                    borderRadius: 5,
                  }}
                />
              )}
            </View>
          );
        })}
        <View style={{marginBottom: 100, marginVertical: 6,marginHorizontal:20}}>
          <Text style={{fontSize:16,fontWeight:'bold', color:COLORS.black}}>Total TNOS Bon yang digunakan : {totalTnosBon}</Text>
        </View>
      </ScrollView>
    </View>
  );
};
export default InvoiceChat;

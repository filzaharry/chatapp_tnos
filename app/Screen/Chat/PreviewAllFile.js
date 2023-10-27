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
import {AddIcon, ChevronLeftIcon, Icon, PlayIcon} from 'native-base';
import {FONTS} from '../../Component/Constant/Font';
import Navigation from '../../Service/Navigation';
import SimpleToast from 'react-native-simple-toast';
import {forEach} from 'lodash';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import moment from 'moment';
import DocumentPicker, {types} from 'react-native-document-picker';

const {width} = Dimensions.get('window');

const PreviewAllFile = props => {
  const {receiverData, userData, fileData, getIdOrderChat, category, roomId} =
    props.route.params;
  const [caption, setCaption] = useState('');
  const [disabled, setdisabled] = useState(false);
  // const [process, setProcess] = useState('');
  const [resultData, setResultData] = useState([]);
  const [sortResult, setSortResult] = useState([]);
  const [tnosPoint, setTnosPoint] = useState(0);
  const [sumValueTnos, setSumValueTnos] = useState(0);
  const [tnosBonData, setTnosBonData] = useState(0);
  const [alertTopUpTnos, setAlertTopUpTnos] = useState(false);
  const [toggleSend, setToggleSend] = useState(false);

  const [tnosBeforeSend, setTnosBeforeSend] = useState(0);

  // list before send to msglist
  const [uploadObjArray, setUploadObjArray] = useState([]);
  const [uploadObjCount, setUploadObjCount] = useState(0);
  // const [loadingProcess, setLoadingProcess] = useState(false);

  const urlMedia =
    'https://firebasestorage.googleapis.com/v0/b/chatapp-bc4ce.appspot.com/o/chatMedia';

  useEffect(() => {
    database()
      .ref('/users/' + userData?.id)
      .on('value', snapshot => {
        setTnosPoint(snapshot.val().tnosBon);
        // setTnosBonData(snapshot.val().tnosBonTemp);
      });

    const tnosBonCheck = resultData.map(function (element) {
      return element.type == 'application/pdf'
        ? 5
        : 1;
    });
    tnosBonCheck.push(2); // point for caption

    const validateTnosBon = tnosBonCheck.reduce(
      (partialSum, a) => partialSum + a,
      0,
    );

    if (tnosPoint >= validateTnosBon) {
      setTnosBonData(validateTnosBon)
      setAlertTopUpTnos(false);
    } else {
      setAlertTopUpTnos(true);
      // console.log('insuficient to data');
    }

    setSortResult(
      resultData.sort(function (a, b) {
        return a.type < b.type ? 1 : b.type < a.type ? -1 : 0;
      }),
    );
  }, [resultData, tnosPoint, sortResult]);

  useEffect(() => {
    if (tnosBonData > 0 && toggleSend == false) {
      updateTnosBonTemp();
    }
  }, [tnosBonData]);

  useEffect(() => {
    if (uploadObjArray.length != 0) {
      if (uploadObjCount == uploadObjArray.length) {
        // console.log('LETS GOOOO PROCESSSSS---->>>>');
          sendCaption();
        setToggleSend(false);
      }
    }
  }, [uploadObjArray, caption]);

  const uploadAllFile = () => {
    setToggleSend(true);
    setUploadObjCount(sortResult.length);

    const sumSizeImg = sortResult
      .filter(function (element) {
        return element.type == 'image/jpeg';
      })
      .reduce((accumulator, object) => {
        return accumulator + object.size;
      }, 0);
    const sumSizePdf = sortResult
      .filter(function (element) {
        return element.type == 'application/pdf';
      })
      .reduce((accumulator, object) => {
        return accumulator + object.size;
      }, 0);

    let bonnSum;
    sortResult.forEach((file) => {
      if (file.type == 'application/pdf') {
        bonnSum = 5;
        // setTnosBonData(state => state + bonnSum);
      } else {
      // } else if (file.type == 'image/jpeg') {
        bonnSum = 1;
        // setTnosBonData(state => state + bonnSum);
      }
      // console.log("========>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      // console.log(tnosBonData);
      // console.log(bonnSum);
      // setTnosBonData(state => state + bonnSum);
    });
    if (tnosPoint < tnosBonData) {
      Alert.alert('TNOS Bon tidak cukup, segera topup poin Anda');
      return false;
    } else if (sortResult.length > 6) {
      // validasi ukuran maksimum semua foto 1 mb
      Alert.alert('Upload File Gagal', 'Jumlah semua file lebih dari 6 file', [
        {text: 'Tutup', onPress: () => console.log('Tutup Pressed')},
      ]);
      return false;
    } else if (
      sortResult.filter(function (element) {
        return element.type == 'image/jpeg';
      }).length > 5
    ) {
      Alert.alert('Upload File Gagal', 'Jumlah Gambar / Foto Lebih Dari 5', [
        {text: 'Tutup', onPress: () => console.log('Tutup Pressed')},
      ]);
      return false;
    } else if (
      sortResult.filter(function (element) {
        return element.type == 'application/pdf';
      }).length > 1
    ) {
      Alert.alert('Upload File Gagal', 'Jumlah Dokumen Lebih Dari 1', [
        {text: 'Tutup', onPress: () => console.log('Tutup Pressed')},
      ]);
      return false;
    } else if (sumSizePdf >= 1000000) {
      Alert.alert('Upload Dokumen Gagal', 'Ukuran Dokumen Lebih Dari 1 MB', [
        {text: 'Tutup', onPress: () => console.log('Tutup Pressed')},
      ]);
      return false;
    } else if (sumSizeImg >= 3000000) {
      Alert.alert(
        'Upload Dokumen Gagal',
        'Ukuran Gambar / foto Lebih Dari 3 MB',
        [{text: 'Tutup', onPress: () => console.log('Tutup Pressed')}],
      );
      return false;
    } else if (caption == '') {
      Alert.alert('Upload Dokumen Gagal', 'Anda Belum Mengisi Keterangan', [
        {text: 'Tutup', onPress: () => console.log('Tutup Pressed')},
      ]);
      return false;
    } else {
      // setCaption(caption);
      // console.log("CAPTION =============>>>>>>>>>>>>>>");
      // console.log(caption);
      sortResult.forEach((file, i) => {
        // console.log(
        //   'PROCCESS UPLOAD PDF AND CAPTION =============>>>>>>>>>>>>>>',
        // );

        // check waktu buka live chat dari jam 08.00 - 21.59
        const currentDate = new Date();
        const sendTime = currentDate.getTime();
        var startTime = '08:00:00';
        var endTime = '21:59:00';

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
          Alert.alert(
            'Informasi',
            'Chat Anda Terkirim namun karna batas waktu konsultasi adalah jam 08.00 - 21.59, maka mitra akan membalas pada saat jam konsultasi dibuka',
          );
        }

        let pathStorage;
        if (file.type == 'application/pdf') {
          pathStorage = 'chatMedia/pdf/';
          const reference = storage().ref(pathStorage + file.name);
          const task = reference.putFile(
            file.fileCopyUri.replace('file://', ''),
          );
          // setTimeout(() => {
            task.on('state_changed', taskSnapshot => {
              const result = `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`;
              // setProcess(result);
              // console.log(result);
            });
            task.then(async () => {
              // setProcess('');
              await storage()
                .ref(pathStorage + file.name)
                .getDownloadURL()
                .then(val => {
                  // console.log('val PDFFFFF =========>>>>>>>>>>');
                  // console.log(val);
                  setUploadObjArray(state => [...state, val]);
                  uploadSikat(file, val)
                  // arrayFile.push(val[i])
                });
            });
          // }, 2000);
        } else {
          pathStorage = 'chatMedia/image/';
          const referenceImg = storage().ref(pathStorage + file.name);
          const taskImg = referenceImg.putFile(
            file.fileCopyUri.replace('file://', ''),
          );
          // setTimeout(() => {
          taskImg.on('state_changed', taskSnapshot => {
            const result = `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`;
            // setProcess(result);
            // console.log(result);
          });
          taskImg.then(async () => {
            // setProcess('');
            await storage()
              .ref(pathStorage + file.name)
              .getDownloadURL()
              .then(val => {
                // console.log('val IMGGGGGGGGG =========>>>>>>>>>>');
                // console.log(val);
                setUploadObjArray(state => [...state, val]);
                uploadSikat(file, val)
                // arrayFile.push(val[i])
              });
          });
        }
      });
    }
  };

  const uploadSikat = (file, urlMedia) => {
    // let pathStorage;
    // let tnosBonNominal;
    // let fileType;
    // let getFilename;
    // getFilename = uploadObjArray.sort(function (a, b) {
    //   // console.log(a.type);
    //   // console.log(b.type);
    //   return a.type < b.type ? 1 : b.type < a.type ? -1 : 0;
    // }),
    // sortResult.forEach((file, i) => {
    if (file.type == 'application/pdf') {
      pathStorage = 'chatMedia/pdf/';
      tnosBonNominal = 5; //  kirim dokumen = 5 point
      fileType = 'file';
    } else {
      pathStorage = 'chatMedia/image/';
      tnosBonNominal = 1; //  kirim gambar = 1 point
      fileType = 'img';
    }
    // setTnosBonData(state => state + tnosBonNominal);
    let msgData = {
      filename: file.name,
      message: urlMedia,
      from: userData?.id,
      to: receiverData.id,
      sendTime: moment().format(),
      msgType: fileType,
      status: '0',
      tnosBon: tnosBonNominal,
      urlMedia: urlMedia,
      category: category,
    };
    // console.log(msgData);
    updateMsgToFirebase(msgData, receiverData);
   
  };


  const sendCaption = () => {
    tnosBonNominal = 2;
    let msgData = {
      message: caption,
      from: userData?.id,
      to: receiverData.id,
      sendTime: moment().format(),
      msgType: 'text',
      status: '0',
      tnosBon: tnosBonNominal, // kirim text pertanyaan = 2 point
      category: category,
    };
    // setTnosBonData(state => state + tnosBonNominal);
    updateMsgToFirebase(msgData, receiverData);
    Navigation.back();
  };

  const updateTnosBonTemp = () => {
    
    let tnosBonTempUpdate = {
      tnosBonTemp: tnosBonData,
    };

    database()
      .ref('/users/' + userData?.id)
      .update(tnosBonTempUpdate)
      .then(() => console.log('Tnos Bon Temporary Data Updated.'));
  };

  const updateMsgToFirebase = (msgData, receiverData) => {
    const newReference = database()
      .ref('/messages/' + userData?.id + '/' + roomId)
      .push();

    msgData.id = newReference.key;
    newReference.set(msgData).then(() => {
      let chatListUpdate = {
        lastMsg: msgData.message,
        sendTime: msgData.sendTime,
        msgType: msgData.msgType,
        status: receiverData.status == 2 ?? 0,
        isMitraReply: false, // jika true maka user tidak boleh mengirim pesan sampai status isUserReply berubah jadi false
        isUserReply: true, // jika true maka mitra tidak boleh membalas sampai status isMitraReply berubah jadi false
        // isUserReply: true, // jika true maka mitra tidak boleh membalas sampai status isMitraReply berubah jadi false
      };

      database()
        .ref('/chatlist/' + userData?.id + '/' + category)
        .update(chatListUpdate)
        .then(() => console.log('Chatlist Data Updated.'));

      // updateTnosBonTemp();
      // setCaption('');
    });
  };

  const uploadFile = async () => {
    // setModalAskUpload(false);
    // console.log('ambil woy');
    try {
      const files = await DocumentPicker.pick({
        // multiple: true,
        allowMultiSelection: true,
        type: [types.pdf, types.images],
        copyTo: 'cachesDirectory',
      });
      // if (files.length > 1) {
      files.forEach(async function (data) {
        setResultData(state => [...state, data]);
      });
      // } else {
      // }
      // setResultData(files);
      // setResultData(resultData.push(files));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled upload', err);
      } else {
        console.log(err);
      }
    }
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
            Upload Dokumen / Gambar
          </Text>
        </View>
      </View>
      <ScrollView style={{flexDirection: 'column'}}>
        {resultData.length > 6 && (
          <View
            style={{
              backgroundColor: '#FF4E4E',
              paddingVertical: 10,
              alignItems: 'center',
            }}>
            <Text style={{color: 'white'}}>
              Jumlah file yang Anda upload telah melebih batas maksimum
            </Text>
          </View>
        )}
        {resultData.filter(function (element) {
          return element.type == 'image/jpeg';
        }).length > 5 && (
          <View
            style={{
              backgroundColor: '#FF4E4E',
              paddingVertical: 10,
              alignItems: 'center',
            }}>
            <Text style={{color: 'white'}}>
              Jumlah gambar / foto yang Anda upload telah melebih batas maksimum
            </Text>
          </View>
        )}
        {resultData.filter(function (element) {
          return element.type == 'application/pdf';
        }).length > 1 && (
          <View
            style={{
              backgroundColor: '#FF4E4E',
              paddingVertical: 10,
              alignItems: 'center',
            }}>
            <Text style={{color: 'white'}}>
              Jumlah dokumen yang Anda upload telah melebih batas maksimum
            </Text>
          </View>
        )}
        {resultData.length == 0 && (
          <View
            style={{
              alignContent: 'center',
              alignItems: 'center',
              marginTop: 100,
            }}>
            <Text>Belum ada data</Text>
            <TouchableOpacity
              onPress={uploadFile}
              style={{
                backgroundColor: COLORS.orangeBgIcon,
                padding: 10,
                borderRadius: 4,
                marginTop: 10,
              }}>
              <Text style={{color: 'white'}}>Upload Foto / Dokumen</Text>
            </TouchableOpacity>
          </View>
        )}
        {resultData.map((itm, i) => {
          return (
            <View key={i} style={{flexDirection: 'row'}}>
              {itm.type == 'image/jpeg' ? (
                <Image
                  source={{uri: itm.fileCopyUri}}
                  style={{
                    height: 60,
                    width: 60,
                    resizeMode: 'cover',
                    borderRadius: 5,
                    marginTop: 10,
                    marginLeft: 10,
                  }}
                />
              ) : (
                <View
                  style={{
                    backgroundColor: '#C3C3C3',
                    borderRadius: 5,
                    width: 60,
                    alignItems: 'center',
                    alignSelf: 'center',
                    paddingVertical: 10,
                    marginTop: 14,
                    marginLeft: 10,
                  }}>
                  <View>
                    <Image
                      source={require('../../Assets/file_solid.png')}
                      style={{height: 40, width: 40}}
                    />
                    {/* <Text style={{fontSize: 12, fontWeight: 'bold', textAlign:'center'}}>.PDF</Text> */}
                  </View>
                </View>
              )}
              <View style={{marginLeft: 10, marginTop: 10}}>
                <Text style={{fontWeight: 'bold', color: COLORS.black}}>
                  {itm.name}
                </Text>
                <Text style={{color: COLORS.black}}>
                  {itm.size / 1000 + 'KB'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    var index = resultData.indexOf(itm);
                    if (index !== -1) {
                      setResultData(
                        resultData.filter(function (remove) {
                          return remove !== itm;
                        }),
                      );
                      SimpleToast.show('File dihapus');
                    }
                  }}>
                  <Text style={{color: '#FF4E4E'}}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {alertTopUpTnos == false ? (
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
              backgroundColor: 'white',
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
          <TouchableOpacity disabled={disabled} onPress={uploadFile}>
            <AddIcon
              size="4"
              style={{
                color: COLORS.orangeBgIcon,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => {
              uploadAllFile();
              // if (sortResult.length == 0 && resultData.length != 0) {
              //   uploadAllFile();
              // }
            }}>
            <PlayIcon
              style={{
                color: COLORS.orangeBgIcon,
              }}
              size="8"
            />
          </TouchableOpacity>
        </View>
      ) : (
        // <>
        //   {toggleSend == false ? (
        //     <View
        //       style={{
        //         flexDirection: 'row',
        //         justifyContent: 'space-evenly',
        //         alignItems: 'center',
        //         paddingVertical: 7,
        //       }}>
        //       <TextInput
        //         style={{
        //           width: '80%',
        //           borderRadius: 25,
        //           borderWidth: 0.5,
        //           borderColor: COLORS.black,
        //           paddingHorizontal: 15,
        //           color: COLORS.black,
        //           backgroundColor: 'white',
        //         }}
        //         placeholder="Tambah Keterangan"
        //         placeholderTextColor={COLORS.black}
        //         //   multiline={true}
        //         value={caption}
        //         onChangeText={val => {
        //           if (val.length > 1000) {
        //             Alert.alert(
        //               'Jumlah karakter pesan yang di perbolehkan maksimal 1000 Karakter',
        //               [
        //                 {
        //                   text: 'Tutup',
        //                   onPress: () => console.log('Tutup Pressed'),
        //                 },
        //               ],
        //             );
        //             return false;
        //           }
        //           setCaption(val);
        //         }}
        //       />
        //       <TouchableOpacity disabled={disabled} onPress={uploadFile}>
        //         <AddIcon
        //           size="4"
        //           style={{
        //             color: COLORS.orangeBgIcon,
        //           }}
        //         />
        //       </TouchableOpacity>
        //       <TouchableOpacity
        //         disabled={disabled}
        //         onPress={() => {
        //           uploadAllFile();
        //           // if (sortResult.length == 0 && resultData.length != 0) {
        //           //   uploadAllFile();
        //           // }
        //         }}>
        //         <PlayIcon
        //           style={{
        //             color: COLORS.orangeBgIcon,
        //           }}
        //           size="8"
        //         />
        //       </TouchableOpacity>
        //     </View>
        //   ) : (
        //     <View
        //       style={{
        //         flexDirection: 'row',
        //         justifyContent: 'space-evenly',
        //         alignItems: 'center',
        //         paddingVertical: 7,
        //       }}>
        //       <Text>Loading ...</Text>
        //     </View>
        //   )}
        // </>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            paddingVertical: 7,
          }}>
          <Text>
            Tnos Anda Habis Segera Lakukan TopUp untuk melanjutkan konsultasi
          </Text>
        </View>
      )}
    </View>
  );
};

export default PreviewAllFile;

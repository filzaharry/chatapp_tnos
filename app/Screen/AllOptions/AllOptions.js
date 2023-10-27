import {Container} from 'native-base';
import React, {useEffect, useState} from 'react';
import {FlatList, StatusBar, StyleSheet, View} from 'react-native';
import {ListItem, Avatar} from 'react-native-elements';
import SearchBar from 'react-native-elements/dist/searchbar/SearchBar-ios';
import {COLORS} from '../../Component/Constant/Color';
import {FONTS} from '../../Component/Constant/Font';
import database from '@react-native-firebase/database';
import {useSelector} from 'react-redux';
import Navigation from '../../Service/Navigation';
import uuid from 'react-native-uuid';
import moment from 'moment';

const listData = [
  {
    name: 'Personal',
    img: '',
    about: 'Lakukan chat secara personal dengan mitra kami',
    category: 'personal',
  },
  {
    name: 'Corporate',
    img: '',
    about: 'Konsultasikan Perusahaan Anda dengan mitra kami',
    category: 'corporate',
  },
];

const AllOptions = () => {
  const {userData} = useSelector(state => state.User);

  const createChatList = data => {
    database()
      .ref('/chatlist/' + userData.id)
      .once('value')
      .then(snapshot => {
        // console.log('User data: ', snapshot.val());
        // console.log('Request data: ', data.category);

        // if (snapshot.val() != null) {
        //   if (snapshot.val().category == 'personal') {
        //     console.log('Anda Sudah Pernah Konsultasi Personal');
        //   } else if (snapshot.val().category == 'corporate'){
            
        //     console.log('Anda Sudah Pernah Konsultasi Corporate');
        //   } 
        // }


        let roomId = uuid.v4();
        let myData = {
          roomId,
          id: userData.id,
          userName: userData.name,
          lastMsg: '',
          category: data.category,
          isMitraReply: true,
          isMitraId: '',
          isMitraName: '',
          transactionId: '',
          status: 0, //chatlist is open
          orderBatch: 0
          // orderBatch: `LC-${moment().format('x')}-1`
        };

        database()
          .ref('/chatlist/' + userData.id + '/' + data.category)
          .update(myData)
          .then(() => console.log('Data updated.'));

        Navigation.navigate('SingleChatUser', {receiverData: data, roomId});
        // if (userData?.role == 'mitra') {
        //   Navigation.navigate('SingleChatMitra', {receiverData: data, roomId});
        // } else {
        // }
      });
  };

  const renderItem = ({item}) => (
    <ListItem
      onPress={() => createChatList(item)}
      bottomDivider
      containerStyle={{paddingVertical: 7, marginVertical: 2}}>
      <Avatar
        source={require('../../Assets/user-icon.png')}
        rounded
        size="small"
      />
      <ListItem.Content>
        <ListItem.Title style={{fontFamily: FONTS.Medium, fontSize: 14}}>
          {item.name}
        </ListItem.Title>
        <ListItem.Subtitle
          style={{fontFamily: FONTS.Regular, fontSize: 12}}
          numberOfLines={1}>
          {item.about}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View style={{backgroundColor: COLORS.white}}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      {/* <SearchBar
        placeholder="Search by name..."
        onChangeText={val => searchuser(val)}
        // onChangeText={val => setsearch(val)}
        value={search}
        containerStyle={styles.searchContainer}
        inputStyle={styles.searchInput}
      /> */}
      <FlatList
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        // data={allUser}
        data={listData}
        renderItem={renderItem}
      />
    </View>
  );
};

export default AllOptions;

const styles = StyleSheet.create({
  searchContainer: {
    elevation: 2,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
  },
  searchInput: {
    fontSize: 15,
    fontFamily: FONTS.Regular,
    color: COLORS.black,
    opacity: 0.7,
  },
});

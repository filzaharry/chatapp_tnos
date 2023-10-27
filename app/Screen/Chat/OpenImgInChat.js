import { View, Text, Image } from 'react-native'
import React from 'react'

const OpenImgInChat = props => {
    const {imgLink} = props.route.params;
  return (
    <View style={{backgroundColor:'black', alignItems:'center', alignContent:'center'}}>
      <Image
              source={{uri: imgLink}}
              style={{
                height: '100%',
                width: '100%',
                resizeMode: 'contain',
              }}
            />
    </View>
  )
}

export default OpenImgInChat
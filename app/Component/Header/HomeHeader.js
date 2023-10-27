import { CheckIcon, Icon } from 'native-base'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Avatar } from 'react-native-elements/dist/avatar/Avatar'
import { COLORS } from '../Constant/Color'
import { FONTS } from '../Constant/Font'
import { useSelector } from 'react-redux'

const HomeHeader = () => {
    const {userData} = useSelector(state => state.User)
    return (
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',
        padding:10,paddingHorizontal:15,backgroundColor:COLORS.white,elevation:2,paddingVertical:15}}>
            <Text style={styles.logo}>{userData.name + ' as ' + userData.role}</Text>
            <View style={{flexDirection:'row',alignItems:'center'}}>
                <CheckIcon size="5" mt="0.5" color="emerald.500" />
            </View>
        </View>
    )
}

export default HomeHeader;

const styles = StyleSheet.create({
    logo: {
        fontFamily: FONTS.Bold,
        color: COLORS.theme,
        fontSize: 22,
      },
})

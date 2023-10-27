import { Modal, Text, TouchableOpacity, View } from "react-native";
import React from "react";

export const MyModal = (props) => {

    return (
      <Modal visible={props.state}
            transparent={true}
            animationType='slide'
            >
          <View >
            <Text >¡IMPORTANTE!</Text>
            <Text>{props.message}</Text>
            <TouchableOpacity  onPress={() => props.restore()}>
              <Text >Aceptar</Text>
            </TouchableOpacity>
          </View>
      </Modal>
    )
}
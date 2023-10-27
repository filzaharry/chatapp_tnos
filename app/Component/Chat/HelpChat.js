import {View, Text} from 'react-native';
import React from 'react';
import {COLORS} from '../Constant/Color';
import {Icon} from 'react-native-elements';

export default function HelpChat() {
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 10,
        marginBottom: 2,
        borderRadius: 20,
      }}>
      <View
        style={{
          height: 40,
          width: 40,
          borderRadius: 40,
          backgroundColor: COLORS.iconAlert,
          borderColor: COLORS.borderAlert,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 5,
        }}>
        <Text style={{fontSize:20, fontWeight:'bold'}}>?</Text>
      </View>
      <Text
        style={{
          color: COLORS.black,
          marginLeft: 10,
        }}>
        Bertanyalah secara detail dan ringkas dan jumlah maksimal character chat
        adalah 1000 character, serta hlayanan konsultasi chat ini bukan untuk
        review document. Info : (Pop Up) Keterangan tentang jumlah Pemotongan
        yang akan dilakukan oleh sistem : 1 Pertanyaan Teks = 2 Bonn 1
        Pertanyaan Teks + 1 Lampiran File (JPG,JPEG,PNG)Maks 3Mbyte = 3 Bonn 1
        Pertanyaan Teks + 1 Lampiran File (PDF)Maks 1 MByte = 7 Bonn Point akan
        dipotong setelah Mitra memberikan Jawaban
      </Text>
    </View>
  );
}

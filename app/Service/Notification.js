const sendSingleDeviceNotification = data => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append(
      'Authorization',
      'key=AAAAP8Nq7S0:APA91bFvtZ-4izF_jAHDtYaw7GoMVS7CFf4LGo5KdNGdYxHeYrOGutMBUeMBeommNr-ASiyAo1rMrAtPWNI9hd0xMCHCllxMpW32yasu7HCD1VURSgPs_K9sX62-mbWuwZw1rGnYAOsm',
    );
  
    var raw = JSON.stringify({
      data: {},
      notification: {
        body: data.body,
        title: data.title,
      },
      to: data.token,
    });
  
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };
  
    fetch('https://fcm.googleapis.com/fcm/send', requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  };
  
  const sendMultiDeviceNotification = data => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append(
      'Authorization',
      'key=AAAAP8Nq7S0:APA91bFvtZ-4izF_jAHDtYaw7GoMVS7CFf4LGo5KdNGdYxHeYrOGutMBUeMBeommNr-ASiyAo1rMrAtPWNI9hd0xMCHCllxMpW32yasu7HCD1VURSgPs_K9sX62-mbWuwZw1rGnYAOsm',
    );
  
    var raw = JSON.stringify({
      data: {},
      notification: {
        body: data.body,
        title: data.title,
      },
      registration_ids: data.token,
    });
  
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };
  
    fetch('https://fcm.googleapis.com/fcm/send', requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  };
  
  export default {
    sendSingleDeviceNotification,
    sendMultiDeviceNotification,
  };
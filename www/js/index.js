/* global cordova, PushNotification */
const version = 'v0.4.0' // Also change in /package.json and /config.xml

const apiurl = 'https://fdapidbg.ilovefreegle.org/api/session'
// const mturl = 'https://modtools--golden-caramel-d2c3a7.netlify.app' // No / at end
const mturl = 'https://modtools.org' // No / at end
const mtwindowname = '_blank' // _self

window.isandroid = false
window.isiOS = false
window.mobilePushId = false
window.mobilePush = false
window.deviceid = 'not set'
const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

function connect () {
  try {
    window.localStorage.setItem('connected', 'false')
    document.getElementById('problem').innerHTML = ''
    const email = document.getElementById('email').value.trim()
    console.log('connect', email)
    if (!email.match(EMAIL_REGEX)) {
      document.getElementById('problem').innerHTML = 'Not an email address'
      return
    }
    if (!window.mobilePushId) {
      document.getElementById('problem').innerHTML = 'Push notifications not accepted'
      return
    }
    window.localStorage.setItem('connectedemail', email)
    console.log('connectedemail saved', email)
    document.getElementById('problem').innerHTML = 'Connecting'

    console.log('apiurl', apiurl)

    const params = {
      email,
      modtools: true,
      notifications: {
        push: {
          type: window.isiOS ? 'FCMIOS' : 'FCMAndroid',
          subscription: window.mobilePushId
        }
      }
    }
    function connected (json) {
      console.log('Completed', json)
      document.getElementById('problem').innerHTML = json.status
      if (json.status === 'Success') {
        window.localStorage.setItem('connected', 'true')
      }
    }
    fetch(apiurl, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'X-HTTP-Method-Override': 'PATCH'
      }
    })
      .then((response) => response.json())
      .then(connected)

    /* function httpGetAsync(theUrl, callback) {
      console.log('httpGetAsync', theUrl)
      let xmlHttpReq = new XMLHttpRequest();
      xmlHttpReq.onreadystatechange = function () {
        if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200) callback(xmlHttpReq.responseText);
      };
      xmlHttpReq.open("GET", theUrl, true); // true for asynchronous
      xmlHttpReq.send(null);
    }
    function done(res) {
      console.log('done', res)
    }
    httpGetAsync(url,done)
    */
  } catch (e) {
    document.getElementById('problem').innerHTML = e.message
  }
}

function mainOnAppStart () {
  console.log('ModTools ' + version + ' running in cordova ' + cordova.platformId + '@' + cordova.version)

  window.isiOS = (window.device.platform === 'iOS')
  window.isandroid = window.device.platform === 'Android'
  console.log('isandroid ' + window.isandroid)

  /* // Make window.open work in iOS app
  const prevwindowopener = window.open
  window.open = (url) => {
    console.log('App window.open', url)
    // eslint-disable-next-line no-undef
    cordova.InAppBrowser.open(url, '_system')
    //window.open(encodeURI('https://openclipart.org/'),"_system")
  } */

  function startMT () {
    console.log('startMT')
    const ref = cordova.InAppBrowser.open(mturl, mtwindowname, 'location=yes')
    console.log('Opened', ref)
  }

  document.getElementById('start').addEventListener('click', startMT)
  const dv = document.getElementById('version')
  if (dv) dv.innerHTML = version

  document.getElementById('connect').addEventListener('click', connect)

  const connectedemail = window.localStorage.getItem('connectedemail')
  console.log('connectedemail', connectedemail)
  if (connectedemail) {
    document.getElementById('email').value = connectedemail
  }
  const connected = window.localStorage.getItem('connected')
  if (connected && connected === 'true') {
    document.getElementById('problem').innerHTML = 'Already connected'
  }

  console.log('push init start')

  if ((typeof PushNotification === 'undefined') || (!PushNotification)) {
    console.log('no push notification service')
    // alert("No PN")
  } else if (!window.mobilePushId) {
    window.mobilePush = PushNotification.init({
      android: {
        senderID: '423761283916', // FCM: https://console.firebase.google.com/project/scenic-oxygen-849/settings/general/android:org.ilovefreegle.direct
        sound: true,
        iconColor: '#003366', // ModTools blue
        icon: 'icon'
        // forceShow: true,
      },
      ios: {
        alert: true,
        badge: true,
        sound: false
      }
    })
    window.mobilePush.on('registration', function (data) {
      window.mobilePushId = data.registrationId
      console.log('push registration ' + window.mobilePushId)
      // alert("registration: " + window.mobilePushId)

      // sendSubscription()
    })
    // Called to handle a push notification
    //
    // A push shows a notification immediately and sets desktop badge count (on iOS and some Android)
    // Note: badge count also set elsewhere when unseen chats counted (and may disagree!)
    //
    // On iOS this handler is called immediately if running in foreground;
    //  it is not called if app not started; the handler is called when app started.
    //  if in background then the handler is called once immediately, and again when app shown (to cause a double event)
    //
    // On Android this handler is called immediately if running in foreground;
    //  it is not called if not started; the handler is called twice when app started (double event)
    //  if in background then the handler is called once immediately, and again when app shown (to cause a double event)

    // const lastNotId = false

    window.mobilePush.on('notification', function (data) {
      // alert("push notification")
      console.log('push notification')
      console.log(data)

      /* if ('notId' in data.additionalData) {
        if (lastNotId === data.additionalData.notId) {
          console.log("Ignored double event")
          return // Ignore second of double event
        }
        lastNotId = data.additionalData.notId
      } */

      // const coldstart = data.additionalData.coldstart
      const foreground = data.additionalData.foreground
      // const contentAvailable = data.additionalData['content-available']
      const route = data.additionalData.route
      console.log('route', route)
      if (route && (route.length) > 0 && !foreground) {
        console.log('Opening', route)
        const ref = cordova.InAppBrowser.open(mturl + route, mtwindowname, 'location=yes')
        console.log('Opened', ref)
        // window.open('https://modtools.org'+route,"_system")
      }

      /* var count = 0
      if ('count' in data) count = parseInt(data.count) // data.count is string
      if (count !== 0) { // count==0 is admin startup
        //showUnseenMessageCount(count)
        setTimeout(background, 50)
      }

      if ('startup' in data.additionalData) {
        var now = new Date()
        var msg = "<p>&bull;" + now.toLocaleString() + "<br/><strong>&nbsp;" + data.title + "</strong><br/>&nbsp; " + data.message + "</p>"
        $('#topmsg div').append(msg)
        $('#topmsg').show()
      } */

      if (window.isiOS) {
        window.mobilePush.finish(function () {
          console.log('push finished OK')
          // alert("finished")
        }, function () {
          console.log('push finished error')
          // alert("finished")
        },
        data.additionalData.notId
        )
      }
    })

    window.mobilePush.on('error', function (e) {
      // alert("error: " + e.message)
      console.log('mobilePush error ' + e.message)
    })
  }

  if (connected && connected === 'true') {
    cordova.InAppBrowser.open(mturl, mtwindowname, 'location=yes')
  }
}

document.addEventListener('deviceready', mainOnAppStart, false)

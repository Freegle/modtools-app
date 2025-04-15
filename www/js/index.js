var version = 'v0.4.0' // Also change in /package.json and /config.xml

var inForeground = true
window.isandroid = false
window.isiOS = false
window.mobilePushId = false
window.mobilePush = false
window.deviceid = "not set"
var lastPushMsgid = false

function mainOnAppStart() {
  console.log('ModTools ' + version + " running in cordova " + cordova.platformId + '@' + cordova.version)

  window.isiOS = (window.device.platform === 'iOS')
  window.isandroid = window.device.platform === 'Android'
  console.log("isandroid " + window.isandroid)


  /*// Make window.open work in iOS app
  const prevwindowopener = window.open
  window.open = (url) => {
    console.log('App window.open', url)
    // eslint-disable-next-line no-undef
    cordova.InAppBrowser.open(url, '_system')
    //window.open(encodeURI('https://openclipart.org/'),"_system")
  }*/

  function startMT() {
    console.log('startMT')
    const ref = cordova.InAppBrowser.open('https://modtools.org/', '_blank', 'location=yes')
    console.log('Opened', ref)
  }

  document.getElementById("start").addEventListener("click", startMT)

  console.log("push init start")

  if ((typeof PushNotification === 'undefined') || (!PushNotification)) {
    console.log("no push notification service")
    //alert("No PN")
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
      console.log("push registration " + window.mobilePushId)
      //alert("registration: " + window.mobilePushId)

      //sendSubscription()

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

    var lastNotId = false

    window.mobilePush.on('notification', function (data) {
      //alert("push notification")
      console.log("push notification")
      console.log(data)

      /*if ('notId' in data.additionalData) {
        if (lastNotId === data.additionalData.notId) {
          console.log("Ignored double event")
          return // Ignore second of double event
        }
        lastNotId = data.additionalData.notId
      }*/

      const coldstart = data.additionalData.coldstart
      const foreground = data.additionalData.foreground
      const contentAvailable = data.additionalData['content-available']
      const route = data.additionalData.route
      console.log('route', route)
      if (route && (route.length) > 0 && !foreground) {
        console.log('Opening', route)
        const ref = cordova.InAppBrowser.open('https://modtools.org' + route, '_blank', 'location=yes')
        console.log('Opened', ref)
        //window.open('https://modtools.org'+route,"_system")
      }

      /*var count = 0
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
      }*/

      if (window.isiOS) {
        window.mobilePush.finish(function () {
          console.log("push finished OK")
          //alert("finished")
        }, function () {
          console.log("push finished error")
          //alert("finished")
        },
          data.additionalData.notId
        )
      }
    })

    window.mobilePush.on('error', function (e) {
      //alert("error: " + e.message)
      console.log("mobilePush error " + e.message)
    })
  }
}

  document.addEventListener('deviceready', mainOnAppStart, false)

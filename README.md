geoNFC
======

Windows Phone 8 App

GeoNFC is a Near Field Communication tag reader and writer app for you windows phone 8, aimed to create geo tags in standard format. It can parse ndef formatted messages to human readable form. What is the different to other nfc apps? It is specialized to geo topics. The developer has bothered it that there was no app to pick coordinates form a map and write it to tags. Previously, the user was requested to type the location manually. Typically coordinates are unknown. Now write your favorite locations easily on tags chosen from a map.

See the app [geoNFC](http://www.windowsphone.com/de-de/store/app/geonfc/8656f870-b76a-4b88-a8f3-ac46dc218e53) in Windows Phone store.

Supported Platforms
-------------------
* Windows Phone 8

## Contents

* [Installing](#installing)
* [Used technologies](#used-technologies)
  - [Phonegap NFC Plugin](#phonegap-NFC-Plugin)
  - [jQuery mobile Windows Phone Theme](#jQuery-mobile-Windows-Phone-Theme)
  - [Map](#map)
* [License](#license)
 
# Installing

This solution was created with Microsoft Visual Studio 2012 ultimate. 

# Used technologies

How does the app work? Also special on that app is it comes in unusually format. It is a native mobile web app using PhoneGap with external sensor plugin. 

## Phonegap NFC Plugin

NFC is normally not supported in PhoneGap. It exists a cross-platform plugin that supports Android, WP8 and BlackBerry7/10. 
- See the [plugin](https://github.com/chariotsolutions/phonegap-nfc) on GitHub

##jQuery mobile Windows Phone Theme

To make the application look like a native Windows Phone application, a special jQuery mobile theme was used. Watch this [jqmobile-metro-theme](http://sgrebnov.github.io/jqmobile-metro-theme/)

## Map

This app use the Mobile HTML5 Framework from [here](http://developer.here.com/mobile_html5) .When you use the map for your own project please register [HERE](http://api.developer.nokia.com/) and get your private authentication token and appid.

# License

![ScreenShot](http://p72b.bplaced.net/webpage/img/by-nc-sa.png)
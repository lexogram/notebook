"use strict"

;(function background(){

  function useExtension() {
 
    var URL = chrome.extension.getURL("html/popup.html")
    var width = 300
    var top = 0

    var options = {
      url: URL
    , left: screen.availWidth - width
    , top: top
    , width: width
    , height: screen.availHeight - top
    , focused: false
    , type: "popup"
    }

    chrome.windows.create(options, callback)

    function callback(window_data) {
      // TODO
    }
  }

  chrome.browserAction.onClicked.addListener(useExtension)
})()
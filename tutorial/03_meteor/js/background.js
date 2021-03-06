"use strict"

;(function background(){

  var windowOpen = false

  function useExtension() {
    if (windowOpen) {
      return
    }
    
    var URL = "http://localhost:3000/"
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
      windowOpen = true
    }
  }

  chrome.browserAction.onClicked.addListener(useExtension)
})()

"use strict"

;(function noteBookSettings(){
  chrome.browserAction.onClicked.addListener(activateExtension)
  chrome.runtime.onMessage.addListener(incomingMessage)

  var placing

  function incomingMessage(request, sender, callback) {
    var tab = sender.tab // undefined if message is from extension
    var url = tab ? tab.url : ""
    var response = {}

    switch (request.method) {
      case "saveEdge":
        response = saveEdge(request.edge)
      break
    }

    if (callback) {
      callback(response)
    }
  }

  var id // set in initializeNoteBook()
  var query = {
    active: true
  , windowId: chrome.windows.WINDOW_ID_CURRENT
  }
  var URL = "html/lx-content.html" // <HARD-CODED>

  function activateExtension() {
    chrome.tabs.query(query, initializeNoteBook)
  }
    
  function initializeNoteBook(tabs) {
    id = tabs[0].id
    
    var message = { method: "getNoteBookStatus" }
    var html

    function callback(response) {
      if (!response.open) {
        getPlacing()
        getHTML() // will call openNoteBook() on callback
      }
    }

    chrome.tabs.sendMessage(id, message, callback)

    function getPlacing() {
      var defaults = {
        edge: "bottom"
      , edgeSizes: {
          horizontal: "300px"
        , vertical: "200px"
        }
      }

      try {
        placing = localStorage.getItem("placing")
        placing = JSON.parse(placing)
      } catch(error) {}

      if (!placing) {       
        placing = defaults
      } else {
        for (var key in defaults) {
          if (!placing[key]) {
            placing[key] = defaults[key]
          }
        }
      }
    }

    function getHTML() {
      var xhr = new XMLHttpRequest()
      xhr.open("GET", chrome.extension.getURL(URL), true)
      xhr.onreadystatechange = stateChanged
      xhr.send()

      function stateChanged() {
        if (xhr.readyState === 4) {
          html = xhr.responseText
          openNoteBook()
        }
      }
    }

    function openNoteBook() {
      var message = { 
        method: "openNoteBook"
      , placing: placing
      , html: html }

      function callback(response) {
        console.log(response)
      }

      chrome.tabs.sendMessage(id, message, callback)
    }
  }

  function saveEdge(edge) {
    // Trust edge to be top|right|bottom|left
    placing.edge = edge
    localStorage.setItem("placing", JSON.stringify(placing))

    return placing
  }

  function speak(phrase) {
    console.log(phrase, (+ new Date()) % 10000)
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(phrase))
  }
})()
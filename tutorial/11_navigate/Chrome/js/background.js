"use strict"

;(function background(){

  var bg = new Background()

  function Background() {
    this.port = null
    this.meteorURL = "http://localhost:3000/"
    this.htmlToInject = chrome.extension.getURL("html/inject.html")
    this.injectedCSSFile = "css/inject.css"
    this.extensionTabMap = {}
  }

  ;(function addBackgroundMethods(){

    // INCOMING MESSAGES // INCOMING MESSAGES // INCOMING MESSAGES //

    Background.prototype.useExtension = function useExtension() {
      this.ensureNoteBookWindowIsOpen()

      chrome.tabs.query(
        { active: true
        , currentWindow: true
        }
      , function (tabs) {
          bg.showToolbarIfRequired.call(bg, tabs)
        }
      )
    }

    Background.prototype.openConnection = function openConnection(externalPort) {
      this.port = externalPort
      this.port.onMessage.addListener(treatMessage)
    }

    // user actions // user actions // user actions // user actions //

    Background.prototype.changeSelection = function changeSelection(request) {
      if (!this.port) {
        console.log("NoteBook inactive. Request not treated:", request)
        return
      }

      this.port.postMessage(request)
    }

    Background.prototype.getExtensionStatus = function getExtensionStatus(request, sender, sendResponse) {
      var id = sender.tab.id
      var extensionIsActive = this.extensionTabMap[id] // true | !true

      if (!extensionIsActive) {
        extensionIsActive = this.checkUrlForMatch(sender.url)
        // true | false
      }

      if (extensionIsActive) {
        this.ensureNoteBookWindowIsOpen()
        this.insertCSS(id)
        this.insertToolbar(id)
        this.extensionTabMap[id] = true
        // if added by checkUrlForMatch()
      } else {
        // ensure that extensionTabMap[id] is undefined for when 
        // showToolbarIfRequired() is called next     
        delete this.extensionTabMap[id]
      }

      sendResponse({ extensionIsActive: extensionIsActive })
    }

    Background.prototype.forgetExtension =
      function forgetExtension(request, sender) {
      this.extensionTabMap[sender.tab.id] = false
    }

    Background.prototype.disableExtension = function disableExtension() {
      this.port = null
      chrome.tabs.query({}, callAllTabs)

      function callAllTabs(tabs) {
        var message = { method: "removeToolbar" }
        var total = tabs.length
        var ii
        
        for (ii = 0; ii < total; ii += 1) {
          chrome.tabs.sendMessage(tabs[ii].id, message)
        }
      }
    }

    // INSTALLATION // INSTALLATION // INSTALLATION // INSTALLATION //

    Background.prototype.ensureNoteBookWindowIsOpen = 
      function ensureNoteBookWindowIsOpen() {
      if (this.port) {
        return
      }

      var width = 300
      var top = 0

      var options = {
        url: this.meteorURL
      , left: screen.availWidth - width - 8
      , top: top
      , width: width
      , height: screen.availHeight - top
      , focused: false
      , type: "popup"
      }

      chrome.windows.create(options)
    }

    Background.prototype.showToolbarIfRequired = 
      function showToolbarIfRequired(tabs) {
      var id = tabs[0].id
      var extensionIsActive = this.extensionTabMap[id] // true|false|

      switch (extensionIsActive) {
        default: // undefined
          this.insertCSS(id)
          // fall throught to injectToolbar()
        case false:
          this.insertToolbar(id)
          this.extensionTabMap[id] = true
          // no need to break: nothing else happens
        case true:
          // do nothing: the Toolbar is already active
      }
    }

    Background.prototype.insertCSS = function insertCSS(id) {  
      var cssDetails = {
        file: this.injectedCSSFile
      , runAt: "document_start"
      }
      chrome.tabs.insertCSS(id, cssDetails)
    }

    Background.prototype.insertToolbar = function insertToolbar(id) {
      var message = { 
        method: "insertToolbar"
      , html: this.htmlToInject
      }

      chrome.tabs.sendMessage(id, message)
    }

    // PLACEHOLDER // PLACEHOLDER // PLACEHOLDER // PLACEHOLDER //

    Background.prototype.checkUrlForMatch =
      function checkUrlForMatch(url) {
      var regex = /http:\/\/lexogram\.github\.io\/openbook\//
      return !!regex.exec(url)
    }
  })()

  // AJAX // AJAX // AJAX // AJAX // AJAX // AJAX // AJAX // AJAX //

  ;(function getHTMLToInject() {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", bg.htmlToInject, true)
    xhr.onreadystatechange = stateChanged
    xhr.send()

    function stateChanged() {
      if (xhr.readyState === 4) {
        bg.htmlToInject = xhr.responseText
      }
    }
  })()

  // LISTENERS // LISTENERS // LISTENERS // LISTENERS // LISTENERS // 

  function openConnection(externalPort) {
    bg.openConnection.call(bg, externalPort)
  }

  function useExtension() {
    bg.useExtension.call(bg)
  }

  function treatMessage(request, sender, sendResponse) {
    var method = bg[request.method]
    if (typeof method === "function") {
      method.call(bg, request, sender, sendResponse)
    }
  }
  
  chrome.runtime.onConnectExternal.addListener(openConnection)
  chrome.browserAction.onClicked.addListener(useExtension)
  chrome.runtime.onMessage.addListener(treatMessage)
})()
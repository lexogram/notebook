"use strict"

;(function content(){

  var selectedText = ""
  var extensionIsActive = false

  document.body.addEventListener("mouseup", checkSelection, false)
  document.body.addEventListener("keyup", checkSelection, false)

  function checkSelection(event) {
    if (!extensionIsActive) {
      return
    }

    var selection = document.getSelection()
    var text = selection.toString()

    if (selectedText !== text) {
      selectedText = text

      chrome.runtime.sendMessage({
        method: "changeSelection"
      , data: selectedText
      })
    }
  }

  function treatMessage(request, sender, sendResponse) {
    switch (request.method) {
      case "extensionStatus":
        extensionStatus(request, sendResponse)
      break
      case "insertToolbar":
        insertToolbar(request)
      break
    }   
  }

  function extensionStatus(request, sendResponse) {
    console.log("extensionStatus called. extensionIsActive:", extensionIsActive)
    sendResponse({ extensionIsActive: extensionIsActive })
  }

  function insertToolbar(request) {
    // request = {
    //   method: "insertToolbar"
    // , html: <html string>
    // }
      
    var body = document.body
    var injectedDOM = parseAsElements(request.html)
    appendSectionToBody(injectedDOM)
    body.classList.add("lxo-annotations")
    extensionIsActive = true

    return "toolbar inserted"

    function parseAsElements(htmlString) {
      var parser = new DOMParser()
      var tempDoc = parser.parseFromString(htmlString, "text/html")
      return tempDoc.body.childNodes
    }

    function appendSectionToBody(children) {
      var total = children.length
      
      for (var ii = 0; ii < total; ii += 1) {
        body.appendChild(children[0])
      }
    }
  }

  chrome.extension.onMessage.addListener(treatMessage)
})()
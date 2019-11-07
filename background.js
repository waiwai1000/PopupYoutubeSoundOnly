let gscreen = window.screen;
let defaultPreference = {
  defaultPosition: 0,
  contextMenu: true,
  overlayIcon: true,
  resizable: true,
  alwaysTop: true,
  multiWindow: true,
  iconPosition: 2,
  privateBrowsing: false,
  windowWidth: 560,
  windowHeight: 320,
  screenWidth: gscreen.width || 1024,
  screenHeight: gscreen.height || 768,
  screenLeft: gscreen.left || 0,
  screenTop: gscreen.top || 0,
  version: 4
};

const oldVersionSizeMapping = [
  {width: 425, height:344},
  {width: 480, height:385},
  {width: 640, height:505},
  {width: 960, height:745},
  {width: 280, height:160},
  {width: 560, height:320},
  {width: 640, height:360},
  {width: 853, height:480},
  {width: 1280, height:745}
];

let preferences = {};
let menuId = null;

const storageChangeHandler = (changes, area) => {
  if(area === 'local') {
    let changedItems = Object.keys(changes);
    for (let item of changedItems) {
      preferences[item] = changes[item].newValue;
      switch (item) {
        case 'contextMenu':
          resetContextMenu();
          break;
      }
    }
  }
};

const loadPreference = () => {
  browser.storage.local.get().then(results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0];
    }
    if (!results.version) {
      preferences = defaultPreference;
      browser.storage.local.set(defaultPreference).then(res => {
        browser.storage.onChanged.addListener(storageChangeHandler);
      }, err => {
      });
    } else {
      preferences = results;
      browser.storage.onChanged.addListener(storageChangeHandler);
    }
    if (preferences.version !== defaultPreference.version) {
      let update = {};
      let needUpdate = false;
      for(let p in defaultPreference) {
        if(preferences[p] === undefined) {
          update[p] = defaultPreference[p];
          needUpdate = true;
        }
      }
      if(preferences.version<=2) {
        update.windowWidth = oldVersionSizeMapping[preferences.defaultSize].width;
        update.windowHeight = oldVersionSizeMapping[preferences.defaultSize].height;
      }

      if(needUpdate) {
        update.version = defaultPreference.version;
        browser.storage.local.set(update).then(null, err => {});
      }
    }
    resetContextMenu();
  });
};

const createContextMenu = () => {
  
  if (menuId !== null) {
    return;
  }

  menuId = browser.contextMenus.create({
    type: 'normal',
    title: browser.i18n.getMessage('contextMenuItemTitle'),
    // contexts: ['link','video'],
    targetUrlPatterns: [
      '*://*.youtube.com/watch*',
      '*://*.twitch.tv/*',
      '*://*.vimeo.com/*',
      '*://*.dailymotion.com/video/*',
      '*://*/*.mp4',
      '*://*/*.webm',
      '*://*/*.h264'],
    onclick: (data) => {
      //console.log(data);
      let url = '';
      if (data.mediaType === 'video' && data.srcUrl) {
        if(data.frameUrl)
          url = data.frameUrl;
        else
          url = data.srcUrl;
      }
      else if(data.linkUrl) {
        url = data.linkUrl;
      }
      launchVideo(url, preferences);
    }
  });
};

const resetContextMenu = () => {
  let createNew = false;
  if (preferences.contextMenu) {
    createContextMenu();
  } else {
    browser.contextMenus.removeAll(() => {
      menuId = null;
    });
  }
};

window.addEventListener('DOMContentLoaded', event => {
  loadPreference();
});

const messageHandler = (message, sender, sendResponse) => {
  if(message.action === 'launchVideo') {
    let screen = {
      width: preferences.screenWidth,
      height: preferences.screenHeight,
      left: preferences.screenLeft,
      top: preferences.screenTop
    };
    launchVideo(message.url, preferences, screen);
  } else if (message.action === 'getScreenInfo') {
    let screen = window.screen;
    if (screen.width && screen.height) {
      sendResponse({
        width: screen.width,
        height: screen.height,
        top: screen.top,
        left: screen.left,
      });
    } else {
      sendResponse(null);
    }
    return true;
  }
};

browser.runtime.onMessage.addListener(messageHandler);
browser.runtime.onMessageExternal.addListener(messageHandler);

/*
  APIs for other addon, for example:

  Foxy Gestures: https://addons.mozilla.org/zh-TW/firefox/addon/foxy-gestures/
  ```
  browser.runtime.sendMessage('PopupVideoWebExt@ettoolong',
  {
    action: 'launchVideo',
    url: data.element.linkHref
  }).then();
  ```
*/

const tabIds = new Set();

function removeURLParameters(url, parameters) {
    parameters.forEach(function(parameter) {
  
        var urlparts = url.split('?');

        if (urlparts.length >= 2) {
            var prefix = encodeURIComponent(parameter) + '=';
            var pars = urlparts[1].split(/[&;]/g);

            for (var i = pars.length; i-- > 0;) {
                if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                    pars.splice(i, 1);
                }
            }

            url = urlparts[0] + '?' + pars.join('&');
        }
    });
   
    return url;
}

function reloadTab() {
	for (const tabId of tabIds) {
		chrome.tabs.get(tabId, function(tab) {
			if (tab.active) {
				chrome.tabs.reload(tabId);
				return;
			}
		});
	}
}

function processRequest(details) {


  if(getaudio == true)
  {

  
  
    if (!tabIds.has(details.tabId)) {
      return;
    }
  
  
  
      if (details.url.indexOf('mime=audio') !== -1 && !details.url.includes('live=1')) {

       
  
          var parametersToBeRemoved = ['range', 'rn', 'rbuf'];
          var audioURL = removeURLParameters(details.url, parametersToBeRemoved);
          chrome.tabs.sendMessage(details.tabId, {url: audioURL});

         getaudio = false;
      }
     
    }
	if(windowID!=null)
    {
      if(details.incognito===true)
      {
      if (!tabIds.has(details.tabId)) {
        return;
      }
    
        if (details.url.indexOf('mime=audio') !== -1 && !details.url.includes('live=1')) {
   
            var parametersToBeRemoved = ['range', 'rn', 'rbuf'];
            var audioURL = removeURLParameters(details.url, parametersToBeRemoved);
            chrome.tabs.sendMessage(details.tabId, {url: audioURL});
            getaudio = false;          
        }
      }
    

    }

  }

chrome.webRequest.onBeforeRequest.addListener(
  


  processRequest,
  {urls: ["<all_urls>"]},
  ["blocking"]
);


chrome.runtime.onMessage.addListener(function(message, sender) {
	tabIds.add(sender.tab.id);
});

chrome.tabs.onRemoved.addListener(function(tabId) {
	tabIds.delete(tabId);
});


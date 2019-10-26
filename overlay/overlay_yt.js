function checkForEmbeds() {
 

  if(removeIcons)
    return;
  if (!(host.indexOf('youtube.com') > -1)) return;

  // video
  let ytHomeContainers = Array.from(document.querySelectorAll('ytd-thumbnail'));
  if (ytHomeContainers.length) {
    ytHomeContainers.forEach(ytHomePageHandler);
  }

  // YouTube Watch Page
  let ytWatchContainer = document.querySelector('.html5-video-player');
  if (ytWatchContainer) {
    ytWatchElementHandler(ytWatchContainer);
  }

  // YouTube Playlist
  let ytPlaylistContainers = Array.from(document.querySelectorAll('ytd-playlist-thumbnail'));
  if (ytPlaylistContainers.length) {
    ytPlaylistContainers.forEach(ytPlaylistHandler);
  }
}

function ytHomePageHandler(el) {
 
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  let urlEl = el.querySelector('a.ytd-thumbnail');
  if (!urlEl || !urlEl.getAttribute('href')) return;

  let url = urlEl.getAttribute('href');

  if (!url.startsWith('/watch')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    let urlEl2 = el.querySelector('a.ytd-thumbnail');
    let url2 = urlEl.getAttribute('href');
    sendMessageToAddon({
      action: 'launchVideo',
      url: 'https://youtube.com' + url2,
      domain: 'youtube.com'
    });
  });
  el.appendChild(tmp);
}

function ytPlaylistHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  let urlEl = el.querySelector('a.ytd-playlist-thumbnail');
  if (!urlEl || !urlEl.getAttribute('href')) return;

  let url = urlEl.getAttribute('href');

  if (!url.startsWith('/watch')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    sendMessageToAddon({
      action: 'launchVideo',
      url: 'https://youtube.com' + url,
      domain: 'youtube.com'
    });
  });
  el.appendChild(tmp);
}

function ytWatchElementHandler(el) {
  if (!window.location.pathname.startsWith('/watch')) return;

  if (el.classList.contains('popupvideo__overlay__wrapper')) return;
  el.classList.add('popupvideo__overlay__wrapper');
  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    let videoEl = document.querySelector('video');
    videoEl.pause();
    closeFullscreen();
    sendMessageToAddon({
      action: 'launchVideo',
      url: window.location.href,
      domain: 'youtube.com',
      time: videoEl.currentTime,
      volume: videoEl.volume,
      muted: videoEl.muted
    });
  });
  el.appendChild(tmp);
}

chrome.runtime.sendMessage('enable-youtube-audio');

var makeSetAudioURL = function(videoElement, url) {
   
    if (videoElement.src != url) {
		var paused = videoElement.paused;
        videoElement.src = url;
		if (paused === false) {
			videoElement.play();
		}
    }
};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        let url = request.url;
        
        let videoElement = document.getElementsByTagName('video')[0];
      
		videoElement.onloadeddata = makeSetAudioURL(videoElement, url);


        // let audioOnlyDivs = document.getElementsByClassName('audio_only_div');
        // Append alert text
        // if (audioOnlyDivs.length == 0 && url.includes('mime=audio')) {
        //     // let extensionAlert = document.createElement('div');
        //     // extensionAlert.className = 'audio_only_div';

        //     // let alertText = document.createElement('p');
        //     // alertText.className = 'alert_text';
        //     // alertText.innerHTML = 'Sound only.';

        //     // extensionAlert.appendChild(alertText);
        //     // let parent = videoElement.parentNode.parentNode;

        //     // Append alert only if options specify to do so
        //     // chrome.storage.local.get('disable_video_text', function(values) {
        //     //   var disableVideoText = (values.disable_video_text ? true : false);
        //     //   if (!disableVideoText && parent.getElementsByClassName("audio_only_div").length == 0)
        //     //     parent.appendChild(extensionAlert);
        //     // });
        // }
        // else if (url == "") {
        //     // for(div in audioOnlyDivs) {
        //     //     div.parentNode.removeChild(div);
        //     // }
        // }
    }
);


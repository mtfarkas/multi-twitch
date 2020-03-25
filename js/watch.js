(function() {
  const playerOptsBase = {
    width: 400,
    height: 400,
    autoplay: false,
    time: '0h0m0s',
  };

  let videoIds;
  let controlButtons;
  let videoContainer;
  const players = [];
  let readyCount = 0;
  const timeRegex = new RegExp(`^\\d{2}:\\d{2}:\\d{2}$`, 'i');

  function setPlayState(playing) {
    if (!players || players.length === 0) {
      return;
    }

    players.forEach(p => {
      if (playing) {
        p.p.play();
      } else {
        p.p.pause();
      }
    });
  }

  function seekTo(time, opts) {
    if (!!opts && (!!opts.containerId || !!opts.videoId)) {
      let player;

      if (!!opts.containerId) {
        player = players.find(p => p.container === opts.containerId);
      } else {
        player = players.find(p => p.videoId === opts.videoId);
      }

      player.p.seek(time);
    } else {
      players.forEach(p => p.p.seek(time));
    }
  }

  function setMuteState(muted) {
    if (!players || players.length === 0) {
      return;
    }

    players.forEach(p => p.p.setMuted(muted));
  }

  function initializePlayers() {
    const params = new URLSearchParams(window.location.search);
    const videoIdsStr = params.get('v');

    if (!videoIdsStr) {
      window.location.href = '';
      return;
    }

    videoIds = videoIdsStr.split(',');

    if (videoIds.length < 2 || videoIds.length > 4) {
      window.location.href = '';
      return;
    }

    videoIds.forEach(id => {
      const containerId = `video-${id}-${randomId(16)}`;
      const newDiv = document.createElement('div');
      newDiv.id = containerId;
      newDiv.setAttribute('data-video', id);
      newDiv.classList.add('mtwitch-player-container');

      const optionsDiv = document.createElement('div');
      optionsDiv.classList.add('mtwitch-player-options-container');
      optionsDiv.classList.add('hidden');
      optionsDiv.setAttribute('data-video', id);
      optionsDiv.setAttribute('data-container', containerId);

      const optionsInput = document.createElement('input');
      optionsInput.setAttribute('type', 'text');
      optionsInput.id = `start-from-${containerId}`;
      optionsInput.classList.add('mtwitch-player-options-input');
      optionsInput.setAttribute('data-video', id);
      optionsInput.setAttribute('data-container', containerId);
      optionsInput.value = '00:00:00';

      const optionsLabel = document.createElement('label');
      optionsLabel.innerText = 'Start at (hh:mm:ss):';
      optionsLabel.classList.add('mtwitch-player-options-label');
      optionsLabel.setAttribute('for', `start-from-${containerId}`);
      optionsInput.setAttribute('data-video', id);
      optionsInput.setAttribute('data-container', containerId);

      const optionsButton = document.createElement('button');
      optionsButton.classList.add('mtwitch-player-options-button');
      optionsButton.innerText = 'Go';
      optionsButton.setAttribute('data-video', id);
      optionsButton.setAttribute('data-container', containerId);

      optionsDiv.append(optionsLabel);
      optionsDiv.append(optionsInput);
      optionsDiv.append(optionsButton);

      newDiv.append(optionsDiv);

      videoContainer.appendChild(newDiv);

      players.push({
        videoId: id,
        container: containerId,
        p: new Twitch.Player(containerId, {
          ...playerOptsBase,
          video: id,
        }),
      });
    });

    players.forEach(p =>
      p.p.addEventListener(Twitch.Player.READY, () => {
        readyCount++;

        if (readyCount === players.length) {
          controlButtons.forEach(cb => {
            cb.disabled = false;
          });

          setTimeout(() => {
            setPlayerSizes();
          }, 300);
        }
      })
    );
  }

  function setPlayerSizes() {
    const playerCount = players.length;

    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight - 55;
    const landscape = viewWidth - 100 > viewHeight;

    let playerWidth = 0;
    let playerHeight = 0;

    if (landscape) {
      if (playerCount === 2) {
        playerWidth = Math.floor(viewWidth / 2);
        playerHeight = Math.floor(viewHeight);
      } else if (playerCount > 2 && playerCount <= 4) {
        playerWidth = Math.floor(viewWidth / 2);
        playerHeight = Math.floor(viewHeight / 2) - 2;
      }
    } else {
      if (playerCount === 2) {
        playerWidth = Math.floor(viewWidth);
        playerHeight = Math.floor(viewHeight / 2);
      } else if (playerCount > 2 && playerCount <= 4) {
        playerWidth = Math.floor(viewWidth / 2);
        playerHeight = Math.floor(viewHeight / 2) - 2;
      }
    }

    players.forEach(p => {
      const iframe = document.querySelector(`#${p.container} > iframe`);
      iframe.setAttribute('width', playerWidth);
      iframe.setAttribute('height', playerHeight);
    });
  }

  function showPopupMenu(el) {
    const popup = el.target.querySelector('.mtwitch-player-options-container');

    popup.classList.remove('hidden');
  }

  function hidePopupMenu(el) {
    const popup = el.target.querySelector('.mtwitch-player-options-container');

    popup.classList.add('hidden');
  }

  function onVideoOptionsChange(e) {
    e.stopImmediatePropagation();

    const containerId = e.target.getAttribute('data-container');
    const optionsInput = document.getElementById(containerId).getElementsByTagName('input')[0];
    const value = optionsInput.value;
    let valid = true;

    if (!value || !timeRegex.test(value)) {
      valid = false;
    }

    let parts = [];
    if (valid) {
      parts = value.split(':').map(val => +val);
    }

    if (parts.length !== 3 || parts.some(val => val >= 60)) {
      valid = false;
    }

    if (!valid) {
      optionsInput.value = '00:00:00';

      seekTo(0, { containerId });
    } else {
      let seekTime = parts[0] * 3600 + parts[1] * 60 + parts[2];

      seekTo(seekTime, { containerId });
    }
  }

  docReady(() => {
    controlButtons = document.querySelectorAll('.control-button');
    controlButtons.forEach(cb => {
      cb.disabled = true;
    });

    videoContainer = document.getElementById('videos-container');

    document.getElementById('play-btn').addEventListener('click', () => setPlayState(true));
    document.getElementById('pause-btn').addEventListener('click', () => setPlayState(false));

    initializePlayers();

    document
      .querySelectorAll('.mtwitch-player-container')
      .forEach(el => el.addEventListener('mouseenter', showPopupMenu));
    document
      .querySelectorAll('.mtwitch-player-container')
      .forEach(el => el.addEventListener('mouseleave', hidePopupMenu));

    document
      .querySelectorAll('.mtwitch-player-options-button')
      .forEach(el => el.addEventListener('click', onVideoOptionsChange));

    window.addEventListener('resize', setPlayerSizes);
  });
})();

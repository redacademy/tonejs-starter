(function() {
  'use strict';

  // boolean
  let playing = false;

  // CSS accent-color variable
  const accentColor = getComputedStyle(document.body).getPropertyValue(
    '--accent-color'
  );

  // CSS default-color variable
  const defaultColor = getComputedStyle(document.body).getPropertyValue(
    '--default-color'
  );

  // dom elements to animate
  const kickBox = document.querySelector('.kickbox');
  const snareBox = document.querySelector('.snarebox');
  const highHatBox = document.querySelector('.highhatbox');
  const bassBox = document.querySelector('.bassbox');
  const pizzBox = document.querySelector('.pizzbox');

  const $playBtn = document.getElementById('play-btn');
  const $bpmRange = document.getElementById('bpm-range');
  const $swingRange = document.getElementById('swing-range');
  const $filterRange = document.getElementById('filter-range');

  let bpm = $bpmRange.value;
  let swing = $swingRange.value;
  let filter = $filterRange.value;

  /*
   * Effects
   * Connect change instrument .toMaster() to .connect(effectname);
   */
  const autoWah = new Tone.AutoWah({
    baseFrequency: 90,
    octaves: 8,
    sensitivity: 0.1,
    Q: 6,
    gain: 3,
    follower: {
      attack: 0.1,
      release: 0.2
    },
    wet: 0.3
  }).toMaster();
  autoWah.Q.value = 3;

  const phaser = new Tone.Phaser({
    frequency: 0.1,
    octaves: 6,
    stages: 10,
    Q: 3,
    baseFrequency: 350,
    wet: 0.3
  }).toMaster();

  const chorus = new Tone.Chorus({
    frequency: 1.5,
    delayTime: 3.5,
    depth: 0.7,
    type: 'sine',
    spread: 180,
    wet: 0.3
  });

  /*
   * Delay
   */
  const pingPong = new Tone.PingPongDelay({
    delayTime: '12n',
    maxDelayTime: 1,
    wet: 0.1
  }).toMaster();

  /*
   * Master FX
   */
  //some overall compression to keep the levels in check
  const masterCompressor = new Tone.Compressor({
    threshold: -20,
    ratio: 12,
    attack: 0,
    release: 0.3
  });

  //give a little boost to the lows
  const lowBump = new Tone.Filter({
    type: 'lowshelf',
    frequency: 90,
    Q: 1,
    gain: 20
  });

  // Bass notes array
  const bassNotes = [
    ['F#3', 'F#3'],
    null,
    ['F#3', 'F#3'],
    null,
    ['F#3', 'F#3'],
    null,
    null,
    null,
    ['F#3', 'F#3'],
    null,
    null,
    null,
    ['F#3', 'F#3'],
    null,
    null,
    null,
    ['E3', 'E3'],
    null,
    ['E3', 'E3'],
    null,
    ['E3', 'E3'],
    null,
    null,
    null,
    ['E3', 'E3'],
    null,
    null,
    null,
    ['E3', 'E3'],
    null,
    null,
    null,
    ['F#3', 'F#3'],
    null,
    ['F#3', 'F#3'],
    null,
    ['F#3', 'F#3'],
    null,
    null,
    null,
    ['F#3', 'F#3'],
    null,
    null,
    null,
    ['F#3', 'F#3'],
    null,
    null,
    null,
    ['G3', 'G3'],
    null,
    ['G3', 'G3'],
    null,
    ['G3', 'G3'],
    null,
    null,
    null,
    ['G3', 'G3'],
    null,
    null,
    null,
    ['G3', 'G3'],
    null,
    null,
    null
  ];

  // Pizzicato notes array
  const pizzNotes = [
    'C#4',
    ['D4', 'C#4'],
    ['C#4', 'D4'],
    ['C#4', 'C#4'],
    ['D4', 'C#4'],
    ['C#4', 'C#4'],
    ['B#3', 'C#4'],
    ['C#4', 'C#4'],
    'C#4',
    ['D4', 'C#4'],
    ['C#4', 'D4'],
    ['C#4', 'C#4'],
    ['D4', 'C#4'],
    ['C#4', 'C#4'],
    ['B#3', 'C#4'],
    ['C#4', 'C#4'],
    'B3',
    ['B#3', 'B3'],
    ['B3', 'B#3'],
    ['B3', 'B3'],
    ['B#3', 'B3'],
    ['B3', 'B3'],
    ['A#3', 'B3'],
    ['B3', 'B3'],
    'B3',
    ['B#3', 'B3'],
    ['B3', 'B#3'],
    ['B3', 'B3'],
    ['B#3', 'B3'],
    ['B3', 'B3'],
    ['A#3', 'B3'],
    ['B3', 'B3']
  ];

  // Hi-hat notes array
  const highHatNotes = [
    ['G3', null],
    ['G3', null],
    [null, 'G3'],
    [null, ['A3', null]],
    ['G3', null],
    ['G3', 'G3'],
    ['G3', 'G3'],
    ['G3', 'G3'],
    ['G3', null],
    ['G3', null],
    [null, 'G3'],
    [null, ['A3', null]],
    ['G3', null],
    ['G3', 'G3'],
    ['G3', 'G3'],
    ['G3', 'G3']
  ];

  // Kick notes array
  const kickNotes = ['C3', null, null, null, ['C3', 'C3'], null, null, null];

  /*
   * Bass
   */
  const bassSynth = new Tone.MonoSynth({
    volume: -5,
    oscillator: {
      type: 'fmsquare5',
      modulationType: 'triangle',
      modulationIndex: 2,
      harmonicity: 0.501
    },
    filter: {
      Q: 1,
      type: 'lowpass',
      rolloff: -24
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.4,
      release: 2
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 1.5,
      baseFrequency: 50,
      octaves: 4.4
    }
  }).chain(autoWah);

  /*
   * Drums
   */
  const drums505 = new Tone.Sampler(
    {
      D4: 'snare.[mp3|ogg]',
      C3: 'kick.[mp3|ogg]',
      G3: 'hh.[mp3|ogg]',
      A3: 'hho.[mp3|ogg]'
    },
    {
      volume: 11,
      release: 1,
      baseUrl: './audio/505/'
    }
  ).chain(autoWah, phaser);

  /*
   * Pizz
   */
  const pizzSynth = new Tone.MonoSynth({
    volume: -5,
    oscillator: {
      type: 'sawtooth4'
    },
    filter: {
      Q: 3,
      type: 'highpass',
      rolloff: -12
    },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.3,
      release: 0.9
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
      baseFrequency: 800,
      octaves: -1.2
    }
  }).chain(pingPong, chorus);

  /*
   * Sequence Parts
   */
  const pizzPart = new Tone.Sequence(
    function(time, note) {
      changeColor(pizzBox);
      pizzSynth.triggerAttackRelease(note, '10hz', time);
    },
    pizzNotes,
    '16n'
  );

  // Bass Sequence
  const bassPart = new Tone.Sequence(
    function(time, note) {
      changeColor(bassBox);
      bassSynth.triggerAttackRelease(note, '10hz', time);
    },
    bassNotes,
    '16n'
  );

  // High-hat Sequence
  const highHatPart = new Tone.Sequence(
    function(time, note) {
      changeColor(highHatBox);
      drums505.triggerAttackRelease(note, '4n', time);
    },
    highHatNotes,
    '16n'
  );

  // Snare Sequence
  const snarePart = new Tone.Sequence(
    function(time, note) {
      changeColor(snareBox);
      drums505.triggerAttackRelease('D4', '4n', time);
    },
    ['D4'],
    '4n'
  );

  // Kick Sequence
  const kickPart = new Tone.Sequence(
    function(time, note) {
      changeColor(kickBox);
      drums505.triggerAttackRelease('C3', '4n', time);
    },
    kickNotes,
    '16n'
  );

  // starting time of sequences
  pizzPart.start();
  bassPart.start();
  snarePart.start('8n');
  kickPart.start();
  highHatPart.start();

  $bpmRange.addEventListener('input', function() {
    bpm = $bpmRange.value;
    Tone.Transport.bpm.value = bpm;
  });

  $swingRange.addEventListener('input', function() {
    swing = $swingRange.value;
    Tone.Transport.swing = swing;
  });

  $filterRange.addEventListener('input', function() {
    filter = $filterRange.value;
    pizzSynth.filterEnvelope.baseFrequency = filter;
    // Tone.Transport.seconds = filter;
  });

  /*
   * Change background color of elements
   */
  function changeColor(elem) {
    elem.style.backgroundColor = accentColor;
    setTimeout(function() {
      elem.style.backgroundColor = defaultColor;
    }, 100);
  }

  // Route everything through the filter & compressor before playing
  Tone.Master.chain(lowBump, masterCompressor);

  /*
   * Tone Transport
   * set the beats per minute, volume, swing feel etc...
   */
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = swing;
  Tone.Transport.swingSubdivision = '16n';
  Tone.Transport.loopStart = 0;

  /*
   * Play Controls
   */
  $playBtn.addEventListener('click', function() {
    // Tone.Transport.stop();
    if (!playing) {
      playing = true;
      $playBtn.value = 'stop';
      Tone.Master.mute = false;
      Tone.Transport.start('+0.1');
    } else {
      playing = false;
      $playBtn.value = 'play';
      Tone.Transport.stop();
    }
  });
})();

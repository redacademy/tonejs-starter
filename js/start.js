(function() {
  "use strict";

  // boolean
  let playing = false;

  // CSS accent-color variable
  const accentColor = getComputedStyle(document.body).getPropertyValue(
    "--accent-color"
  );

  // CSS default-color variable
  const defaultColor = getComputedStyle(document.body).getPropertyValue(
    "--default-color"
  );

  // dom elements to animate
  const kickBox = document.querySelector(".kickbox");
  const snareBox = document.querySelector(".snarebox");
  const highHatBox = document.querySelector(".highhatbox");
  const bassBox = document.querySelector(".bassbox");
  const pizzBox = document.querySelector(".pizzbox");

  // Bass notes array
  const bassNotes = [
    ["F#3", "F#3"],
    null,
    ["F#3", "F#3"],
    null,
    ["F#3", "F#3"],
    null,
    null,
    null,
    ["F#3", "F#3"],
    null,
    null,
    null,
    ["F#3", "F#3"],
    null,
    null,
    null,
    ["E3", "E3"],
    null,
    ["E3", "E3"],
    null,
    ["E3", "E3"],
    null,
    null,
    null,
    ["E3", "E3"],
    null,
    null,
    null,
    ["E3", "E3"],
    null,
    null,
    null,
    ["F#3", "F#3"],
    null,
    ["F#3", "F#3"],
    null,
    ["F#3", "F#3"],
    null,
    null,
    null,
    ["F#3", "F#3"],
    null,
    null,
    null,
    ["F#3", "F#3"],
    null,
    null,
    null,
    ["G3", "G3"],
    null,
    ["G3", "G3"],
    null,
    ["G3", "G3"],
    null,
    null,
    null,
    ["G3", "G3"],
    null,
    null,
    null,
    ["G3", "G3"],
    null,
    null,
    null
  ];

  // Pizzicato notes array
  const pizzNotes = [
    "C#4",
    ["D4", "C#4"],
    ["C#4", "D4"],
    ["C#4", "C#4"],
    ["D4", "C#4"],
    ["C#4", "C#4"],
    ["B#3", "C#4"],
    ["C#4", "C#4"],
    "C#4",
    ["D4", "C#4"],
    ["C#4", "D4"],
    ["C#4", "C#4"],
    ["D4", "C#4"],
    ["C#4", "C#4"],
    ["B#3", "C#4"],
    ["C#4", "C#4"],
    "B3",
    ["B#3", "B3"],
    ["B3", "B#3"],
    ["B3", "B3"],
    ["B#3", "B3"],
    ["B3", "B3"],
    ["A#3", "B3"],
    ["B3", "B3"],
    "B3",
    ["B#3", "B3"],
    ["B3", "B#3"],
    ["B3", "B3"],
    ["B#3", "B3"],
    ["B3", "B3"],
    ["A#3", "B3"],
    ["B3", "B3"]
  ];

  // Hi-hat notes array
  const highHatNotes = [
    ["G3", null],
    ["G3", null],
    [null, "G3"],
    [null, ["A3", null]],
    ["G3", null],
    ["G3", "G3"],
    ["G3", "G3"],
    ["G3", "G3"],
    ["G3", null],
    ["G3", null],
    [null, "G3"],
    [null, ["A3", null]],
    ["G3", null],
    ["G3", "G3"],
    ["G3", "G3"],
    ["G3", "G3"]
  ];

  // Kick notes array
  const kickNotes = ["C3", null, null, null, ["C3", "C3"], null, null, null];

  /**
   * Effects
   */
  const reverb1 = new Tone.Freeverb(0.3, 10000).receive("reverb").toMaster();
  const reverb2 = new Tone.Freeverb(0.4, 10000).receive("reverb").toMaster();
  const reverb3 = new Tone.Freeverb(0.8, 15000).receive("reverb").toMaster();

  /**
   * Delay
   */
  let feedbackDelay = new Tone.PingPongDelay({
    delayTime: "16n",
    feedback: 0.3,
    wet: 0.3
  }).toMaster();

  /**
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
    type: "lowshelf",
    frequency: 100,
    Q: 1,
    gain: 10
  });

  /**
   * Bass
   */
  const bassSynth = new Tone.MonoSynth({
    oscillator: {
      type: "fmsquare5",
      modulationType: "triangle",
      modulationIndex: 2,
      harmonicity: 0.501
    },
    filter: {
      Q: 1,
      type: "lowpass",
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
  }).toMaster();

  /**
   * Drums
   */
  const drums505 = new Tone.Sampler(
    {
      D4: "snare.[mp3|ogg]",
      C3: "kick.[mp3|ogg]",
      G3: "hh.[mp3|ogg]",
      A3: "hho.[mp3|ogg]"
    },
    {
      volume: 10,
      release: 1,
      baseUrl: "./audio/505/"
    }
  ).toMaster();

  /**
   * Pizz
   */
  const pizzSynth = new Tone.MonoSynth({
    oscillator: {
      type: "sawtooth"
    },
    filter: {
      Q: 3,
      type: "highpass",
      rolloff: -12
    },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0,
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
  }).connect(feedbackDelay);

  /**
   * Sequence Parts
   */
  const pizzPart = new Tone.Sequence(
    function(time, note) {
      changeColor(pizzBox);
      pizzSynth.triggerAttackRelease(note, "10hz", time);
    },
    pizzNotes,
    "16n"
  );

  // Bass Sequence
  const bassPart = new Tone.Sequence(
    function(time, note) {
      changeColor(bassBox);
      bassSynth.triggerAttackRelease(note, "10hz", time);
    },
    bassNotes,
    "16n"
  );

  // High-hat Sequence
  const highHatPart = new Tone.Sequence(
    function(time, note) {
      changeColor(highHatBox);
      drums505.triggerAttackRelease(note, "4n", time);
    },
    highHatNotes,
    "16n"
  );

  // Snare Sequence
  const snarePart = new Tone.Sequence(
    function(time, note) {
      changeColor(snareBox);
      drums505.triggerAttackRelease("D4", "4n", time);
    },
    ["D4"],
    "4n"
  );

  // Kick Sequence
  const kickPart = new Tone.Sequence(
    function(time, note) {
      changeColor(kickBox);
      drums505.triggerAttackRelease("C3", "4n", time);
    },
    kickNotes,
    "16n"
  );

  // starting time of sequences
  pizzPart.start();
  bassPart.start();
  snarePart.start("2:0:2");
  kickPart.start("2m");
  highHatPart.start("2m");

  /**
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

  /**
   * Tone Transport
   * set the beats per minute, volume, swing feel etc...
   */
  Tone.Transport.bpm.value = 60;
  Tone.Transport.swing = 0;
  Tone.Transport.swingSubdivision = "16n";
  Tone.Transport.loopStart = 0;

  /**
   * Play Controls
   */
  document.querySelector("body").addEventListener("click", function() {
    // Tone.Transport.stop();
    if (!playing) {
      playing = true;
      Tone.Master.mute = false;
      Tone.Transport.start("+0.1");
    } else {
      playing = false;
      Tone.Transport.stop();
    }
  });

})();

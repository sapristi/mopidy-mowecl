import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
} from "react";
import { connect, useSelector } from "react-redux";

import { GlobalHotKeys } from "react-hotkeys";

const HotKeysProviderUnc = ({ playbackState, volume, hotkeys_conf }) => {
  const mopidy = useSelector((state) => state.mopidy.client);

  const [HotKeys, setHotKeys] = useState(() => () => null);

  useEffect(() => {
    const volume_incr = () => Math.min(100, Math.floor(volume * 1.1 + 1));
    const volume_decr = () => Math.floor(volume * 0.9);

    const handlers = {
      play_pause: () => {
        playbackState === "playing"
          ? mopidy.playback.pause()
          : mopidy.playback.play();
      },
      next: () => mopidy.playback.next(),
      previous: () => mopidy.playback.previous(),
      rewind: () => mopidy.playback.seek({ time_position: 0 }),
      volume_up: () => mopidy.mixer.setVolume({ volume: volume_incr() }),
      volume_down: () => mopidy.mixer.setVolume({ volume: volume_decr() }),
    };

    const preventDefaultHandler = (handler) => (event) => {
      event.preventDefault();
      handler();
    };
    const defaultPreventedHandlers = Object.fromEntries(
      Object.entries(handlers).map(([k, h]) => [k, preventDefaultHandler(h)]),
    );

    setHotKeys(() => () => (
      <GlobalHotKeys
        keyMap={hotkeys_conf}
        handlers={defaultPreventedHandlers}
      />
    ));
  }, [playbackState, volume, hotkeys_conf, mopidy]);

  return <HotKeys />;
};

export const HotKeysProvider = connect((state) => ({
  playbackState: state.playback_state.state,
  volume: state.playback_state.volume,
  hotkeys_conf: state.settings.persistant.globalKeys,
}))(HotKeysProviderUnc);

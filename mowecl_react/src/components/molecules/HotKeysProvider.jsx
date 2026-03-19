import { useSelector } from "react-redux";
import { useHotkeys } from "react-hotkeys-hook";

const usePlaybackHotkey = (key, handler) => {
  useHotkeys(key || "", handler, {
    enabled: !!key,
    preventDefault: true,
  });
};

export const HotKeysProvider = () => {
  const mopidy = useSelector((state) => state.mopidy.client);
  const playbackState = useSelector((state) => state.playback_state.state);
  const volume = useSelector((state) => state.playback_state.volume);
  const hotkeys_conf = useSelector(
    (state) => state.settings.persistant.globalKeys,
  );

  usePlaybackHotkey(hotkeys_conf.play_pause, () => {
    playbackState === "playing"
      ? mopidy.playback.pause()
      : mopidy.playback.play();
  });

  usePlaybackHotkey(hotkeys_conf.next, () => mopidy.playback.next());

  usePlaybackHotkey(hotkeys_conf.previous, () => mopidy.playback.previous());

  usePlaybackHotkey(hotkeys_conf.rewind, () =>
    mopidy.playback.seek({ time_position: 0 }),
  );

  usePlaybackHotkey(hotkeys_conf.volume_up, () =>
    mopidy.mixer.setVolume({ volume: Math.min(100, Math.floor(volume * 1.1 + 1)) }),
  );

  usePlaybackHotkey(hotkeys_conf.volume_down, () =>
    mopidy.mixer.setVolume({ volume: Math.floor(volume * 0.9) }),
  );

  return null;
};

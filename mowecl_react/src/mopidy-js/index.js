import { useSelector, useDispatch } from "react-redux";

import equal from "fast-deep-equal";
import { buildMopidyUrl, getWsAddress, match } from "@/utils";
import MopidyClient from "./mopidy-js.js";

import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
} from "react";
import { useAppState } from "@/hooks.js";
import { getLogger } from "@/logger";

const stopClient = (client) => {
  client.removeAllListeners();
  client.close();
  client.off();
};

export const useWsClient = (endpoint, init_callback, selector) => {
  // const client = useSelector(selector)
  const mopidyHost = useSelector(
    (store) => store.settings.persistant.mopidy_host,
  );
  const mopidyPort = useSelector(
    (store) => store.settings.persistant.mopidy_port,
  );
  const dispatch = useDispatch();
  const setActivePanel = useAppState((state) => state.setActivePanel);

  useEffect(() => {
    dispatch({ type: "CLIENT_DISCONNECTED", endpoint });
    const log = getLogger(`ws:${endpoint}`);
    const wsAddress = getWsAddress(mopidyHost, mopidyPort, endpoint);
    log.info("Connecting to", wsAddress);
    const new_client = new MopidyClient({
      webSocketUrl: wsAddress,
      autoConnect: false,
      console: log,
    });
    // Diagnostics: log websocket close events, with time since the connection
    // opened and since the last message, to identify idle timeouts.
    let openedAt = null;
    let lastMessageAt = null;
    new_client.on("websocket:open", () => {
      openedAt = Date.now();
      lastMessageAt = openedAt;
      log.info(`open at ${new Date().toISOString()}`);
    });
    new_client.on("websocket:incomingMessage", () => {
      lastMessageAt = Date.now();
    });
    new_client.on("websocket:close", (e) => {
      const now = Date.now();
      const secs = (t) => (t === null ? null : ((now - t) / 1000).toFixed(1));
      log.info(`close at ${new Date().toISOString()}`, {
        code: e?.code,
        reason: e?.reason,
        wasClean: e?.wasClean,
        openForSec: secs(openedAt),
        idleForSec: secs(lastMessageAt),
        visibility: document.visibilityState,
        online: navigator.onLine,
      });
    });
    try {
      new_client.connect();
    } catch (error) {
      log.error("Error when initializing mopidy client", error);
      stopClient(new_client);
      dispatch({ type: "CONNECTION_ERROR", endpoint, error });
    }
    const baseURL = buildMopidyUrl(mopidyHost, mopidyPort);
    init_callback(new_client, dispatch, setActivePanel, baseURL);
    window[endpoint] = new_client;
    return () => stopClient(new_client);
  }, [mopidyHost, mopidyPort, dispatch, endpoint, init_callback]);
};

export const makeWsClientReducer =
  (endpoint) =>
  (
    state = {
      connected: false,
      hasEverConnected: false,
      pendingRequestsNb: 0,
      error: null,
      client: new MopidyClient({ autoConnect: false }),
    },
    action,
  ) =>
    match([action.type, action.endpoint], equal, true)
      .on(["UPDATE_CLIENT", endpoint], () => ({
        ...state,
        client: action.client,
      }))
      .on(["CLIENT_CONNECTED", endpoint], () => ({
        ...state,
        connected: true,
        hasEverConnected: true,
      }))
      .on(["CLIENT_DISCONNECTED", endpoint], () => ({
        ...state,
        connected: false,
      }))
      .on(["PENDING_REQUESTS_COUNT", endpoint], () => ({
        ...state,
        pendingRequestsNb: action.data,
      }))
      .on(["CONNECTION_ERROR", endpoint], () => ({
        ...state,
        error: action.error.toString(),
        connected: false,
      }))
      .otherwise(() => state);

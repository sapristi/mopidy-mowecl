import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
} from "react";
import styled from "@emotion/styled";

const MyBar = styled.div`
  width: 6px;
  flex-shrink: 0;
  opacity: 0.5;

  &:hover {
    opacity: 1;
  }
  padding-left: 1px;
`;

export const ChildrenSideBar = ({ callback, color }) => (
  <MyBar onClick={callback}>
    <div
      style={{
        width: "40px",
        height: "6px",
        backgroundColor: color,
      }}
    />
    <div
      style={{
        backgroundColor: color,
        height: "calc(100% - 16px)",
      }}
    />
    <div
      style={{
        width: 0,
        height: 0,
        borderTop: "6px solid " + color,
        borderRight: "6px solid transparent",
      }}
    />
  </MyBar>
);

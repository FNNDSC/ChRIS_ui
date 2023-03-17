import React from "react";
import { LazyLog } from "react-lazylog";
import { MdClose } from "react-icons/md";
import { ButtonWithTooltip } from "../../common/button";
import { useDispatch } from "react-redux";
import { getNodeOperations } from "../../../store/plugin/actions";

type LogTerminalProps = {
  text: string;
};

const LogTerminal = ({ text }: LogTerminalProps) => {
  const dispatch = useDispatch();
  return (
    <>
      <div
        style={{
          height: "100%",
        }}
      >
        <ButtonWithTooltip
          content={<span>Close the Terminal</span>}
          position="bottom"
          style={{
            position: "absolute",
            top: "0",
            right: "0",
          }}
          onClick={() => {
            dispatch(getNodeOperations("terminal"));
          }}
          variant="link"
          icon={
            <MdClose
              style={{
                color: "white",
                height: "18px",
                width: "18px",
              }}
            />
          }
        />
        <LazyLog
          selectableLines={true}
          extraLines={1}
          enableSearch
          text={text}
          caseInsensitive
          lineHeight={21}
        />
      </div>
    </>
  );
};

export default LogTerminal;

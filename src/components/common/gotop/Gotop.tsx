import * as React from "react";
import { ArrowAltCircleUpIcon } from "@patternfly/react-icons";
import "./gotop.scss";


type AllProps = {
  isActive: boolean;
  scrollable: string;
  handleScrollTop?: () => void;
}

const Gotop: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const handleScrollTop = () => {
    const { isActive, scrollable } = props;
    if (isActive) {
      const div = document.getElementById(scrollable);
      !!div && (div.scrollTop = 0);
    }
  }

  return (
      // eslint-disable-next-line
    <a id="gotop" className={`gotop ${props.isActive ? "active" : ""}`}
      onClick={handleScrollTop} >
      <ArrowAltCircleUpIcon color="#007bba" />
    </a >
  )
}

export default React.memo(Gotop);

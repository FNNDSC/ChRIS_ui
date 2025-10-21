import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  color?: string;
  className?: string;
  style?: CSSProperties;
};

export default (props: Props) => {
  const {
    children,
    color: propsColor,
    className: propsClassName,
    style: propsStyle,
  } = props;

  const color = propsColor || "inherit";
  const className = propsClassName || "";
  const style = propsStyle || {};

  return (
    <h4
      className={`custom-title ${className}`}
      style={{
        margin: 0,
        marginBottom: 0,
        color,
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: "1.4",
        ...style,
      }}
    >
      {children}
    </h4>
  );
};

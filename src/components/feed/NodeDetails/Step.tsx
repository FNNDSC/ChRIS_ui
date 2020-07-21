import React, { CSSProperties } from "react";

const Step = (props: any) => {
  const { active, completed, first, isLast, href, onClick } = props;

  const styles = getStyles(props);
  const circleStyle = Object.assign(
    styles.circle,
    completed === true ? styles.completedCircle : {},
    active === true ? styles.activeCircle : {}
  );
  const titleStyle = Object.assign(
    styles.title,
    completed ? styles.completedTitle : {},
    active ? styles.activeTitle : {}
  );
  const leftStyle = Object.assign(
    styles.leftBar,
    active || completed ? styles.completedBar : {}
  );
  const rightStyle = Object.assign(
    styles.rightBar,
    completed ? styles.completedBar : {}
  );

  return (
    <div onClick={onClick} style={styles.step as CSSProperties}>
      <div style={circleStyle as CSSProperties}></div>
      {completed ? (
        <a href={href} style={titleStyle as CSSProperties}>
          
        </a>
      ) : (
        <div style={titleStyle as CSSProperties}></div>
      )}
      {!first && <div style={leftStyle as CSSProperties} />}
      {!isLast && <div style={rightStyle as CSSProperties} />}
    </div>
  );
};

Step.defaultProps = {
  activeColor: "#5096FF",
  completeColor: "#5096FF",
  defaultColor: "#E0E0E0",
  activeTitleColor: "#000",
  completeTitleColor: "#000",
  defaultTitleColor: "#757575",
  circleFontColor: "#FFF",
  size: 18,
  circleFontSize: 16,
  titleFontSize: 16,
  circleTop: 24,
  titleTop: 8,
  defaultBarColor: "#E0E0E0",
  barStyle: "solid",
  borderStyle: "solid",
};

function getStyles(props: any) {
  const {
    activeColor,
    defaultColor,
    circleFontColor,
    activeTitleColor,
    completeTitleColor,
    defaultTitleColor,
    size,
    circleFontSize,
    titleFontSize,
    circleTop,
    titleTop,
    completeOpacity,
    activeOpacity,
    defaultOpacity,
    completeTitleOpacity,
    activeTitleOpacity,
    defaultTitleOpacity,
    barStyle,
    defaultBarColor,
    completeBarColor,
    defaultBorderColor,
    completeBorderColor,
    activeBorderColor,
    defaultBorderStyle,
    completeBorderStyle,
    activeBorderStyle,
    activeCircleFontColor,
    fontFamily,
    circleCursor,
    barHeight,
    onClick,
    completed,
  } = props;
  return {
    step: {
      width: `20%`,
      display: "table-cell",
      position: "relative",
      paddingTop: circleTop,
      cursor: "pointer",
    },
    circle: {
      width: size,
      height: size,
      margin: "0 auto",
      backgroundColor: defaultColor,
      borderRadius: "50%",
      textAlign: "center",
      fontSize: "16px",
      color: circleFontColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: defaultOpacity,
      borderWidth: defaultBorderColor ? 3 : 0,
      borderColor: defaultBorderColor,
      borderStyle: defaultBorderStyle,
      cursor: circleCursor,
    },
    activeCircle: {
      backgroundColor: "grey",
      opacity: activeOpacity,
      borderWidth: activeBorderColor ? 3 : 0,
      borderColor: activeBorderColor,
      borderStyle: activeBorderStyle,
      cursor: circleCursor,
    },
    completedCircle: {
      backgroundColor: activeColor,
      opacity: completeOpacity,
      borderWidth: completeBorderColor ? 3 : 0,
      borderColor: completeBorderColor,
      borderStyle: completeBorderStyle,
      cursor: circleCursor,
    },
    index: {
      lineHeight: `${size + circleFontSize / 4}px`,
      color: circleFontColor,
      fontFamily: fontFamily,
      cursor: completed && isFunction(onClick) ? "pointer" : "default",
    },
    activeIndex: {
      lineHeight: `${size + circleFontSize / 4}px`,
      color: activeCircleFontColor,
      fontFamily: fontFamily,
    },
    title: {
      marginTop: titleTop,
      fontSize: titleFontSize,
      fontWeight: "300",
      textAlign: "center",
      display: "block",
      color: defaultTitleColor,
      opacity: defaultTitleOpacity,
      fontFamily: fontFamily,
      cursor: "default",
    },
    activeTitle: {
      color: activeTitleColor,
      opacity: activeTitleOpacity,
      fontFamily: fontFamily,
    },
    completedTitle: {
      color: completeTitleColor,
      opacity: completeTitleOpacity,
      fontFamily: fontFamily,
      cursor: isFunction(onClick) ? "pointer" : "default",
    },
    leftBar: {
      position: "absolute",
      top: circleTop + size / 2,
      height: 1,
      borderTopStyle: barStyle,
      borderTopWidth: barHeight || 1,
      borderTopColor: defaultBarColor,
      left: 0,
      right: "50%",
      marginRight: size / 2,
      opacity: defaultOpacity,
    },
    rightBar: {
      position: "absolute",
      top: circleTop + size / 2,
      height: 1,
      borderTopStyle: barStyle,
      borderTopWidth: barHeight || 1,
      borderTopColor: defaultBarColor,
      right: 0,
      left: "50%",
      marginLeft: size / 2,
      opacity: defaultOpacity,
    },
    completedBar: {
      borderTopStyle: barStyle,
      borderTopWidth: barHeight || 1,
      borderTopColor: completeBarColor,
      opacity: completeOpacity,
    },
  };
}

const isFunction = (_: () => {}) => typeof _ === "function";

export default Step;

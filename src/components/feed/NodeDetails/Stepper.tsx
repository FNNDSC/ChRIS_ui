import React, { CSSProperties } from "react";
import Step from "./Step";

export interface StepInterface {
  id: number;
  completed: boolean;
  title: string;
}

interface StepperProps {
  completed?: Number;
  steps: StepInterface[];
  activeStep?: Number;
  activeColor?: string;
  completeColor?: string;
  defaultColor?: string;
  activeTitleColor?: string;
  completeTitleColor?: string;
  defaultTitleColor?: string;
  circleFontColor?: string;
  size?: Number;
  circleFontSize?: Number;
  titleFontSize?: Number;
  circleTop?: Number;
  titleTop?: Number;
  defaultOpacity?: string;
  completeOpacity?: string;
  activeOpacity?: string;
  defaultTitleOpacity?: string;
  completeTitleOpacity?: string;
  activeTitleOpacity?: string;
  barStyle?: string;
  defaultBarColor?: string;
  completeBarColor?: string;
  defaultBorderColor?: string;
  completeBorderColor?: string;
  activeBorderColor?: string;
  defaultBorderStyle?: string;
  completeBorderStyle?: string;
  activeBorderStyle?: string;
  activeCircleFontColor?: string;
  defaultCircleFontColor?: string;
  checkIcon?: string;
  fontFamily?: string;
  circleCursor?: string;
  barHeight?: string;
  onClick: () => void;
}

const styles = {
  root: {
    width: "35%",
    minHeight: 0,
    padding: 0,
    marginTop: "-20px",
    marginLeft: "-30px",
  },
  stepper: {
    display: "table",
    width: "100%",
    margin: "0 auto",
  },
};

function Stepper(props: StepperProps) {
  const {
    steps,
    activeColor,
    completeColor,
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
    defaultBorderColor,
    completeBorderColor,
    activeBorderColor,
    defaultBorderStyle,
    completeBorderStyle,
    activeBorderStyle,
    defaultBarColor,
    completeBarColor,
    activeCircleFontColor,
    defaultCircleFontColor,
    checkIcon,
    fontFamily,
    circleCursor,
    barHeight,
    onClick,
  } = props;

  return (
    <div style={styles.root as CSSProperties}>
      <div style={styles.stepper}>
        {steps.map((step, index) => {
          const completed = step.completed === true ? true : false;
          return (
            <Step
              key={index}
              width={100 / steps.length}
              title={step.title}
              completed={completed}
              first={index === 0}
              isLast={index === steps.length - 1}
              index={index}
              activeColor={activeColor}
              completeColor={completeColor}
              defaultColor={defaultColor}
              circleFontColor={circleFontColor}
              activeTitleColor={activeTitleColor}
              completeTitleColor={completeTitleColor}
              defaultTitleColor={defaultTitleColor}
              size={size}
              circleFontSize={circleFontSize}
              titleFontSize={titleFontSize}
              circleTop={circleTop}
              titleTop={titleTop}
              defaultOpacity={defaultOpacity}
              completeOpacity={completeOpacity}
              activeOpacity={activeOpacity}
              defaultTitleOpacity={defaultTitleOpacity}
              completeTitleOpacity={completeTitleOpacity}
              activeTitleOpacity={activeTitleOpacity}
              barStyle={barStyle}
              defaultBorderColor={defaultBorderColor}
              completeBorderColor={completeBorderColor}
              activeBorderColor={activeBorderColor}
              defaultBorderStyle={defaultBorderStyle}
              completeBorderStyle={completeBorderStyle}
              activeBorderStyle={activeBorderStyle}
              defaultBarColor={defaultBarColor}
              completeBarColor={completeBarColor}
              activeCircleFontColor={activeCircleFontColor}
              checkIcon={checkIcon}
              defaultCircleFontColor={defaultCircleFontColor}
              fontFamily={fontFamily}
              circleCursor={circleCursor}
              barHeight={barHeight}
              onClick={onClick}
            />
          );
        })}
      </div>
    </div>
  );
}

Stepper.defaultProps = {
  activeStep: 0,
};

export default Stepper;

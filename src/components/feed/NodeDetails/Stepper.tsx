import React, { CSSProperties } from "react";
import Step from "./Step";

export interface StepInterface {
  id: number;
  completed: boolean;
  title: string;
}

interface StepperProps {
  steps: StepInterface[];
  onClick: () => void;
}

const styles = {
  root: {
    width: "35%",
    minHeight: "0",
    paddingTop: "12px",
    marginLeft: "-30px",
  },
  stepper: {
    display: "table",
    width: "100%",
    margin: "0 auto",
  },
};

function Stepper(props: StepperProps) {
  const { steps, onClick } = props;

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

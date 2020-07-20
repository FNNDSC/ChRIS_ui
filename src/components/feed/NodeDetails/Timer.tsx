import React, { PureComponent } from "react";

let offset: any = null,
  interval: any = null;

interface TimerProps {
  delay: number;
  play: boolean;
  pause: boolean;
  reset: boolean;
}

interface TimerState {
  clock: number;
  time: string | number;
}

/**
 * Timer module
 * A simple timer component.
 **/
class Timer extends PureComponent<TimerProps, TimerState> {
  constructor(props: TimerProps) {
    super(props);
    this.state = { clock: 0, time: "" };
  }

  componentDidMount() {
    if (this.props.play) this.play();
    if (this.props.pause) this.pause();
    if (this.props.reset) this.reset();
  }

  componentWillUnmount() {
    this.pause();
  }

  pause() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  play() {
    if (!interval) {
      offset = Date.now();
      interval = setInterval(this.update.bind(this), this.props.delay);
    }
  }

  reset() {
    let clockReset = 0;
    this.setState({ clock: clockReset });
    let time = SecondsTohhmmss(clockReset / 1000);
    this.setState({ time: time });
  }

  update() {
    let clock = this.state.clock;
    clock += this.calculateOffset();
    this.setState({ clock: clock });
    let time = SecondsTohhmmss(clock / 1000);
    this.setState({ time: time });
  }

  calculateOffset() {
    let now = Date.now();
    let newOffset = now - offset;
    offset = now;
    return newOffset;
  }

  render() {
    return (
      <>
        <span
          style={{
            color: "white",
            marginLeft: "3px",
          }}
        >
          {" "}
          {this.state.time}
        </span>
      </>
    );
  }
}

export default Timer;

const SecondsTohhmmss = (totalSeconds: number) => {
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  let seconds = totalSeconds - hours * 3600 - minutes * 60;

  // round seconds
  seconds = (Math.floor(seconds * 100) / 100) | 0;

  let result = hours < 10 ? "0" + hours : hours;
  result += ":" + (minutes < 10 ? "0" + minutes : minutes);
  result += ":" + (seconds < 10 ? "0" + seconds : seconds);

  return result;
};

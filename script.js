// Accurate_Interval.js 
// Thanks Squeege! For the elegant answer provided to this question: 
// http://stackoverflow.com/questions/8173580/setinterval-timing-slowly-drifts-away-from-staying-accurate
// Github: https://gist.github.com/Squeegy/1d99b3cd81d610ac7351
// Slightly modified to accept 'normal' interval/timeout format (func, time). 

(function () {
  window.accurateInterval = function (fn, time) {
    var cancel, nextAt, timeout, wrapper;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function () {
      nextAt += time;
      timeout = setTimeout(wrapper, nextAt - new Date().getTime());
      return fn();
    };
    cancel = function () {
      return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
      cancel: cancel };

  };
}).call(this);

const accurateInterval = function (fn, time) {
  let cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel };

};

class TimerLengthControl extends React.Component {
  render() {
    return /*#__PURE__*/(
      React.createElement("div", { className: "length-control" }, /*#__PURE__*/
      React.createElement("div", { id: this.props.titleID }, this.props.title), /*#__PURE__*/
      React.createElement("button", { className: "btn-level", id: this.props.minID, value: "-", onClick: this.props.onClick }, /*#__PURE__*/
      React.createElement("i", { className: "fa fa-minus fa-2x" })), /*#__PURE__*/

      React.createElement("div", { className: "btn-level", id: this.props.lengthID }, this.props.length), /*#__PURE__*/
      React.createElement("button", { className: "btn-level", id: this.props.addID, value: "+", onClick: this.props.onClick }, /*#__PURE__*/
      React.createElement("i", { className: "fa fa-plus fa-2x" }))));



  }}


class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      brkLength: 5,
      sesLength: 25,
      timer: 1500,
      timerState: 'stop',
      timerType: 'session',
      intervalID: '',
      alarmColor: { color: 'white' },
      playPause: 'fa fa-play fa-2x' };

    this.setBrk = this.setBrk.bind(this);
    this.setSes = this.setSes.bind(this);
    this.lengthControl = this.lengthControl.bind(this);
    this.timerControl = this.timerControl.bind(this);
    this.phaseControl = this.phaseControl.bind(this);
    this.beginCountDown = this.beginCountDown.bind(this);
    this.decrementTimer = this.decrementTimer.bind(this);
    this.warning = this.warning.bind(this);
    this.buzzer = this.buzzer.bind(this);
    this.reset = this.reset.bind(this);
    this.switchTimer = this.switchTimer.bind(this);
  }
  setBrk(e) {
    this.lengthControl('brkLength', e.currentTarget.value, this.state.brkLength, 'session');
  }

  setSes(e) {
    this.lengthControl('sesLength', e.currentTarget.value, this.state.sesLength, 'break');
  }
  lengthControl(stateToChange, sign, currentLength, timerType) {

    if (this.state.timerState === 'running') return;
    if (this.state.timerType === timerType) {
      if (sign === '-' && currentLength !== 1) {
        this.setState({
          [stateToChange]: currentLength - 1 });

      } else if (sign === '+' && currentLength !== 60) {
        this.setState({
          [stateToChange]: currentLength + 1 });

      }
    } else if (sign === '-' && currentLength !== 1) {
      this.setState({
        [stateToChange]: currentLength - 1,
        timer: currentLength * 60 - 60 });

    } else if (sign === '+' && currentLength !== 60) {
      this.setState({
        [stateToChange]: currentLength + 1,
        timer: currentLength * 60 + 60 });

    }
  }
  timerControl() {
    console.log('tc');
    if (this.state.timerState === 'stop') {
      this.beginCountDown();
      this.setState({ timerState: 'running', playPause: 'fa fa-pause fa-2x' });
    } else {
      this.setState({ timerState: 'stop', playPause: 'fa fa-play fa-2x' });
      if (this.state.intervalID) {
        this.state.intervalID.cancel();
      }
    }
  }
  beginCountDown() {
    console.log('bcd');
    this.setState({
      intervalID: accurateInterval(() => {
        this.decrementTimer();
        this.phaseControl();
      }, 1000) });

  }
  decrementTimer() {
    this.setState({
      timer: this.state.timer - 1 });

  }
  phaseControl() {
    let timer = this.state.timer;
    this.warning(timer);
    this.buzzer(timer);
    if (timer < 0) {
      if (this.state.intervalID) this.state.intervalID.cancel();
      if (this.state.timerType === 'session') {
        this.beginCountDown();
        this.switchTimer(this.state.brkLength * 60, 'break');
      } else {
        this.beginCountDown();
        this.switchTimer(this.state.sesLength * 60, 'session');
      }
    }
  }
  warning(_time) {
    if (_time < 61) {
      this.setState({ alarmColor: { color: '#a50d0d' } });
    } else {
      this.setState({ alarmColor: { color: 'white' } });
    }
  }
  buzzer(_time) {
    if (_time == 0) this.audioBeep.play();
  }
  switchTimer(num, str) {
    this.setState({
      timer: num,
      timerType: str,
      alarmColor: { color: 'white' } });

  }
  clockify() {
    let minutes = Math.floor(this.state.timer / 60);
    let seconds = this.state.timer - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return minutes + ':' + seconds;
  }
  reset() {
    this.setState({
      brkLength: 5,
      sesLength: 25,
      timerState: 'stop',
      timerType: 'session',
      timer: 1500,
      intervalID: '',
      alarmColor: { color: 'white' },
      playPause: 'fa fa-play fa-2x' });

    console.log('a');
    if (this.state.intervalID) {
      this.state.intervalID.cancel();
    }
    console.log('b');
    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  }
  render() {
    return /*#__PURE__*/(
      React.createElement("div", null, /*#__PURE__*/
      React.createElement(TimerLengthControl, {
        addID: "break-increment",
        length: this.state.brkLength,
        lengthID: "break-length",
        minID: "break-decrement",
        onClick: this.setBrk,
        title: "Break Length",
        titleID: "break-label" }), /*#__PURE__*/

      React.createElement(TimerLengthControl, {
        addID: "session-increment",
        length: this.state.sesLength,
        lengthID: "session-length",
        minID: "session-decrement",
        onClick: this.setSes,
        title: "Session Length",
        titleID: "session-label" }), /*#__PURE__*/

      React.createElement("div", { className: "timer" }, /*#__PURE__*/
      React.createElement("div", { className: "timer-wrapper", style: this.state.alarmColor }, /*#__PURE__*/
      React.createElement("div", { id: "timer-label" }, this.state.timerType), /*#__PURE__*/
      React.createElement("div", { id: "time-left" }, this.clockify()))), /*#__PURE__*/


      React.createElement("div", { className: "timer-control" }, /*#__PURE__*/
      React.createElement("button", { id: "start_stop", onClick: this.timerControl }, /*#__PURE__*/
      React.createElement("i", { className: this.state.playPause })), /*#__PURE__*/

      React.createElement("button", { id: "reset", onClick: this.reset }, /*#__PURE__*/
      React.createElement("i", { className: "fa fa-refresh fa-2x" }))), /*#__PURE__*/


      React.createElement("audio", {
        id: "beep",
        preload: "auto",
        ref: audio => {this.audioBeep = audio;},
        src: "https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" })));



  }}

ReactDOM.render( /*#__PURE__*/React.createElement(Timer, null), document.getElementById('app'));
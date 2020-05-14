import React, { Component } from 'react';
import './app.css';

export default class App extends Component {
  state = {
    iSpindels: [],
  };

  componentDidMount() {
    const getTheData = () => {
      fetch('/api/getData')
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          this.setState({ iSpindels: data });
        });
    };

    const getTheTime = () => {
      const time = new Date();
      const formattedNumber = (number) => ('0' + number).slice(-2);
      this.setState({ currentTime: `${time.getHours()}:${formattedNumber(time.getMinutes())}:${formattedNumber(time.getSeconds())}` });
    };

    if (window) {
      window.setInterval(() => getTheData(), 2000);
      window.setInterval(() => getTheTime(), 1000);
    }
  }

  render() {
    const { iSpindels, currentTime } = this.state;

    return (
      <div>
        {iSpindels.length === 0 &&
        <h1>Waiting for data...</h1>
        }

        {iSpindels &&
        iSpindels.length > 0 &&
        <div>
          <h1>
            Current Time: {currentTime}
          </h1>
          <div className="cardContainer">
            {iSpindels.map((iSpindel) => {
              return (
                <div className="card">
                  <h2>
                    {iSpindel.name} ({iSpindel.ID}) -
                    <span>{iSpindel.time}</span>
                  </h2>
                  <div className="info">
                    <div className="row">
                      <div className="left"><strong>Time</strong></div>
                      <div className="right"><strong>{iSpindel.time}</strong></div>
                    </div>
                    <div className="row">
                      <div className="left">Device Name</div>
                      <div className="right">{iSpindel.name}</div>
                    </div>
                    <div className="row">
                      <div className="left">Device ID</div>
                      <div className="right">{iSpindel.ID}</div>
                    </div>
                    <div className="row">
                      <div className="left">Angle</div>
                      <div className="right">{iSpindel.angle}</div>
                    </div>
                    <div className="row">
                      <div className="left">Temperature</div>
                      <div className="right">{iSpindel.temperature}</div>
                    </div>
                    <div className="row">
                      <div className="left">Temperature Unit</div>
                      <div className="right">{iSpindel.temp_units}</div>
                    </div>
                    <div className="row">
                      <div className="left">Battery</div>
                      <div className="right">{iSpindel.battery}</div>
                    </div>
                    <div className="row">
                      <div className="left">Gravity</div>
                      <div className="right">{iSpindel.gravity}</div>
                    </div>
                    <div className="row">
                      <div className="left">Interval</div>
                      <div className="right">{iSpindel.interval}</div>
                    </div>
                    <div className="row">
                      <div className="left">RSSI</div>
                      <div className="right">{iSpindel.RSSI}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        }

        <div className="footer">
          Created by: <a href="https://github.com/themoch/">themoch</a> <br />
          Fork on Github: <a href="https://github.com/themoch/iSpindel-Logger">https://github.com/themoch/iSpindel-Logger</a> <br />
          iSpindel Project: <a href="http://www.ispindel.de/">http://www.ispindel.de/</a>
        </div>
      </div>
    );
  }
}

import React, { useState, useEffect } from "react";
import "./styles.css";
const Clock = () => {
  const [day, setDay] = useState();
  const [hours, setHours] = useState();
  const [minutes, setMinutes] = useState();
  const [second, setSecond] = useState();

  let interval;

  const countDown = () => {
    //   var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    const des = new Date("March 2, 2023 ").getTime();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    interval = setInterval(() => {
      const now = new Date().getTime();
      const different = now - des;

      const days = Math.floor(different / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (different % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((different % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((different % (1000 * 60)) / 1000);

      if (des < 0) clearInterval(interval.current);
      else {
        setDay(days);
        setHours(hours);
        setMinutes(minutes);
        setSecond(seconds);
      }
    }, 1000);
  };

  useEffect(() => {
    countDown();
  });

  return (
    <div className="clock_wrapper d-flex align-items-center gap-3">
      <div className="clock_data  d-flex align-items-center gap-3 ">
        <div className="text-center">
          <h1 className="text-white fs-3 mb-2">{day}</h1>
          <h4 className="text-white fs-6">Ngày</h4>
        </div>
        <span className="text-white fs-3">:</span>
      </div>
      <div className="clock_data  d-flex align-items-center gap-3 ">
        <div className="text-center">
          <h1 className="text-white fs-3 mb-2">{hours}</h1>
          <h4 className="text-white fs-6">Giờ</h4>
        </div>
        <span className="text-white fs-3">:</span>
      </div>
      <div className="clock_data  d-flex align-items-center gap-3 ">
        <div className="text-center">
          <h1 className="text-white fs-3 mb-2">{minutes}</h1>
          <h4 className="text-white fs-6">Phút</h4>
        </div>
        <span className="text-white fs-3">:</span>
      </div>
      <div className="clock_data  d-flex align-items-center gap-3 ">
        <div className="text-center">
          <h1 className="text-white fs-3 mb-2">{second}</h1>
          <h4 className="text-white fs-6">Giây</h4>
        </div>
      </div>
    </div>
  );
};

export default Clock;

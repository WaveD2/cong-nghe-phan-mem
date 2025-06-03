import { useState, useEffect, useCallback } from 'react';

// Hàm tính toán và định dạng thời gian OTP
const getOtpTimeLeft = (expiresAt) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = Math.max(0, expiresAt - now);

  if (timeLeft <= 0) {
    return 'OTP đã hết hạn';
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

function OtpComponent({ otpExpiresAt }) {
  const [countdown, setCountdown] = useState(() => getOtpTimeLeft(otpExpiresAt));

  const updateCountdown = useCallback(() => {
    const timeLeft = getOtpTimeLeft(otpExpiresAt);
    setCountdown(timeLeft);
  }, [otpExpiresAt]);

  useEffect(() => {
    if (!otpExpiresAt || getOtpTimeLeft(otpExpiresAt) === 'OTP đã hết hạn') {
      return;
    }

    setCountdown(getOtpTimeLeft(otpExpiresAt));
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId); // Cleanup interval
  }, [otpExpiresAt, updateCountdown]);
  console.log("otpExpiresAt",otpExpiresAt);
  
  return (
    <>
      {otpExpiresAt && (
        <p className="text-gray-600 text-sm mt-2">{countdown}</p>
      )}
    </>
  );
}

export default OtpComponent;
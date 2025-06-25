import { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";

function ResetFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleEmailSent = (email) => {
    setEmail(email);
    setStep(2);
  };

  const handleOtpVerified = (otpCode) => {
    setOtp(otpCode);
    setStep(3);
  };

  return (
    <>
      {step === 1 && <ForgotPassword onEmailSent={handleEmailSent} />}
      {step === 2 && <VerifyOtp email={email} onSuccess={handleOtpVerified} />}
      {step === 3 && <ResetPassword email={email} otp={otp} />}
    </>
  );
}

export default ResetFlow;

import React, { useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth, googleAuthProvider, facebookAuthProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { countries } from "../config/countries";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import {
  isFacebookSigninEnabled,
  isGoogleSigninEnabled,
  otpPerDayLimit,
} from "../config/config";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Google from "@mui/icons-material/Google";

const Login = () => {
  const navigate = useNavigate();
  const [phoneotp, setPhoneotp] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("91");
  const [errText, setErrText] = useState("");

  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const [isOTPSigninEnabled, setIsOTPSigninEnabled] = useState(true);

  const handlePhoneNumberInputChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowOtpField(false);
    setPhoneNumber("");
    setPhoneotp("");
  };

  const setupRecaptcha = () => {
    console.log("setting up recaptcha");
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {},
      }
    );
  };

  // Phone sign in
  const handlePhoneSubmit = async (e) => {
    setIsSendingOTP(true);
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    const phoneNumberWithCountryCode = `+${selectedCountry}${phoneNumber}`;
    await signInWithPhoneNumber(auth, phoneNumberWithCountryCode, appVerifier)
      .then(async (confirmationResult) => {
        window.confirmationResult = confirmationResult;
        console.log("otp is sent");
        await updatetodayOTPCount();
        setIsSendingOTP(false);
        setShowOtpField(true);
      })
      .catch((error) => {
        setIsSendingOTP(false);
        setShowOtpField(true);
        console.log(error);
        appVerifier.clear();
        // window.recaptchaVerifier.render().then((widgetId)=> {
        //   window.grecaptcha.reset(widgetId);
        // });
      });
  };

  const handleOtpSubmit = async (e) => {
    setErrText("");
    setIsVerifyingOTP(true);
    console.log(`Phone: ${phoneNumber}, OTP: ${phoneotp}`);
    await window.confirmationResult
      .confirm(phoneotp)
      .then(async (res) => {
        console.log(res);
        setIsVerifyingOTP(false);
        navigate("/");
      })
      .catch((error) => {
        setIsVerifyingOTP(false);
        setErrText("Invalid OTP");
        console.log(error);
        alert("Incorrect OTP");
      });
  };

  // Google signin
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider).then((res) => {
        console.log(res);
        navigate("/");
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Facebook signin
  facebookAuthProvider.addScope("email");

  const signInWithFacebook = async () => {
    try {
      await signInWithPopup(auth, facebookAuthProvider).then((res) => {
        console.log(res);
        navigate("/");
      });
    } catch (err) {
      console.error(err);
    }
  };

  const checkTodayOTPCount = async () => {
    const unsub = onSnapshot(
      doc(db, "todayOTPCount", "todayOTPCount"),
      (doc) => {
        const dataObj = doc.data();
        const otpCount = dataObj.todayOTPCount;

        otpCount >= otpPerDayLimit
          ? setIsOTPSigninEnabled(false)
          : setIsOTPSigninEnabled(true);
      }
    );
    return () => {
      unsub();
    };
  };

  const updatetodayOTPCount = async () => {
    const docRef = doc(db, "todayOTPCount", "todayOTPCount");
    const docSnap = await getDoc(docRef);

    const docData = docSnap.data();

    await updateDoc(doc(db, "todayOTPCount", "todayOTPCount"), {
      todayOTPCount: docData.todayOTPCount + 1,
    });
  };

  useEffect(() => {
    if (auth.currentUser) {
      navigate("/");
    }

    checkTodayOTPCount();
    setIsOTPSigninEnabled(false);
  }, []);

  return (
    <div className="relative font-primary">
      <div
        className={`flex items-center justify-center h-screen bg-black fixed inset-0 bg-black transition-opacity ${
          showPopup ? "opacity-50" : "opacity-100 "
        }`}
      >
        <div className="bg-gray-800 bg-opacity-70 rounded shadow-lg p-8 w-80">
          <h1 className="text-center text-2xl font-bold text-white mb-4">
            🐓 Kodi Sastram 🐓
          </h1>
          <form>
            {/* <div className="flex mb-4"> */}
            {isOTPSigninEnabled ? (
              <>
                <div className="relative inline-flex w-full mr-1 my-2">
                  <select
                    className="text-white appearance-none w-full bg-gray-700 bg-opacity-50 border border-gray-300 rounded-md py-2 pl-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    disabled={showOtpField}
                  >
                    {countries.map((country, index) => (
                      <option
                        key={index}
                        value={country.code}
                        className="text-center"
                      >
                        {country.name} (+{country.code})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <KeyboardArrowDownRoundedIcon className="text-gray-400" />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Mobile Number"
                  className="text-white text-center w-full bg-gray-700 bg-opacity-50 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white my-2"
                  value={phoneNumber}
                  onChange={handlePhoneNumberInputChange}
                  disabled={showOtpField}
                />
                {/* </div> */}
                {!showOtpField && (
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 px-4 w-full font-medium my-2"
                    onClick={handlePhoneSubmit}
                    disabled={isSendingOTP}
                  >
                    {isSendingOTP ? (
                      <div className="animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-white"></div>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                )}
                {showOtpField && (
                  <div>
                    <input
                      type="text"
                      placeholder="OTP"
                      className="text-white text-center w-full bg-gray-700 bg-opacity-50 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      value={phoneotp}
                      onChange={(e) => {
                        setErrText("");
                        setPhoneotp(e.target.value);
                      }}
                    />
                    {errText && (
                      <div className="text-center text-red-500">{errText}</div>
                    )}

                    <button
                      type="button"
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 px-4 w-full font-medium my-2"
                      onClick={handleOtpSubmit}
                      disabled={isVerifyingOTP}
                    >
                      {isVerifyingOTP ? (
                        <div className="animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-white"></div>
                      ) : (
                        "Submit OTP"
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mt-2">
                  {isGoogleSigninEnabled && (
                    <>
                      <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 w-14 mr-2"
                        onClick={signInWithGoogle}
                        disabled={!isGoogleSigninEnabled}
                      >
                        <Google className="text-white" />
                      </button>
                      {/* <span className="text-white">Sign in with Google</span> */}
                    </>
                  )}
                  {/* {isFacebookSigninEnabled && (
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 w-10 mr-2"
                  onClick={signInWithFacebook}
                  disabled={!isFacebookSigninEnabled}
                >
                  <FontAwesomeIcon icon={faFacebook} />
                </button>
              )} */}
                </div>
              </>
            )}
          </form>
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;

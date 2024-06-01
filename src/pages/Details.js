import React, { useEffect, useState } from "react";
import {
  RecaptchaVerifier,
  updateProfile,
  onAuthStateChanged,
  updateEmail,
  linkWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { countries } from "../config/countries";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const Details = () => {
  const navigate = useNavigate();
  const [phoneotp, setPhoneotp] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("91");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const photoURLPlaceholder =
    "https://firebasestorage.googleapis.com/v0/b/kodisastram.appspot.com/o/profil-pic_dummy.png?alt=media&token=f754f6de-3574-426e-a959-dab4dd32ff77";

  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const validateUser = (user) => {
    if (user.uid && user.phoneNumber && user.username && user.photoURL) {
      return true;
    } else return false;
  };

  // Async Utils

  const saveUserToDB = async (user) => {
    await setDoc(doc(db, "users", user.uid), user)
      .then(async () => {
        await setDoc(doc(db, "userChats", user.uid), {})
          .then((res) => {
            navigate("/");
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
        navigate("/");
      });
  };

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container-details",
      {
        size: "invisible",
        callback: (response) => {},
      }
    );
  };

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const handlePhoneSubmit = async (e) => {
    setIsSendingOTP(true);
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    const phoneNumberWithCountryCode = `+${selectedCountry}${phoneNumber}`;
    await linkWithPhoneNumber(
      auth.currentUser,
      phoneNumberWithCountryCode,
      appVerifier
    )
      .then(async (confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setIsSendingOTP(false);
        setShowOtpField(true);
      })
      .catch((error) => {
        console.log(error);
        appVerifier.clear();
      })
      .catch((e) => {
        console.log(e);
        setIsSendingOTP(false);
      });
  };

  const handleOtpSubmit = async (e) => {
    setIsVerifyingOTP(true);
    await window.confirmationResult
      .confirm(phoneotp)
      .then(async (result) => {
        await updateProfile(auth.currentUser, {
          phoneNumber,
          photoURL: auth.currentUser.photoURL || photoURLPlaceholder,
        }).then(async (res) => {
          const updatedUser = {
            username: auth.currentUser.displayName,
            email: auth.currentUser.email || "",
            phoneNumber: auth.currentUser.phoneNumber,
            photoURL: auth.currentUser.photoURL || photoURLPlaceholder,
            uid: auth.currentUser.uid,
          };
          if (validateUser(updatedUser)) {
            try {
              await saveUserToDB(updatedUser);
              setIsVerifyingOTP(false);
            } catch (e) {
              setIsVerifyingOTP(false);
              console.log(e);
            }
          }
          setIsVerifyingOTP(false);
          navigate("/");
        });
      })
      .catch((error) => {
        setIsVerifyingOTP(false);
        console.log(error);
        alert("Incorrect OTP");
      });
  };

  const updateUserEmailAndUsername = async () => {
    if (!auth.currentUser.displayName) {
      await updateProfile(auth.currentUser, {
        // setting user name to small case
        displayName: username.toLowerCase(),
        photoURL: auth.currentUser.photoURL || photoURLPlaceholder,
      }).catch((e) => console.log("err", e));
    }
    if (!auth.currentUser.email && email !== "") {
      await updateEmail(auth.currentUser, email).catch((e) =>
        console.log("err", e)
      );
    }
  };

  const handleSubmit = async (e) => {
    setIsUpdating(true);
    await updateUserEmailAndUsername()
      .then(async (res) => {
        const updatedUser = {
          username: auth.currentUser.displayName,
          email: auth.currentUser.email || "",
          phoneNumber: auth.currentUser.phoneNumber,
          photoURL: auth.currentUser.photoURL,
          uid: auth.currentUser.uid,
        };
        if (validateUser(updatedUser)) {
          try {
            await saveUserToDB(updatedUser);
          } catch (e) {
            console.log(e);
          }
        }
        setIsUpdating(false);
        navigate("/");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("user logged in is", user);
      } else {
        // console.log("user is logged out");
        navigate("/login");
      }
    });
  }, []);

  return (
    <div className="relative font-primary">
      <div
        className={`flex items-center justify-center h-screen bg-black fixed inset-0 bg-black transition-opacity
         
        }`}
      >
        <div className="bg-gray-800 bg-opacity-70 rounded shadow-lg p-8 w-80">
          <h1 className="text-center text-2xl font-bold text-white mb-4">
            🐓 Kodi Sastram 🐓
          </h1>
          {!auth.currentUser?.phoneNumber && (
            <>
              <h1 className="text-center text-xl font-bold text-white mb-4">
                Verify Phone Number
              </h1>
              <form>
                {/* <div className="flex mb-4"> */}
                <div className="relative inline-flex w-full mr-1 my-2">
                  <select
                    className="text-white appearance-none w-full bg-gray-700 bg-opacity-50 border border-gray-300 rounded-md py-2 pl-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    disabled={showOtpField}
                  >
                    {/* <option value="" className="text-center">
                  Select Country Code
                </option> */}
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
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={showOtpField}
                />
                {/* </div> */}
                {!showOtpField && (
                  <button
                    type="button"
                    className="text-center bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 px-4 w-full font-medium my-2"
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
                      className="text-center text-white w-full bg-gray-700 bg-opacity-50 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      value={phoneotp}
                      onChange={(e) => setPhoneotp(e.target.value)}
                    />

                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 px-4 w-full font-medium mt-2"
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
              </form>
            </>
          )}
          {(!auth.currentUser?.displayName || !auth.currentUser?.email) && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Enter your Display Name
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  className="text-center w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="text-centerblock text-gray-300 font-medium mb-2"
                >
                  Email Id (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  className="text-center w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 px-4 w-full font-medium mt-2"
                onClick={handleSubmit}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <div className="animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-white"></div>
                ) : (
                  "Submit"
                )}
              </button>
            </>
          )}

          {auth.currentUser?.phoneNumber &&
            auth.currentUser?.displayName &&
            auth.currentUser?.email && (
              <div
                className="text-white text-center cursor-pointer text-blue underline"
                onClick={() => {
                  navigate("/");
                }}
              >
                Go to chat screen
              </div>
            )}
        </div>
      </div>
      <div id="recaptcha-container-details"></div>
    </div>
  );
};

export default Details;

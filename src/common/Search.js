import React, { useState } from "react";
import { collection, query, where, getDocs, setDoc, doc, updateDoc, getDoc, limit } from "firebase/firestore";
import { auth, db } from "../firebase";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useNavigate } from "react-router-dom";
import imageError from "../assets/icons/image-error.png";

const Search = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [err, setErr] = useState(false);

  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (username) => {
    const q = query(
      collection(db, "users"),
      where("username", ">=", username),
      where("username", "<=", username + "\uf8ff"),
      where("username", "!=", auth.currentUser.displayName),
      limit(10)
    );
    // console.log(username);
    try {
      await getDocs(q).then((querySnapshot) => {
        const results = querySnapshot.docs.map((doc) => doc.data());
        // console.log(results);
        setSearchResults(results);
        setErr(false);
      });
    } catch (err) {
      setErr(true);
    }
  };

  const createChatAndUpdateUserChats = async (combinedId, user) => {
    await setDoc(doc(db, "chats", combinedId), { messages: [] }).then(async () => {
      const createdDate = new Date();

      await updateDoc(doc(db, "userChats", auth.currentUser.uid), {
        [combinedId + ".userInfo"]: {
          uid: user.uid,
          displayName: user.username,
          photoURL: user.photoURL,
        },
        [combinedId + ".date"]: createdDate,
      }).then(() => console.log("first"));

      await updateDoc(doc(db, "userChats", user.uid), {
        [combinedId + ".userInfo"]: {
          uid: auth.currentUser.uid,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
        },
        [combinedId + ".date"]: createdDate,
      }).then(() => console.log("second"));
    });
  };

  const handleSelect = async (user) => {
    const combinedId =
      auth.currentUser.uid > user.uid ? auth.currentUser.uid + user.uid : user.uid + auth.currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await createChatAndUpdateUserChats(combinedId, user).then((res) => {
          setUsername("");
          navigate(`/chat/userChat/${combinedId}`, {
            state: {
              avatar: user.photoURL,
              title: user.username,
              userId: user.uid,
            },
          });
        });
      } else {
        navigate(`/chat/userChat/${combinedId}`, {
          state: {
            avatar: user.photoURL,
            title: user.username,
            userId: user.uid,
          },
        });
      }
    } catch (err) {}
  };
  const handleSearchInputChange = async (e) => {
    setUsername(e.target.value.toString().toLowerCase());
    if (e.target.value.trim() !== "") await handleSearch(e.target.value.toString().toLowerCase());
  };

  const handleClearSearch = () => {
    setUsername("");
    setSearchResults([]);
  };

  return (
    <div className="relative flex-1">
      <div className="bg-[#161616] relative flex-1 flex items-center rounded-full pl-2">
        <SearchRoundedIcon className="text-xl text-[#D0E6FF]" />
        <input
          type="text"
          placeholder="Find a user"
          value={username}
          onChange={handleSearchInputChange}
          className="bg-[#161616] placeholder-[#D0E6FF] py-2 pl-2 text-white rounded-full focus:outline-none w-full"
          onFocus={() => setSearchResults(username ? searchResults : [])}
        />
        {username.trim() !== "" && (
          <button className="flex items-center justify-center px-3" onClick={handleClearSearch}>
            <CloseRoundedIcon className="text-xl text-[#D0E6FF]" />
          </button>
        )}
      </div>

      {err && <span>User not found!</span>}
      <div
        className="absolute top-12 bg-[#1A1D1F] rounded-md shadow-md z-10 -ml-4 h-screen w-screen"
        hidden={!username}
      >
        {searchResults.map((user) => (
          <div
            key={user.uid}
            className="cursor-pointer text-white flex w-screen justify-between py-4 px-14 border-b border[#1F1F1F]"
            onClick={() => handleSelect(user)}
          >
            <p>{user.username}</p>
            <img
              src={user.photoURL}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.src = imageError;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;

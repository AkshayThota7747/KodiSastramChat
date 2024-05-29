import React from "react";
import serverDown from "../assets/icons/incubate-dribbble.gif";

function ServerDownPage() {
  return (
    <div
      className="text-lg text-white text-center h-screen flex flex-col justify-center align-center px-6 overflow-auto"
      style={{ background: "linear-gradient(to right, #3f0d34, #3f0d34)" }}
    >
      <img
        src={serverDown}
        alt="serverDown"
        className="object-contain h-[60%]"
      />
      {/* <div className="overflow-auto h-[20%] px-6"></div> */}
      <p>
        అనివార్య కారణాల వాళ్ళ యాప్ లో చాట్ అనేది నిలిపివేయబడింది 🙏🏻 , మీకు మరింత
        దగ్గరగా ఉండటం కొరకు సరికొత్త హంగులతో మీ ముందుకి రాడానికి సిద్ధం
        చేస్తున్నం. అంతవరకు కూడా యాప్ చాట్ లో అంతరాయం కలిగిస్తునందుకు
        చింతిస్తునాము. మీకు కోడ్ల ఆరోగ్య, రంగు, సేల్స్ మరియు తయారీ పరంగా ఎటువంటి
        సమస్యలు ఉన్న ఈ వాట్సాప్ నెంబర్ 💬 9440868077 కి మెసేజ్ చేయగలరు ఇది
        పూర్తిగా ఉచితము, మేము రంగులు చెప్పినందుకుగాను సాయం చేసినందుకుగాను
        ఎటువంటి ఋణము తీసుకోము.
      </p>{" "}
      <br></br>
      <p className="bold underline">Ph: +91 9440868077</p> <br></br>
    </div>
  );
}

export default ServerDownPage;

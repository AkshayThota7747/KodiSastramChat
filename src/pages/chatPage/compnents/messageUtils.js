export const setMessageObject = (doc, messageData) => {
  if (messageData.messageType === "text") {
    return {
      id: doc.id,
      from: messageData.from.id,
      title: messageData.fromUsername,
      type: messageData.messageType,
      text: messageData.message,
      dateString: messageData.createdAt.toDate().toISOString(),
    };
  } else if (messageData.messageType === "photo") {
    return {
      id: doc.id,
      from: messageData.from.id,
      title: messageData.fromUsername,
      type: messageData.messageType,
      data: {
        uri: messageData.url,
        height: 180,
        width: 180,
      },
      dateString: messageData.createdAt.toDate().toISOString(),
    };
  } else if (messageData.messageType === "video") {
    return {
      id: doc.id,
      from: messageData.from.id,
      title: messageData.fromUsername,
      type: messageData.messageType,
      data: {
        uri: "https://firebasestorage.googleapis.com/v0/b/kodisastram.appspot.com/o/images%2Fvideo-placeholder.jpg?alt=media&token=7ebc15dd-edd5-458d-8849-a05b28527861",
        height: 120,
        width: 200,
      },
      videoData: {
        videoURL: messageData.url,
        status: {
          click: true,
          loading: 0.5,
          download: true,
        },
        height: 120,
        width: 200,
      },
      dateString: messageData.createdAt.toDate().toISOString(),
    };
  } else if (messageData.messageType === "audio") {
    return {
      id: doc.id,
      from: messageData.from.id,
      title: messageData.fromUsername,
      type: messageData.messageType,
      data: {
        audioURL: messageData.url,
      },
      dateString: messageData.createdAt.toDate().toISOString(),
    };
  } else if (messageData.messageType === "file") {
    return {
      id: doc.id,
      from: messageData.from.id,
      title: messageData.fromUsername,
      type: messageData.messageType,
      data: {
        uri: messageData.url,
        status: {
          click: false,
          loading: 0,
        },
      },
      text: messageData.filename,
      dateString: messageData.createdAt.toDate().toISOString(),
    };
  }
};

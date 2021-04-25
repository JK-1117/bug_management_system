import { AsyncStorage } from "react-native";
import * as firebase from "firebase";
import User from "../../models/User";
import * as TeamActions from "./teamActions";

// export const SIGNUP = "SIGNUP";
// export const LOGIN = "LOGIN";
export const AUTHENTICATE = "AUTHENTICATE";
export const LOGOUT = "LOGOUT";
export const RESET_PASSWORD = "RESET_PASSWORD";
export const FETCH_PROFILE = "FETCH_PROFILE";
export const SET_USERS = "SET_USERS";
export const UPDATE_TEAMID = "UPDATE_TEAMID";
export const UPDATE_EXPOTOKEN = "UPDATE_EXPOTOKEN";
// export const UPDATE_PROFILE = "UPDATE_PROFILE";

let timer;

// export const authenticate = (userId, token) => {
export const authenticate = (userId, token, expiryTime) => {
  return async dispatch => {
    await dispatch({ type: AUTHENTICATE, userId: userId, token: token });
    await dispatch(setLogoutTimer(expiryTime));
    await dispatch(fetchProfile(userId, token));
    await dispatch(fetchUserList());
  };
};

export const signup = (email, password, username) => {
  try {
    return async dispatch => {
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCZhL1HHy5yroIIpZYIMRxwMbCy2e2tzpQ",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("signup");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "EMAIL_EXISTS") {
          message = "The email address is already in use by another account.";
        } else if (errorId === "TOO_MANY_ATTEMPTS_TRY_LATER") {
          message =
            "We have blocked all requests from this device due to unusual activity. Try again later.";
        }
        throw new Error(message);
      }

      firebase.auth().signInWithEmailAndPassword(email, password);
      const resData = await response.json();
      const teamId = await dispatch(
        TeamActions.createTeam(resData.localId, resData.idToken)
      );
      dispatch(
        createProfile(resData.localId, resData.idToken, email, username, teamId)
      );
      dispatch(
        authenticate(
          resData.localId,
          resData.idToken,
          parseInt(resData.expiresIn) * 1000
        )
      );
      const expirationDate = new Date(
        new Date().getTime() + parseInt(resData.expiresIn) * 1000
      );
      saveDataToStorage(resData.idToken, resData.localId, expirationDate);
      // saveDataToStorage(email, password);
    };
  } catch (err) {
    throw err;
  }
};

export const login = (email, password) => {
  try {
    return async dispatch => {
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCZhL1HHy5yroIIpZYIMRxwMbCy2e2tzpQ",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("login");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "EMAIL_NOT_FOUND") {
          message = "This email could not be found!";
        } else if (errorId === "INVALID_EMAIL") {
          message = "Please enter a valid email.";
        } else if (errorId === "INVALID_PASSWORD") {
          message = "This password is not valid.";
        }
        throw new Error(message);
      }

      firebase.auth().signInWithEmailAndPassword(email, password);
      const resData = await response.json();
      dispatch(
        authenticate(
          resData.localId,
          resData.idToken,
          parseInt(resData.expiresIn) * 1000
        )
      );
      const expirationDate = new Date(
        new Date().getTime() + parseInt(resData.expiresIn) * 1000
      );
      // saveDataToStorage(email, password);
      saveDataToStorage(resData.idToken, resData.localId, expirationDate);
    };
  } catch (err) {
    throw err;
  }
};

export const resetPassword = email => {
  try {
    return async dispatch => {
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyCZhL1HHy5yroIIpZYIMRxwMbCy2e2tzpQ",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            requestType: "PASSWORD_RESET",
            email: email
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("resetPassword");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "EMAIL_NOT_FOUND") {
          message = "This email could not be found! Please create a account.";
        }
        throw new Error(message);
      }

      const resData = await response.json();
      dispatch({ type: RESET_PASSWORD, email: resData.email });
    };
  } catch (err) {
    throw err;
  }
};

export const fetchUserList = () => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/profiles.json?auth=${token}`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("fetchUserList");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "INVALID_ID_TOKEN") {
          message = "Session expired. Please logout and login again.";
        } else if (errorId === "USER_NOT_FOUND") {
          message = "User not found. Please login again or try again later.";
        }
        throw new Error(message);
      }

      const resData = await response.json();
      const loadedUsers = [];

      for (const key in resData) {
        loadedUsers.push(
          new User(
            key,
            resData[key].email,
            resData[key].displayName,
            resData[key].photoUrl,
            resData[key].teamId,
            resData[key].expoToken
          )
        );
      }

      dispatch({
        type: SET_USERS,
        userList: loadedUsers
      });
    };
  } catch (err) {
    throw err;
  }
};

export const createProfile = (userId, token, email, username, teamId) => {
  try {
    return async (dispatch, getState) => {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/profiles/${userId}.json?auth=${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            displayName: username,
            photoUrl: "",
            teamId: teamId
          })
        }
      );

      if (!response.ok) {
        throw new Error("Something went wrong...");
      }

      const resData = await response.json();
    };
  } catch (err) {
    throw err;
  }
};

export const fetchProfile = (userId, token) => {
  try {
    return async dispatch => {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/profiles/${userId}.json?auth=${token}`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("fetchProfile");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "INVALID_ID_TOKEN") {
          message = "Session expired. Please logout and login again.";
        } else if (errorId === "USER_NOT_FOUND") {
          message = "User not found. Please login again or try again later.";
        }
        throw new Error(message);
      }

      const resData = await response.json();
      const userProfile = new User(
        userId,
        resData.email,
        resData.displayName,
        resData.photoUrl,
        resData.teamId,
        resData.expoToken
      );
      dispatch({
        type: FETCH_PROFILE,
        user: userProfile
      });
    };
  } catch (err) {
    throw err;
  }
};

export const updateDisplayName = (userId, token, username) => {
  try {
    return async dispatch => {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/profiles/${userId}.json?auth=${token}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            displayName: username
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("updateDisplayName");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "INVALID_ID_TOKEN") {
          message = "Session expired. Please logout and login again.";
        }
        throw new Error(message);
      }

      const resData = await response.json();
      dispatch(fetchProfile(userId, token));
    };
  } catch (err) {
    throw err;
  }
};

export const updatePhoto = (userId, token, photoUrl) => {
  try {
    return async dispatch => {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/profiles/${userId}.json?auth=${token}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            photoUrl: photoUrl
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("updatePhoto");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "INVALID_ID_TOKEN") {
          message = "Session expired. Please logout and login again.";
        }
        throw new Error(message);
      }

      const resData = await response.json();
      dispatch(fetchProfile(userId, token));
    };
  } catch (err) {
    throw err;
  }
};

export const updateTeamId = (userId, teamId) => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/profiles/${userId}.json?auth=${token}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            teamId: teamId
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("updateTeamId");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "INVALID_ID_TOKEN") {
          message = "Session expired. Please logout and login again.";
        }
        throw new Error(message);
      }

      const resData = await response.json();
      dispatch({ type: UPDATE_TEAMID, teamId: teamId });
    };
  } catch (err) {
    throw err;
  }
};

export const updateExpoToken = expoToken => {
  try {
    return async (dispatch, getState) => {
      const userId = getState().authReducer.userId;
      const token = getState().authReducer.token;

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/profiles/${userId}.json?auth=${token}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            expoToken: expoToken
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("updateExpoToken");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "INVALID_ID_TOKEN") {
          message = "Session expired. Please logout and login again.";
        }
        throw new Error(message);
      }

      const resData = await response.json();
      dispatch(fetchProfile(userId, token));
    };
  } catch (err) {
    throw err;
  }
};

export const getUserByEmail = email => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/profiles.json?auth=${token}&orderBy=\"email\"&equalTo=\"${email}\"`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("getUserByEmail");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "INVALID_ID_TOKEN") {
          message = "Session expired. Please logout and login again.";
        }
        throw new Error(message);
      }

      const resData = await response.json();
      let userId = "";
      for (const key in resData) {
        userId = key;
      }
      return userId;
    };
  } catch (err) {
    throw err;
  }
};

export const getUserById = userId => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/profiles/${userId}.json?auth=${token}`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("getUserbyId");
        console.log(errorResData);

        let message = "Something went wrong! Please try again later.";
        if (errorId === "INVALID_ID_TOKEN") {
          message = "Session expired. Please logout and login again.";
        }
        throw new Error(message);
      }

      const resData = await response.json();
      return new User(
        userId,
        resData.email,
        resData.displayName,
        resData.photoUrl,
        resData.teamId,
        resData.expoToken
      );
    };
  } catch (err) {
    throw err;
  }
};

export const logout = () => {
  clearLogoutTimer();
  AsyncStorage.removeItem("userData");
  return { type: LOGOUT };
};

const clearLogoutTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
};

const setLogoutTimer = expirationTime => {
  return dispatch => {
    timer = setTimeout(() => {
      dispatch(logout());
    }, expirationTime);
  };
};

const saveDataToStorage = (token, userId, expirationDate) => {
  AsyncStorage.setItem(
    "userData",
    JSON.stringify({
      token: token,
      userId: userId,
      expiryDate: expirationDate.toISOString()
    })
  );
};

// const saveDataToStorage = (email, password) => {
//   AsyncStorage.setItem(
//     "userData",
//     JSON.stringify({
//       email: email,
//       password: password
//     })
//   );
// };

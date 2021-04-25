import User from "../../models/User";

import {
  AUTHENTICATE,
  LOGOUT,
  FETCH_PROFILE,
  RESET_PASSWORD,
  SET_USERS,
  UPDATE_TEAMID
} from "../actions/authActions";

const initialState = {
  token: null,
  userId: null,
  user: new User(),
  userList: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case AUTHENTICATE:
      return {
        ...state,
        token: action.token,
        userId: action.userId
      };
    case RESET_PASSWORD:
      return state;
    // case SIGNUP:
    //   return {
    //     token: action.token,
    //     userId: action.userId
    //   };
    // case UPDATE_PROFILE:
    //     return {
    //         ...state,
    //       username: action.displayName
    //     };
    case SET_USERS:
      return {
        ...state,
        userList: action.userList
      };
    case FETCH_PROFILE:
      return {
        ...state,
        user: action.user
      };
    case UPDATE_TEAMID:
      const currProfile = state.user;
      const user = new User(
        currProfile.userId,
        currProfile.email,
        currProfile.displayName,
        currProfile.photoUrl,
        action.teamId,
        currProfile.expoToken
      );
      return {
        ...state,
        user: user
      };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
};

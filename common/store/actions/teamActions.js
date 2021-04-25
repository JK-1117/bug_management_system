import Invitation from "../../models/Invitation";

import * as AuthActions from "./authActions";
import * as FeedsActions from "./feedsActions";

export const CREATE_TEAM = "CREATE_TEAM";
export const SET_TEAM = "SET_TEAM";
export const DELETE_TEAM = "DELETE_TEAM";
export const SET_INVITATION = "SET_INVITATION";
export const DELETE_INVITATION = "DELETE_INVITATION";
export const ADD_USER = "ADD_USER";
export const EDIT_ROLE = "EDIT_ROLE";

export const createTeam = (userId, token) => {
  return async dispatch => {
    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/teams.json?auth=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify([
            {
              userId: userId,
              role: "admin"
            }
          ])
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("createTeam");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();
      dispatch({
        type: CREATE_TEAM,
        teamUser: [{ userId: userId, role: "admin" }]
      });
      return resData.name;
    } catch (err) {
      throw err;
    }
  };
};

export const fetchTeam = () => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const teamId = getState().authReducer.user.teamId;
    const userId = getState().authReducer.user.userId;

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/teams/${teamId}.json?auth=${token}`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("fetchTeam");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();
      const teamUser = resData ? resData : [];
      const role =
        teamUser.filter(item => item.userId === userId).length > 0
          ? teamUser.filter(item => item.userId === userId)[0].role
          : "";
      dispatch({
        type: SET_TEAM,
        role: role,
        teamUser: resData
      });
      return resData;
    } catch (err) {
      throw err;
    }
  };
};

export const createInvitation = (userId, role) => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;
      const username = getState().authReducer.user.displayName;
      const teamId = getState().authReducer.user.teamId;
      const userList = getState().authReducer.userList;
      const expoToken = userList.filter(item => item.userId == userId)[0].expoToken

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/invitation/${userId}.json?auth=${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: username,
            role: role.toLowerCase(),
            teamId: teamId
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("createInvitation");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();
      const message = `You are invited by ${username} to the team`
      dispatch(FeedsActions.notifyUser(expoToken, message))
    };
  } catch (err) {
    throw err;
  }
};

export const fetchInvitation = () => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;
      const userId = getState().authReducer.user.userId;

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/invitation/${userId}.json?auth=${token}`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("fetchInvitation");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();
      const invitation = resData
        ? new Invitation(resData.username, resData.role, resData.teamId)
        : null;
      dispatch({ type: SET_INVITATION, invitation: invitation });
    };
  } catch (err) {
    throw err;
  }
};

export const deleteInvitation = () => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;
      const userId = getState().authReducer.user.userId;

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/invitation/${userId}.json?auth=${token}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("deleteInvitation");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();
      dispatch({ type: DELETE_INVITATION });
    };
  } catch (err) {
    throw err;
  }
};

export const deleteTeam = userId => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;
      const teamId = getState().authReducer.user.teamId;
      const username = getState().authReducer.user.username;
      const teamUser = getState().teamReducer.teamUser;
      const newTeam = teamUser.filter(item => item.userId !== userId);
      if (newTeam.length === 1) {
        newTeam[0].role = "admin";
      }

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/teams/${teamId}.json?auth=${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newTeam)
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("deleteTeam");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();
      const message = `${username} have left the team`
      dispatch(FeedsActions.notifyTeam(message))
      dispatch({
        type: DELETE_TEAM
      });
    };
  } catch (err) {
    throw err;
  }
};

export const addTeam = (teamId, role) => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;
      const userId = getState().authReducer.user.userId;

      await dispatch(deleteTeam(userId));
      await dispatch(AuthActions.updateTeamId(userId, teamId));
      let teamUser = await dispatch(fetchTeam());
      teamUser = teamUser.concat({
        userId: userId,
        role: role
      });

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/teams/${teamId}.json?auth=${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(teamUser)
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("addTeam");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();
      dispatch(deleteInvitation());
      dispatch({
        type: SET_TEAM,
        role: role,
        teamUser: resData
      });
    };
  } catch (err) {
    throw err;
  }
};

export const updateExpoToken = expoToken => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;
      const userId = getState().authReducer.user.userId;
      const teamId = getState().authReducer.user.teamId;
      let teamUser = getState().teamReducer.teamUser;

      const userIndex = teamUser.findIndex(user => user.userId === userId);
      teamUser[userIndex] = { ...teamUser[userIndex], expoToken: expoToken };

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/teams/${teamId}.json?auth=${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(teamUser)
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("addTeam");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();
      dispatch({
        type: SET_TEAM,
        role: teamUser[userIndex].role,
        teamUser: resData
      });
    };
  } catch (err) {
    throw err;
  }
};

export const removeFromTeam = userId => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;

      await dispatch(deleteTeam(userId));
      const teamId = await dispatch(createTeam(userId, token));
      return teamId;
    };
  } catch (err) {
    throw err;
  }
};

export const editRole = (userId, role) => {
  try {
    return async (dispatch, getState) => {
      const token = getState().authReducer.token;
      const teamUser = getState().teamReducer.teamUser;
      const currUserId = getState().authReducer.user.userId;
      const teamId = getState().authReducer.user.teamId;
      const userIndex = teamUser.findIndex(user => user.userId === userId);
      teamUser[userIndex].role = role;
      const userList = getState().authReducer.userList;
      const expoToken = userList.filter(item => item.userId == userId)[0].expoToken

      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/teams/${teamId}.json?auth=${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(teamUser)
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("editRole");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();
      const message = `Your role has changed to ${role}`
      dispatch(FeedsActions.notifyUser(expoToken, message))
      dispatch({
        type: EDIT_ROLE,
        userId: currUserId,
        teamUser: resData
      });
    };
  } catch (err) {
    throw err;
  }
};

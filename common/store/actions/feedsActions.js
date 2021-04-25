import Feed from "../../models/Feed";

export const SET_FEEDS = "SET_FEEDS";
export const CREATE_FEED = "CREATE_FEED";

export const OBJECTIVE_PROJECT = "OBJECTIVE_PROJECT";
export const OBJECTIVE_REQUIREMENT = "OBJECTIVE_REQUIREMENT";
export const OBJECTIVE_TESTCASE = "OBJECTIVE_TESTCASE";
export const OBJECTIVE_BUG = "OBJECTIVE_BUG";
export const OBJECTIVE_USER = "OBJECTIVE_USER";
export const OBJECTIVE_DELETED = "OBJECTIVE_DELETED";

export const CREATED_A_PROJECT = "created a Project";
export const DELETED_A_PROJECT = "DELETED a Project";
export const UPDATED_A_PROJECT = "updated a Project";

export const REPORTED_A_BUG = "reported a Bug";
export const UPDATED_A_BUG = "updated a Bug";
export const DELETED_A_BUG = "DELETED a Bug";

export const CREATED_A_REQUIREMENT = "created a Requirement";
export const UPDATED_A_REQUIREMENT = "updated a Requirement";
export const DELETED_A_REQUIREMENT = "DELETED a Requirement";

export const CREATED_A_TESTCASE = "created a Test Case";
export const UPDATED_A_TESTCASE = "updated a Test Case";
export const DELETED_A_TESTCASE = "DELETED a Test Case";

export const fetchFeeds = () => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const teamId = getState().authReducer.user.teamId;

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/feeds/${teamId}.json?auth=${token}`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("fetchFeed");
        console.log(errorResData);

        throw new Error("Something went wrong!");
      }

      const resData = await response.json();
      const loadedFeeds = [];

      for (const key in resData) {
        loadedFeeds.push(
          new Feed(
            key,
            resData[key].user,
            resData[key].time,
            resData[key].action,
            resData[key].objective,
            resData[key].objectiveKey,
            resData[key].objectiveId,
            resData[key].objectiveTitle,
            resData[key].severity,
            resData[key].projectKey,
            resData[key].projectId,
            resData[key].projectName
          )
        );
      }

      dispatch({
        type: SET_FEEDS,
        feeds: loadedFeeds
      });
    } catch (err) {
      throw err;
    }
  };
};

export const createFeed = (
  user,
  time,
  action,
  objective,
  objectiveKey,
  objectiveId,
  objectiveTitle,
  severity,
  projectKey,
  projectId,
  projectName
) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const teamId = getState().authReducer.user.teamId;

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/feeds/${teamId}.json?auth=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user: user,
            time: time,
            action: action,
            objective: objective,
            objectiveKey: objectiveKey,
            objectiveId: objectiveId,
            objectiveTitle: objectiveTitle,
            severity: severity,
            projectKey: projectKey,
            projectId: projectId,
            projectName: projectName
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("createFeed");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();

      const message = user + " " + action + " '" + objectiveTitle + "'";
      dispatch(notifyTeam(message));

      dispatch({
        type: CREATE_FEED,
        feedData: {
          id: resData.name,
          user: user,
          time: time,
          action: action,
          objective: objective,
          objectiveKey: objectiveKey,
          objectiveId: objectiveId,
          objectiveTitle: objectiveTitle,
          severity: severity,
          projectKey: projectKey,
          projectId: projectId,
          projectName: projectName
        }
      });
    } catch (err) {
      throw err;
    }
  };
};

export const notifyTeam = message => {
  return async (dispatch, getState) => {
    const teamUser = getState().teamReducer.teamUser;
    let userTokens = [];

    teamUser.forEach((item, index, array) => {
      if (item.expoToken && !userTokens.includes(item.expoToken)) {
        userTokens.push(item.expoToken);
      }
    });

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: userTokens,
          title: "Dragonfly Bug Management System",
          sound: "default",
          body: message
        })
      });
    } catch (err) {
      console.log("notifyTeam");
      throw err;
    }
  };
};

export const notifyUser = (expoToken, message) => {
  return async (dispatch, getState) => {
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: expoToken,
          title: "Dragonfly Bug Management System",
          sound: "default",
          body: message
        })
      });
    } catch (err) {
      console.log("notifyTeam");
      throw err;
    }
  };
};

import * as firebase from "firebase";

import Bug from "../../models/Bug";
import * as Util from "../../utils/Util";
import * as FeedsActions from "./feedsActions";

export const CREATE_BUG = "CREATE_BUG";
export const UPDATE_BUG = "UPDATE_BUG";
export const DELETE_BUG = "DELETE_BUG";
export const SET_BUG = "SET_BUG";

export const fetchBugs = () => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/bugs.json?auth=${token}`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("fetchBugs");
        console.log(errorResData);

        throw new Error("Something went wrong!");
      }

      const resData = await response.json();
      const loadedBugs = [];
      let loadedProjectBugs = {};

      for (const key in resData) {
        const subBugsList = [];
        for (const bugKey in resData[key]) {
          const project = resData[key];
          const newBug = new Bug(
            bugKey,
            project[bugKey].bugId,
            project[bugKey].bugTitle,
            project[bugKey].projectKey,
            project[bugKey].testcaseKey,
            project[bugKey].reportBy,
            new Date(project[bugKey].reportTime),
            project[bugKey].status,
            project[bugKey].bugDescription,
            project[bugKey].buildInfo,
            project[bugKey].environment,
            project[bugKey].severity,
            new Date(project[bugKey].dueDate),
            project[bugKey].priority,
            project[bugKey].assignedTo,
            project[bugKey].tester,
            project[bugKey].stepToReproduce,
            project[bugKey].attemptToRepeat,
            project[bugKey].attachments ? project[bugKey].attachments : []
          );
          subBugsList.push(newBug);
          loadedBugs.push(newBug);
        }
        loadedProjectBugs = {
          ...loadedProjectBugs,
          [key]: subBugsList
        };
      }

      dispatch({
        type: SET_BUG,
        bugs: loadedBugs,
        projectBugs: loadedProjectBugs
      });
    } catch (err) {
      throw err;
    }
  };
};

export const createBug = (
  bugTitle,
  projectKey,
  projectId,
  projectName,
  testcaseKey,
  reportTime,
  status,
  bugDescription,
  buildInfo,
  environment,
  severity,
  dueDate,
  priority,
  assignedTo,
  tester,
  stepToReproduce,
  attemptToRepeat,
  attachments
) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const userId = getState().authReducer.userId;
    const username = getState().authReducer.user.displayName;
    const email = getState().authReducer.user.email;
    const projectBugs = getState().bugsReducer.projectBugs;
    const bugId = Util.getBugId(projectId, projectKey, projectBugs);

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/bugs/${projectKey}.json?auth=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            bugId: bugId,
            bugTitle: bugTitle,
            projectKey: projectKey,
            testcaseKey: testcaseKey,
            reportBy: {
              userId: userId,
              username: username ? username : email
            },
            reportTime: reportTime,
            status: status,
            bugDescription: bugDescription,
            buildInfo: buildInfo,
            environment: environment,
            severity: severity,
            dueDate: dueDate,
            priority: priority,
            assignedTo: assignedTo,
            tester: tester,
            stepToReproduce: stepToReproduce,
            attemptToRepeat: attemptToRepeat,
            attachments: attachments
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("createBug");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();

      await dispatch(
        FeedsActions.createFeed(
          username ? username : email,
          new Date().getTime(),
          FeedsActions.REPORTED_A_BUG,
          FeedsActions.OBJECTIVE_BUG,
          resData.name,
          bugId,
          bugTitle,
          severity,
          projectKey,
          projectId,
          projectName,
        )
      );

      dispatch({
        type: CREATE_BUG,
        projectKey: projectKey,
        bugData: {
          bugKey: resData.name,
          bugId: bugId,
          bugTitle: bugTitle,
          projectKey: projectKey,
          testcaseKey: testcaseKey,
          reportBy: { userId: userId, username: username ? username : email },
          reportTime: reportTime,
          status: status,
          bugDescription: bugDescription,
          buildInfo: buildInfo,
          environment: environment,
          severity: severity,
          dueDate: dueDate,
          priority: priority,
          assignedTo: assignedTo,
          tester: tester,
          stepToReproduce: stepToReproduce,
          attemptToRepeat: attemptToRepeat,
          attachments: attachments
        }
      });
      return resData.name;
    } catch (err) {
      throw err;
    }
  };
};

export const updateBug = (
  bugKey,
  bugId,
  bugTitle,
  projectKey,
  projectId,
  projectName,
  testcaseKey,
  status,
  bugDescription,
  buildInfo,
  environment,
  severity,
  dueDate,
  priority,
  assignedTo,
  tester,
  stepToReproduce,
  attemptToRepeat,
  attachments
) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const username = getState().authReducer.user.displayName;
    const email = getState().authReducer.user.email;

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/bugs/${projectKey}/${bugKey}.json?auth=${token}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            bugTitle: bugTitle,
            testcaseKey: testcaseKey,
            status: status,
            bugDescription: bugDescription,
            buildInfo: buildInfo,
            environment: environment,
            severity: severity,
            dueDate: dueDate,
            priority: priority,
            assignedTo: assignedTo,
            tester: tester,
            stepToReproduce: stepToReproduce,
            attemptToRepeat: attemptToRepeat,
            attachments: attachments
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("updateBug");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();

      await dispatch(
        FeedsActions.createFeed(
          username ? username : email,
          new Date().getTime(),
          FeedsActions.UPDATED_A_BUG,
          FeedsActions.OBJECTIVE_BUG,
          bugKey,
          bugId,
          bugTitle,
          severity,
          projectKey,
          projectId,
          projectName,
        )
      );

      dispatch({
        type: UPDATE_BUG,
        projectKey: projectKey,
        bugData: {
          bugKey: bugKey,
          bugTitle: bugTitle,
          testcaseKey: testcaseKey,
          status: status,
          bugDescription: bugDescription,
          buildInfo: buildInfo,
          environment: environment,
          severity: severity,
          dueDate: dueDate,
          priority: priority,
          assignedTo: assignedTo,
          tester: tester,
          stepToReproduce: stepToReproduce,
          attemptToRepeat: attemptToRepeat,
          attachments: attachments
        }
      });
    } catch (err) {
      throw err;
    }
  };
};

export const deleteBug = (bugKey) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const username = getState().authReducer.user.displayName;
    const email = getState().authReducer.user.email;
    const bug = getState().bugsReducer.bugs.find(
      (item) => item.key === bugKey
    );
    const project = getState().projectsReducer.projects.find(
      (item) => item.id === bug.projectKey
    );

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/bugs/${project.id}/${bugKey}.json?auth=${token}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("deleteProject");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();

      await dispatch(
        FeedsActions.createFeed(
          username.trim().length > 0 ? username : email,
          new Date().getTime(),
          FeedsActions.DELETED_A_BUG,
          FeedsActions.OBJECTIVE_DELETED,
          bug.key,
          bug.bugId,
          bug.bugTitle,
          "CLOSED",
          project.id,
          project.projectId,
          project.projectName
        )
      );

      dispatch({
        type: DELETE_BUG,
        bugKey: bugKey,
        projectKey: project.id
      });
    } catch (err) {
      throw err;
    }
  };
};

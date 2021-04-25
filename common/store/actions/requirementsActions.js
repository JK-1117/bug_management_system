import Requirement from "../../models/Requirement";
import * as FeedsActions from "./feedsActions";
import * as Util from "../../utils/Util";

export const CREATE_REQUIREMENT = "CREATE_REQUIREMENT";
export const UPDATE_REQUIREMENT = "UPDATE_REQUIREMENT";
export const DELETE_REQUIREMENT = "DELETE_REQUIREMENT";
export const SET_REQUIREMENT = "SET_REQUIREMENT";

export const fetchRequirements = () => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const teamId = getState().authReducer.user.teamId;

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/requirements.json?auth=${token}`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("fetchRequirement");
        console.log(errorResData);

        throw new Error("Something went wrong!");
      }

      const resData = await response.json();
      const loadedRequirements = [];
      let loadedProjectRequirements = {};

      for (const key in resData) {
        const subRequirementsList = [];
        for (const requirementKey in resData[key]) {
          const project = resData[key];
          const newRequirement = new Requirement(
            requirementKey,
            project[requirementKey].requirementId,
            project[requirementKey].requirementTitle,
            project[requirementKey].requirementPriority,
            project[requirementKey].requirementDescription,
            key
          );
          subRequirementsList.push(newRequirement);
          loadedRequirements.push(newRequirement);
        }
        loadedProjectRequirements = {
          ...loadedProjectRequirements,
          [key]: subRequirementsList
        };
      }

      dispatch({
        type: SET_REQUIREMENT,
        requirements: loadedRequirements,
        projectRequirements: loadedProjectRequirements
      });
    } catch (err) {
      throw err;
    }
  };
};

export const createRequirement = (
  requirementTitle,
  requirementPriority,
  requirementDescription,
  projectKey,
  projectId,
  projectName
) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const username = getState().authReducer.user.displayName;
    const email = getState().authReducer.user.email;
    const projectRequirements = getState().requirementsReducer
      .projectRequirements;
    const requirementId = Util.getRequirementId(
      projectId,
      projectKey,
      projectRequirements
    );

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/requirements/${projectKey}.json?auth=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            requirementId: requirementId,
            requirementTitle: requirementTitle,
            requirementPriority: requirementPriority,
            requirementDescription: requirementDescription
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("createRequirement");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();

      await dispatch(
        FeedsActions.createFeed(
          username ? username : email,
          new Date().getTime(),
          FeedsActions.CREATED_A_REQUIREMENT,
          FeedsActions.OBJECTIVE_REQUIREMENT,
          resData.name,
          requirementId,
          requirementTitle,
          requirementPriority,
          projectKey,
          projectId,
          projectName
        )
      );

      dispatch({
        type: CREATE_REQUIREMENT,
        projectKey: projectKey,
        requirementData: {
          key: resData.name,
          requirementId: requirementId,
          requirementTitle: requirementTitle,
          requirementPriority: requirementPriority,
          requirementDescription: requirementDescription
        }
      });
    } catch (err) {
      throw err;
    }
  };
};

export const updateRequirement = (
  requirementKey,
  requirementId,
  requirementTitle,
  requirementPriority,
  requirementDescription,
  projectKey,
  projectId,
  projectName
) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const username = getState().authReducer.user.displayName;
    const email = getState().authReducer.user.email;

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/requirements/${projectKey}/${requirementKey}.json?auth=${token}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            requirementTitle: requirementTitle,
            requirementPriority: requirementPriority,
            requirementDescription: requirementDescription
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("updateRequirement");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();

      await dispatch(
        FeedsActions.createFeed(
          username ? username : email,
          new Date().getTime(),
          FeedsActions.UPDATED_A_REQUIREMENT,
          FeedsActions.OBJECTIVE_REQUIREMENT,
          requirementKey,
          requirementId,
          requirementTitle,
          requirementPriority,
          projectKey,
          projectId,
          projectName
        )
      );

      dispatch({
        type: UPDATE_REQUIREMENT,
        projectKey: projectKey,
        requirementData: {
          key: requirementKey,
          requirementTitle: requirementTitle,
          requirementPriority: requirementPriority,
          requirementDescription: requirementDescription
        }
      });
    } catch (err) {
      throw err;
    }
  };
};

export const deleteRequirement = (requirementKey) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const username = getState().authReducer.user.displayName;
    const email = getState().authReducer.user.email;
    const requirement = getState().requirementsReducer.requirements.find(
      (item) => item.key === requirementKey
    );
    const project = getState().projectsReducer.projects.find(
      (item) => item.id === requirement.projectKey
    );

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/requirements/${project.id}/${requirementKey}.json?auth=${token}`,
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
          FeedsActions.DELETED_A_REQUIREMENT,
          FeedsActions.OBJECTIVE_DELETED,
          requirement.key,
          requirement.requirementId,
          requirement.requirementTitle,
          "CLOSED",
          project.id,
          project.projectId,
          project.projectName
        )
      );

      dispatch({
        type: DELETE_REQUIREMENT,
        requirementKey: requirementKey,
        projectKey: project.id
      });
    } catch (err) {
      throw err;
    }
  };
};

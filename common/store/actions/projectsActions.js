import Project from "../../models/Project";
import * as FeedsActions from "./feedsActions";
import * as Util from "../../utils/Util";

export const CREATE_PROJECT = "CREATE_PROJECT";
export const UPDATE_PROJECT = "UPDATE_PRODUCT";
export const DELETE_PROJECT = "DELETE_PROJECT";
export const SET_PROJECTS = "SET_PROJECTS";

export const fetchProjects = () => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const teamId = getState().authReducer.user.teamId;

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/projects/${teamId}.json?auth=${token}`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("fetchProject");
        console.log(errorResData);

        throw new Error("Something went wrong!");
      }

      const resData = await response.json();
      const loadedProjects = [];

      for (const key in resData) {
        loadedProjects.push(
          new Project(
            key,
            resData[key].projectId,
            resData[key].projectName,
            resData[key].startDate,
            resData[key].dueDate,
            resData[key].projectDescription,
          )
        );
      }

      dispatch({
        type: SET_PROJECTS,
        projects: loadedProjects
      });
    } catch (err) {
      throw err;
    }
  };
};

export const createProject = (title, startDate, dueDate, description) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const userId = getState().authReducer.userId;
    const teamId = getState().authReducer.user.teamId;
    const username = getState().authReducer.user.displayName;
    const email = getState().authReducer.user.email;
    const projectsList = getState().projectsReducer.projects;
    const projectId = Util.getProjectId(projectsList);

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/projects/${teamId}.json?auth=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            projectId: projectId,
            projectName: title,
            startDate: startDate,
            dueDate: dueDate,
            projectDescription: description,
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("createProject");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();

      await dispatch(
        FeedsActions.createFeed(
          username.trim().length > 0 ? username : email,
          new Date().getTime(),
          FeedsActions.CREATED_A_PROJECT,
          FeedsActions.OBJECTIVE_PROJECT,
          "",
          "",
          "",
          "INFO",
          resData.name,
          projectId,
          title,
        )
      );

      dispatch({
        type: CREATE_PROJECT,
        projectData: {
          id: resData.name,
          projectId: projectId,
          projectName: title,
          startDate: startDate,
          dueDate: dueDate,
          projectDescription: description,
        }
      });
    } catch (err) {
      throw err;
    }
  };
};

export const updateProject = (id, title, startDate, dueDate, description) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const teamId = getState().authReducer.user.teamId;
    const username = getState().authReducer.user.displayName;
    const email = getState().authReducer.user.email;
    const project = getState().projectsReducer.projects.filter(
      item => item.id === id
    )[0];

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/projects/${teamId}/${id}.json?auth=${token}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            projectName: title,
            startDate: startDate,
            dueDate: dueDate,
            projectDescription: description
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("updateProject");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();

      await dispatch(
        FeedsActions.createFeed(
          username.trim().length > 0 ? username : email,
          new Date().getTime(),
          FeedsActions.UPDATED_A_PROJECT,
          FeedsActions.OBJECTIVE_PROJECT,
          "",
          "",
          "",
          "INFO",
          id,
          project.projectId,
          title,
        )
      );

      dispatch({
        type: UPDATE_PROJECT,
        id: id,
        projectData: {
          projectName: title,
          startDate: startDate,
          dueDate: dueDate,
          projectDescription: description
        }
      });
    } catch (err) {
      throw err;
    }
  };
};

export const deleteProject = id => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const username = getState().authReducer.user.displayName;
    const teamId = getState().authReducer.user.teamId;
    const email = getState().authReducer.user.email;
    const project = getState().projectsReducer.projects.filter(
      item => item.id === id
    )[0];

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/projects/${teamId}/${id}.json?auth=${token}`,
        {
          method: "DELETE"
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
          FeedsActions.DELETED_A_PROJECT,
          FeedsActions.OBJECTIVE_PROJECT,
          "",
          "",
          "",
          "CLOSED",
          id,
          project.projectId,
          project.projectName,
        )
      );

      dispatch({
        type: DELETE_PROJECT,
        id: id
      });
    } catch (err) {
      throw err;
    }
  };
};

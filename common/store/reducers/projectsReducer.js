import {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  SET_PROJECTS,
  DELETE_PROJECT
} from "../actions/projectsActions";
import Project from "../../models/Project";
import * as Util from "../../utils/Util";

const initialState = {
  projects: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_PROJECTS:
      return {
        ...state,
        projects: action.projects
      };
    case CREATE_PROJECT:
      const newProject = new Project(
        action.projectData.id,
        action.projectData.projectId,
        action.projectData.projectName,
        action.projectData.startDate,
        action.projectData.dueDate,
        action.projectData.projectDescription,
      );
      return {
        ...state,
        projects: state.projects.concat(newProject)
      };
    case UPDATE_PROJECT:
      const projectIndex = state.projects.findIndex(
        pro => pro.id === action.id
      );
      const selectedProject = new Project(
        action.id,
        state.projects[projectIndex].projectId,
        action.projectData.projectName,
        action.projectData.startDate,
        action.projectData.dueDate,
        action.projectData.projectDescription,
      );
      const updatedProjects = [...state.projects];
      updatedProjects[projectIndex] = selectedProject;
      return {
        ...state,
        projects: updatedProjects
      };
    case DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(
          project => project.id !== action.id
        )
      };
    default:
      return state;
  }
};

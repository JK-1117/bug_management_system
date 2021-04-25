import {
  CREATE_BUG,
  UPDATE_BUG,
  SET_BUG,
  DELETE_BUG,
} from "../actions/bugsActions";
import Bug from "../../models/Bug";

const initialState = {
  bugs: [],
  projectBugs: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_BUG:
      return { bugs: action.bugs, projectBugs: action.projectBugs };
    case CREATE_BUG:
      const newBug = new Bug(
        action.bugData.bugKey,
        action.bugData.bugId,
        action.bugData.bugTitle,
        action.bugData.projectKey,
        action.bugData.testcaseKey,
        action.bugData.reportBy,
        action.bugData.reportTime,
        action.bugData.status,
        action.bugData.bugDescription,
        action.bugData.buildInfo,
        action.bugData.environment,
        action.bugData.severity,
        action.bugData.dueDate,
        action.bugData.priority,
        action.bugData.assignedTo,
        action.bugData.tester,
        action.bugData.stepToReproduce,
        action.bugData.attemptToRepeat,
        action.bugData.attachments
      );

      const newProjectBugs = state.projectBugs[action.bugData.projectKey]
        ? state.projectBugs
        : { ...state.projectBugs, [action.bugData.projectKey]: [] };
      return {
        bugs: state.bugs.concat(newBug),
        projectBugs: newProjectBugs[action.bugData.projectKey].concat(newBug),
      };
    case UPDATE_BUG:
      const bugIndex = state.bugs.findIndex(
        (bug) => bug.key === action.bugData.bugKey
      );
      const projectBugIndex = state.projectBugs[action.projectKey].findIndex(
        (bug) => bug.key === action.bugData.bugKey
      );
      const selectedBug = new Bug(
        action.bugData.bugKey,
        state.bugs[bugIndex].bugId,
        action.bugData.bugTitle,
        state.bugs[bugIndex].projectKey,
        action.bugData.testcaseKey,
        state.bugs[bugIndex].reportBy,
        state.bugs[bugIndex].reportTime,
        action.bugData.status,
        action.bugData.bugDescription,
        action.bugData.buildInfo,
        action.bugData.environment,
        action.bugData.severity,
        action.bugData.dueDate,
        action.bugData.priority,
        action.bugData.assignedTo,
        action.bugData.tester,
        action.bugData.stepToReproduce,
        action.bugData.attemptToRepeat,
        action.bugData.attachments
      );
      const updatedBugs = [...state.bugs];
      updatedBugs[bugIndex] = selectedBug;
      const updatedProjectBugs = { ...state.projectBugs };
      updatedProjectBugs[action.projectKey][projectBugIndex] = selectedBug;
      return {
        bugs: updatedBugs,
        projectBugs: updatedProjectBugs,
      };
    case DELETE_BUG:
      const deletedProjectBugs = { ...state.projectBugs };
      deletedProjectBugs[action.projectKey] = deletedProjectBugs[
        action.projectKey
      ]
        ? deletedProjectBugs[action.projectKey].filter(
            (item) => item.key !== action.bugKey
          )
        : deletedProjectBugs[action.projectKey];
      return {
        ...state,
        bugs: state.bugs.filter((item) => item.key !== action.bugKey),
        projectBugs: deletedProjectBugs,
      };
    default:
      return state;
  }
};

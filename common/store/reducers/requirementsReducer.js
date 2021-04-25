import Requirement from "../../models/Requirement";
import {
  CREATE_REQUIREMENT,
  SET_REQUIREMENT,
  UPDATE_REQUIREMENT,
  DELETE_REQUIREMENT
} from "../actions/requirementsActions";

const initialState = {
  requirements: [],
  projectRequirements: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_REQUIREMENT:
      return {
        requirements: action.requirements,
        projectRequirements: action.projectRequirements
      };
    case CREATE_REQUIREMENT:
      const newRequirement = new Requirement(
        action.requirementData.key,
        action.requirementData.requirementId,
        action.requirementData.requirementTitle,
        action.requirementData.requirementPriority,
        action.requirementData.requirementDescription,
        action.projectKey
      );

      const newProjectRequirements = state.projectRequirements[
        action.projectKey
      ]
        ? state.projectRequirements
        : { ...state.projectRequirements, [action.projectKey]: [] };
      return {
        requirements: state.requirements.concat(newRequirement),
        projectRequirements: newProjectRequirements[
          action.projectKey
        ].concat(newRequirement)
      };
    case UPDATE_REQUIREMENT:
      const requirementIndex = state.requirements.findIndex(
        req => req.key === action.requirementData.key
      );
      const projectRequirementIndex = state.projectRequirements[
        action.projectKey
      ].findIndex(req => req.key === action.requirementData.key);
      const selectedRequirement = new Requirement(
        action.requirementData.key,
        state.requirements[requirementIndex].requirementId,
        action.requirementData.requirementTitle,
        action.requirementData.requirementPriority,
        action.requirementData.requirementDescription,
        action.projectKey
      );
      const updatedRequirements = [...state.requirements];
      updatedRequirements[requirementIndex] = selectedRequirement;
      const updatedProjectRequirements = {...state.projectRequirements};
      updatedProjectRequirements[action.projectKey][
        projectRequirementIndex
      ] = selectedRequirement;
      return {
        requirements: updatedRequirements,
        projectRequirements: updatedProjectRequirements
      };
      case DELETE_REQUIREMENT:
        const deletedProjectRequirements = { ...state.projectRequirements };
        deletedProjectRequirements[action.projectKey] = deletedProjectRequirements[
          action.projectKey
        ]
          ? deletedProjectRequirements[action.projectKey].filter(
              (item) => item.key !== action.requirementKey
            )
          : deletedProjectRequirements[action.projectKey];
        return {
          ...state,
          requirements: state.requirements.filter((item) => item.key !== action.requirementKey),
          projectRequirements: deletedProjectRequirements,
        };
    default:
      return state;
  }
};

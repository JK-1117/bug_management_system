import Testcase from "../../models/Testcase";
import {
  CREATE_TESTCASE,
  SET_TESTCASE,
  UPDATE_TESTCASE,
  DELETE_TESTCASE
} from "../actions/testCasesActions";

const initialState = {
  testcases: [],
  projectTestcases: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_TESTCASE:
      return {
        testcases: action.testcases,
        projectTestcases: action.projectTestcases
      };
    case CREATE_TESTCASE:
      const newTestcase = new Testcase(
        action.testcaseData.key,
        action.testcaseData.testcaseId,
        action.testcaseData.objective,
        action.testcaseData.status,
        action.projectKey,
        action.testcaseData.requirementKey,
        action.testcaseData.tester,
        action.testcaseData.input,
        action.testcaseData.expectedResult,
        action.testcaseData.specialProcedure,
        action.testcaseData.intercaseDependency
      );

      const newProjectTestcases = state.projectTestcases[action.projectKey]
        ? state.projectTestcases
        : { ...state.projectTestcases, [action.projectKey]: [] };
      return {
        testcases: state.testcases.concat(newTestcase),
        projectTestcases: newProjectTestcases[action.projectKey].concat(
          newTestcase
        )
      };
    case UPDATE_TESTCASE:
      const testcaseIndex = state.testcases.findIndex(
        testc => testc.key === action.testcaseData.key
      );
      const projectTestcaseIndex = state.projectTestcases[
        action.projectKey
      ].findIndex(testc => testc.key === action.testcaseData.key);
      const selectedTestcase = new Testcase(
        action.testcaseData.key,
        state.testcases[testcaseIndex].testcaseId,
        action.testcaseData.objective,
        action.testcaseData.status,
        action.projectKey,
        action.testcaseData.requirementKey,
        action.testcaseData.tester,
        action.testcaseData.input,
        action.testcaseData.expectedResult,
        action.testcaseData.specialProcedure,
        action.testcaseData.intercaseDependency
      );
      const updatedTestcases = [...state.testcases];
      updatedTestcases[testcaseIndex] = selectedTestcase;
      const updatedProjectTestcases = { ...state.projectTestcases };
      updatedProjectTestcases[action.projectKey][
        projectTestcaseIndex
      ] = selectedTestcase;
      return {
        testcases: updatedTestcases,
        projectTestcases: updatedProjectTestcases
      };
      case DELETE_TESTCASE:
        const deletedProjectTestcases = { ...state.projectTestcases };
        deletedProjectTestcases[action.projectKey] = deletedProjectTestcases[
          action.projectKey
        ]
          ? deletedProjectTestcases[action.projectKey].filter(
              (item) => item.key !== action.testcaseKey
            )
          : deletedProjectTestcases[action.projectKey];
        return {
          ...state,
          testcases: state.testcases.filter((item) => item.key !== action.testcaseKey),
          projectTestcases: deletedProjectTestcases,
        };
    default:
      return state;
  }
};

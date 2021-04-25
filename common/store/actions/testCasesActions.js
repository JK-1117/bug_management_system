import Testcase from "../../models/Testcase";
import * as FeedsActions from "./feedsActions";
import * as Util from "../../utils/Util";
import * as TESTSTATUS from "../../constants/TestStatus"

export const CREATE_TESTCASE = "CREATE_TESTCASE";
export const UPDATE_TESTCASE = "UPDATE_TESTCASE";
export const DELETE_TESTCASE = "DELETE_TESTCASE";
export const SET_TESTCASE = "SET_TESTCASE";

export const fetchTestcase = () => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const teamId = getState().authReducer.user.teamId;

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/testcases.json?auth=${token}`
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("fetchTestcase");
        console.log(errorResData);

        throw new Error("Something went wrong!");
      }

      const resData = await response.json();
      const loadedTestcases = [];
      let loadedProjectTestcases = {};

      for (const key in resData) {
          const subTestcasesList = [];
          const project = resData[key];
        for (const testcaseKey in resData[key]) {
          const newTestcase = new Testcase(
            testcaseKey,
            project[testcaseKey].testcaseId,
            project[testcaseKey].objective,
            project[testcaseKey].status,
            key,
            project[testcaseKey].requirementKey,
            project[testcaseKey].tester,
            project[testcaseKey].input,
            project[testcaseKey].expectedResult,
            project[testcaseKey].specialProcedure,
            project[testcaseKey].intercaseDependency
          );
          subTestcasesList.push(newTestcase);
          loadedTestcases.push(newTestcase);
        }
        loadedProjectTestcases = {
          ...loadedProjectTestcases,
          [key]: subTestcasesList
        };
      }

      dispatch({
        type: SET_TESTCASE,
        testcases: loadedTestcases,
        projectTestcases: loadedProjectTestcases
      });
    } catch (err) {
      throw err;
    }
  };
};

export const createTestcase = (
  objective,
  requirementKey,
  tester,
  input,
  expectedResult,
  specialProcedure,
  intercaseDependency,
  projectKey,
  projectId,
  projectName
) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const username = getState().authReducer.user.displayName;
    const email = getState().authReducer.user.email;
    const projectTestcases = getState().testCasesReducer
      .projectTestcases;
    const testcaseId = Util.getTestcaseId(
      projectId,
      projectKey,
      projectTestcases
    );

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/testcases/${projectKey}.json?auth=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            testcaseId: testcaseId,
            objective: objective,
            status: TESTSTATUS.TO_BE_TESTED,
            requirementKey: requirementKey,
            tester: tester,
            input: input,
            expectedResult: expectedResult,
            specialProcedure: specialProcedure,
            intercaseDependency: intercaseDependency
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("createTestCase");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();

      await dispatch(
        FeedsActions.createFeed(
          username ? username : email,
          new Date().getTime(),
          FeedsActions.CREATED_A_TESTCASE,
          FeedsActions.OBJECTIVE_TESTCASE,
          resData.name,
          testcaseId,
          objective,
          TESTSTATUS.TO_BE_TESTED,
          projectKey,
          projectId,
          projectName
        )
      );

      dispatch({
        type: CREATE_TESTCASE,
        projectKey: projectKey,
        testcaseData: {
          key: resData.name,
          testcaseId: testcaseId,
          objective: objective,
          status: TESTSTATUS.TO_BE_TESTED,
          requirementKey: requirementKey,
          tester: tester,
          input: input,
          expectedResult: expectedResult,
          specialProcedure: specialProcedure,
          intercaseDependency: intercaseDependency
        }
      });
    } catch (err) {
      throw err;
    }
  };
};

export const updateTestcase = (
  testcaseKey,
  testcaseId,
  objective,
  status,
  requirementKey,
  tester,
  input,
  expectedResult,
  specialProcedure,
  intercaseDependency,
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
        `https://dragonfly-bms.firebaseio.com/testcases/${projectKey}/${testcaseKey}.json?auth=${token}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            objective: objective,
            status: status,
            requirementKey: requirementKey,
            tester: tester,
            input: input,
            expectedResult: expectedResult,
            specialProcedure: specialProcedure,
            intercaseDependency: intercaseDependency
          })
        }
      );

      if (!response.ok) {
        const errorResData = await response.json();
        const errorId = errorResData.error.message;
        console.log("updateTestCase");
        console.log(errorResData);

        throw new Error("Something went wrong...");
      }

      const resData = await response.json();

      await dispatch(
        FeedsActions.createFeed(
          username ? username : email,
          new Date().getTime(),
          FeedsActions.UPDATED_A_TESTCASE,
          FeedsActions.OBJECTIVE_TESTCASE,
          testcaseKey,
          testcaseId,
          objective,
          status,
          projectKey,
          projectId,
          projectName
        )
      );

      dispatch({
        type: UPDATE_TESTCASE,
        projectKey: projectKey,
        testcaseData: {
          key: testcaseKey,
          objective: objective,
          status: status,
          requirementKey: requirementKey,
          tester: tester,
          input: input,
          expectedResult: expectedResult,
          specialProcedure: specialProcedure,
          intercaseDependency: intercaseDependency
        }
      });
    } catch (err) {
      throw err;
    }
  };
};

export const deleteTestcase = (testcaseKey) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const username = getState().authReducer.user.displayName;
    const email = getState().authReducer.user.email;
    const testcase = getState().testCasesReducer.testcases.find(
      (item) => item.key === testcaseKey
    );
    const project = getState().projectsReducer.projects.find(
      (item) => item.id === testcase.projectKey
    );

    try {
      const response = await fetch(
        `https://dragonfly-bms.firebaseio.com/testcases/${project.id}/${testcaseKey}.json?auth=${token}`,
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
          FeedsActions.DELETED_A_TESTCASE,
          FeedsActions.OBJECTIVE_DELETED,
          testcase.key,
          testcase.testcaseId,
          testcase.objective,
          "CLOSED",
          project.id,
          project.projectId,
          project.projectName
        )
      );

      dispatch({
        type: DELETE_TESTCASE,
        testcaseKey: testcaseKey,
        projectKey: project.id
      });
    } catch (err) {
      throw err;
    }
  };
};

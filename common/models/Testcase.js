class Testcase {
    constructor(
      key = "",
      testcaseId = "",
      objective = "",
      status = "",
      projectKey = "",
      requirementKey = "",
      tester = "",
      input = "",
      expectedResult = "",
      specialProcedure = "",
      intercaseDependency = [],
    ) {
      this.key = key;
      this.testcaseId = testcaseId;
      this.objective = objective;
      this.status = status;
      this.projectKey = projectKey;
      this.requirementKey = requirementKey;
      this.tester = tester;
      this.input = input;
      this.expectedResult = expectedResult;
      this.specialProcedure = specialProcedure;
      this.intercaseDependency = intercaseDependency;
    }
  }
  
  export default Testcase;
  
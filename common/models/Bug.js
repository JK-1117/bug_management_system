class Bug {
  constructor(
    key = "",
    bugId = "",
    bugTitle = "",
    projectKey = "",
    testcaseKey = "",
    reportBy = "",
    reportTime = "",
    status = "",
    bugDescription = "",
    buildInfo = "",
    environment = "",
    severity = "",
    dueDate = "",
    priority = "",
    assignedTo = "",
    tester = "",
    stepToReproduce = "",
    attemptToRepeat = "",
    attachments = []
  ) {
    this.key = key;
    this.bugId = bugId;
    this.bugTitle = bugTitle;
    this.projectKey = projectKey;
    this.testcaseKey = testcaseKey;
    this.reportBy = reportBy;
    this.reportTime = reportTime;
    this.status = status;
    this.bugDescription = bugDescription;
    this.buildInfo = buildInfo;
    this.environment = environment;
    this.severity = severity;
    this.dueDate = dueDate;
    this.priority = priority;
    this.assignedTo = assignedTo;
    this.tester = tester;
    this.stepToReproduce = stepToReproduce;
    this.attemptToRepeat = attemptToRepeat;
    this.attachments = attachments;
  }
}

export default Bug;

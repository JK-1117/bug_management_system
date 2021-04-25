class Feed {
  constructor(
    id = "",
    user = "",
    time = "",
    action = "",
    objective = "",
    objectiveKey = "",
    objectiveId = "",
    objectiveTitle = "",
    severity = "",
    projectKey = "",
    projectId = "",
    projectName = ""
  ) {
    this.id = id;
    this.user = user;
    this.time = time;
    this.action = action;
    this.objective = objective;
    this.objectiveKey = objectiveKey;
    this.objectiveId = objectiveId;
    this.objectiveTitle = objectiveTitle;
    this.severity = severity;
    this.projectKey = projectKey;
    this.projectId = projectId;
    this.projectName = projectName;
  }
}

export default Feed;

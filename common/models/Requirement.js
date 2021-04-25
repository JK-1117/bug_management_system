class Requirement {
  constructor(
    key = "",
    requirementId = "",
    requirementTitle = "",
    requirementPriority = "",
    requirementDescription = "",
    projectKey = ""
  ) {
    this.key = key;
    this.requirementId = requirementId;
    this.requirementTitle = requirementTitle;
    this.requirementPriority = requirementPriority;
    this.requirementDescription = requirementDescription;
    this.projectKey = projectKey;
  }
}

export default Requirement;

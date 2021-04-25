class Project {
  constructor(
    id = "",
    projectId = "",
    projectName = "",
    startDate = "",
    dueDate = "",
    projectDescription = ""
  ) {
    this.id = id;
    this.projectId = projectId;
    this.projectName = projectName;
    this.startDate = startDate;
    this.dueDate = dueDate;
    this.projectDescription = projectDescription;
  }
}

export default Project;

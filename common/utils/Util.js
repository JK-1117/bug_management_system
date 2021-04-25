import Colors from "../constants/Colors";
import * as Status from "../constants/Status";
import * as Severity from "../constants/Severity";
import * as Priority from "../constants/Priority";
import * as TestStatus from "../constants/TestStatus";

export function formatDate(date) {
  if (date === null) return "";
  return (
    appendLeadingZeroes(date.getMonth() + 1) +
    "/" +
    appendLeadingZeroes(date.getDate()) +
    "/" +
    date.getFullYear()
  );
}

export function formatDatetime(date) {
  if (date === null) return "";
  return (
    formatDate(date) +
    " " +
    appendLeadingZeroes(date.getHours()) +
    ":" +
    appendLeadingZeroes(date.getMinutes()) +
    ":" +
    appendLeadingZeroes(date.getSeconds())
  );
}

export function formateTimestamp(timestamp) {
  return formatDatetime(new Date(timestamp));
}

export function getTodate() {
  return formatDate(new Date());
}

export function getDatetime() {
  return formatDatetime(new Date());
}

export function getTimestamp() {
  return new Date().getTime();
}

export function getTxtColor(value) {
  if (
    value === Severity.MISSION_CRITICAL ||
    value === Status.OPEN ||
    value === TestStatus.FAILED ||
    value === Priority.IMMEDIATE ||
    value.toLowerCase() === "closed"
  ) {
    return Colors.criticalDark;
  } else if (
    value === Severity.MAJOR ||
    value === Priority.DELAYED ||
    value === Status.ASSIGNED
  ) {
    return Colors.majorDark;
  } else if (value === Status.RETESTED) {
    return Colors.majorDark;
  } else if (
    value === Severity.MINOR ||
    value === Priority.DEFERRED ||
    value === TestStatus.PASSED ||
    value === Status.APPROVE_RESOLVE
  ) {
    return Colors.minorDark;
  } else if (
    value.toLowerCase() === "info" ||
    value === Status.FIXED ||
    value === TestStatus.TO_BE_TESTED
  ) {
    return Colors.trivialDark;
  } else {
    return "black";
  }
}

export function getBgColor(value) {
  if (
    value === Severity.MISSION_CRITICAL ||
    value === Status.OPEN ||
    value === TestStatus.FAILED ||
    value === Priority.IMMEDIATE ||
    value.toLowerCase() === "closed"
  ) {
    return Colors.critical;
  } else if (
    value === Severity.MAJOR ||
    value === Priority.DELAYED ||
    value === Status.RETESTED ||
    value === Status.ASSIGNED
  ) {
    return Colors.major;
  } else if (
    value === Severity.MINOR ||
    value === Priority.DEFERRED ||
    value === TestStatus.PASSED ||
    value === Status.APPROVE_RESOLVE
  ) {
    return Colors.minor;
  } else if (
    value.toLowerCase() === "info" ||
    value === Status.FIXED ||
    value === TestStatus.TO_BE_TESTED
  ) {
    return Colors.trivial;
  } else {
    return "#fff";
  }
}

export function getProgressColor(progress) {
  if (progress > 0.667) {
    return Colors.success;
  } else if (progress > 0.333) {
    return Colors.warning;
  } else {
    return Colors.danger;
  }
}

export function appendLeadingZeroes(n) {
  if (n <= 9) {
    return "0" + n;
  }
  return n;
}

export function getInitials(name) {
  let initials = name.match(/\b\w/g) || [];
  initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();

  return initials;
}

export function getProjectId(projects) {
  return "P-" + appendLeadingZeroes(projects.length + 1);
}

export function getBugId(projectId, projectKey, projectBug) {
  let prefix = "P";
  prefix += projectId.charAt(2) + projectId.charAt(3);
  prefix += "-";

  if (projectBug && projectBug[projectKey]) {
    return (
      prefix + "B-" + appendLeadingZeroes(projectBug[projectKey].length + 1)
    );
  }

  return prefix + "B-01";
}

export function getRequirementId(projectId, projectKey, projectRequirement) {
  let prefix = "P";
  prefix += projectId.charAt(2) + projectId.charAt(3);
  prefix += "-";

  if (projectRequirement && projectRequirement[projectKey]) {
    return (
      prefix +
      "R-" +
      appendLeadingZeroes(projectRequirement[projectKey].length + 1)
    );
  }

  return prefix + "R-01";
}

export function getTestcaseId(projectId, projectKey, projectTestCase) {
  let prefix = "P";
  prefix += projectId.charAt(2) + projectId.charAt(3);
  prefix += "-";

  if (projectTestCase && projectTestCase[projectKey]) {
    return (
      prefix +
      "T-" +
      appendLeadingZeroes(projectTestCase[projectKey].length + 1)
    );
  }

  return prefix + "T-01";
}

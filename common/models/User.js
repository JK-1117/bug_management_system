class User {
  constructor(
    userId = "",
    email = "",
    displayName = "",
    photoUrl = "",
    teamId = "",
    expoToken = "",
  ) {
    this.userId = userId;
    this.email = email;
    this.displayName = displayName;
    this.photoUrl = photoUrl;
    this.teamId = teamId;
    this.expoToken = expoToken;
  }
}

export default User;

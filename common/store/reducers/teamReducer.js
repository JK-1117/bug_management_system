import {
  CREATE_TEAM,
  SET_TEAM,
  DELETE_TEAM,
  SET_INVITATION,
  DELETE_INVITATION,
  EDIT_ROLE
} from "../actions/teamActions";

const initialState = {
  role: "",
  teamUser: [],
  teamInvitation: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_TEAM:
      return {
        ...state,
        role: "admin",
        teamUser: action.teamUser ? action.teamUser : []
      };
    case SET_TEAM:
      return {
        ...state,
        role: action.role,
        teamUser: action.teamUser
      };
    case EDIT_ROLE:
      const newTeamUser = action.teamUser ? action.teamUser : [];
      const role = newTeamUser.filter(item => item.userId === action.userId)[0]
        .role;
      return {
        ...state,
        role: role,
        teamUser: newTeamUser
      };
    case DELETE_TEAM:
      return {
        ...state,
        role: "",
        teamUser: []
      };
    case SET_INVITATION:
      return {
        ...state,
        teamInvitation: action.invitation
      };
    case DELETE_INVITATION:
      return {
        ...state,
        teamInvitation: null
      };
    default:
      return state;
  }
};

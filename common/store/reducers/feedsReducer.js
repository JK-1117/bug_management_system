import Feed from "../../models/Feed";
import { CREATE_FEED, SET_FEEDS } from "../actions/feedsActions";

const initialState = {
  feeds: [],
  userFeeds: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_FEEDS:
      return {
        ...state,
        feeds: action.feeds.slice().reverse()
      };
    case CREATE_FEED:
      const newFeed = new Feed(
        action.feedData.id,
        action.feedData.user,
        action.feedData.time,
        action.feedData.action,
        action.feedData.objective,
        action.feedData.objectiveKey,
        action.feedData.objectiveId,
        action.feedData.objectiveTitle,
        action.feedData.severity,
        action.feedData.projectKey,
        action.feedData.projectId,
        action.feedData.projectName
      );
      return {
        ...state,
        feeds: state.feeds.concat(newFeed)
      };
    default:
      return state;
  }
};

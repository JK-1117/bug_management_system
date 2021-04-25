import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";

import * as Util from "../../../common/utils/Util";
import {
  OBJECTIVE_PROJECT,
  OBJECTIVE_BUG,
  OBJECTIVE_REQUIREMENT,
  OBJECTIVE_TESTCASE,
} from "../../../common/store/actions/feedsActions";

const FeedItem = (props) => {
  const { feed } = props;
  const bgColor = Util.getBgColor(feed.severity);
  const textColor = Util.getTxtColor(feed.severity);
  const FeedTitle =
    feed.objectiveTitle.length > 0 ? " in " + feed.projectName : "";

  const feedDescription =
    feed.objectiveTitle.length > 0 ? (
      <View style={styles.feedContent}>
        <View style={styles.id}>
          <Text style={styles.idText}>{feed.objectiveId}</Text>
        </View>
        <View style={styles.contentDescription}>
          <Text style={styles.text}>{feed.objectiveTitle}</Text>
        </View>
      </View>
    ) : (
      <View style={styles.feedContent}>
        <View style={styles.id}>
          <Text style={styles.idText}>{feed.projectId}</Text>
        </View>
        <View style={styles.contentDescription}>
          <Text style={styles.text}>{feed.projectName}</Text>
        </View>
      </View>
    );

  const navigateToFeed = () => {
    switch (feed.objective) {
      case OBJECTIVE_PROJECT:
        return props.navigate("/Home/Project", {
          projectId: feed.projectKey,
        });
      case OBJECTIVE_REQUIREMENT:
        return props.navigate("/Home/Requirement", {
          requirementKey: feed.objectiveKey,
        });
      case OBJECTIVE_TESTCASE:
        return props.navigate("/Home/TestCase", {
          testcaseKey: feed.objectiveKey,
        });
      case OBJECTIVE_BUG:
        return props.navigate("/Home/Bug", {
          bugKey: feed.objectiveKey,
        });
      case OBJECTIVE_DELETED:
        return alert("Entry Deleted\n The entry is deleted...");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={navigateToFeed}>
      <View style={[styles.feed, { backgroundColor: bgColor }]}>
        <Text style={styles.feedTitle}>
          <Text style={{ color: "black" }}>{feed.user}</Text>
          {" " + feed.action}
          <Text style={{ color: "black" }}>{FeedTitle}</Text>
        </Text>

        {feedDescription}

        <View style={styles.feedFooter}>
          <Text style={[styles.feedSeverity, { color: textColor }]}>
            {feed.severity.toUpperCase()}
          </Text>
          <Text style={styles.feedTime}>
            -{Util.formateTimestamp(feed.time)}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  feed: {
    width: "100%",
    padding: 10,
    marginVertical: 2,
  },
  feedTitle: {
    textAlignVertical: "center",
    fontSize: 16,
    color: "#fff",
    padding: 5,
    width: "100%",
  },
  feedContent: {
    flexDirection: "row",
    flex: 1,
    padding: 5,
  },
  contentDescription: {
    flex: 1,
    paddingHorizontal: 5,
  },
  feedFooter: {
    flexDirection: "row",
    padding: 5,
  },
  feedSeverity: {
    flex: 1,
    textAlignVertical: "bottom",
    textAlign: "left",
    fontWeight: "bold",
  },
  feedTime: {
    flex: 1,
    textAlignVertical: "bottom",
    color: "#fff",
    textAlign: "right",
  },
  id: {
    marginRight: 10,
  },
  idText: {
    fontSize: 18,
    color: "#fff",
  },
  text: {
    fontSize: 18,
  },
});

export default FeedItem;

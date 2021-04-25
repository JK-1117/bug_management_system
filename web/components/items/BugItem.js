import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";

import * as Util from "../../../common/utils/Util";

const BugItem = (props) => {
  const { bug } = props;
  const bgColor = Util.getBgColor(bug.severity);
  const statusColor = Util.getTxtColor(bug.status);
  const severityColor = Util.getTxtColor(bug.severity);
  const priorityColor = Util.getTxtColor(bug.priority);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        props.onSelect(bug.key);
      }}
    >
      <View style={[styles.bug, { backgroundColor: bgColor }]}>
        <View style={styles.contentTitle}>
          <Text style={styles.idText}>{bug.bugId}</Text>
          <Text
            style={{
              ...styles.bugStatus,
              color: statusColor,
            }}
          >
            {bug.status.toUpperCase()}
          </Text>
        </View>

        <View style={styles.bugContent}>
          <View style={styles.contentDescription}>
            <Text style={styles.text}>{bug.bugTitle}</Text>
          </View>
        </View>

        <View style={styles.bugFooter}>
          <Text style={[styles.bugSeverity, { color: severityColor }]}>
            {bug.severity ? bug.severity.toUpperCase() : " - "}
            <Text style={styles.text}> / </Text>
            <Text style={{ color: priorityColor }}>
              {bug.priority ? bug.priority.toUpperCase() : " - "}
            </Text>
          </Text>
          <Text style={styles.bugTime}>
            Due: {bug.dueDate ? Util.formatDate(new Date(bug.dueDate)) : " - "}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  bug: {
    width: "100%",
    padding: 10,
    marginVertical: 2,
  },
  contentTitle: {
    flexDirection: "row",
    padding: 5,
    width: "100%",
  },
  bugContent: {
    flexDirection: "row",
    flex: 1,
    padding: 5,
  },
  contentDescription: {
    flex: 1,
    paddingHorizontal: 5,
  },
  bugFooter: {
    flexDirection: "row",
    padding: 5,
  },
  bugSeverity: {
    fontWeight: "bold",
    textAlignVertical: "bottom",
    textAlign: "left",
  },
  bugTime: {
    flex: 1,
    textAlignVertical: "bottom",
    color: "#fff",
    textAlign: "right",
  },
  bugStatus: {
    fontWeight: "bold",
    textAlignVertical: "center",
    paddingRight: 10,
  },
  idText: {
    fontSize: 16,
    paddingRight: 10,
  },
  text: {
    fontSize: 18,
  },
});

export default BugItem;

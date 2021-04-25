import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";

import * as Util from "../../../common/utils/Util";

const RequirementItem = (props) => {
  const { requirement } = props;
  const bgColor = Util.getBgColor(requirement.requirementPriority);
  const priorityColor = Util.getTxtColor(requirement.requirementPriority);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        props.onSelect(requirement.key);
      }}
    >
      <View style={[styles.requirement, { backgroundColor: bgColor }]}>
        <View style={styles.contentTitle}>
          <Text style={styles.idText}>{requirement.requirementId}</Text>
        </View>

        <View style={styles.requirementContent}>
          <View style={styles.contentDescription}>
            <Text style={styles.text}>{requirement.requirementTitle}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.priority, { color: priorityColor }]}>
            {requirement.requirementPriority
              ? requirement.requirementPriority.toUpperCase()
              : " - "}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  requirement: {
    width: "100%",
    padding: 10,
    marginVertical: 2,
  },
  contentTitle: {
    flexDirection: "row",
    padding: 5,
    width: "100%",
  },
  requirementContent: {
    flexDirection: "row",
    flex: 1,
    padding: 5,
  },
  contentDescription: {
    flex: 1,
    paddingHorizontal: 5,
  },
  footer: {
    flexDirection: "row",
    padding: 5,
  },
  priority: {
    fontWeight: "bold",
    textAlignVertical: "bottom",
    textAlign: "left",
  },
  idText: {
    fontSize: 16,
    paddingRight: 10,
  },
  text: {
    fontSize: 18,
  },
});

export default RequirementItem;

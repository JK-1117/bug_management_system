import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";

import * as Util from "../../../common/utils/Util";

const TestCaseItem = (props) => {
  const { testcase } = props;
  const bgColor = Util.getBgColor(testcase.status);
  const statusColor = Util.getTxtColor(testcase.status);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        props.onSelect(testcase.key);
      }}
    >
      <View style={[styles.testcase, { backgroundColor: bgColor }]}>
        <View style={styles.contentTitle}>
          <Text style={styles.idText}>{testcase.testcaseId}</Text>
        </View>

        <View style={styles.testcaseContent}>
          <View style={styles.contentDescription}>
            <Text style={styles.text}>{testcase.objective}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.status, { color: statusColor }]}>
            {testcase.status ? testcase.status.toUpperCase() : " - "}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  testcase: {
    width: "100%",
    padding: 10,
    marginVertical: 2,
  },
  contentTitle: {
    flexDirection: "row",
    padding: 5,
    width: "100%",
  },
  testcaseContent: {
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
  status: {
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

export default TestCaseItem;

import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ProgressBar = (props) => {
  return (
    <View style={styles.progressBar}>
      {props.data.map((item, index, array) => {
        return (
          <View
            style={[
              styles.progress,
              {
                backgroundColor: item.color,
                flex: item.progress,
                borderTopLeftRadius: index === 0 ? 5 : 0,
                borderBottomLeftRadius: index === 0 ? 5 : 0,
                borderTopRightRadius: index === array.length - 1 ? 5 : 0,
                borderBottomRightRadius: index === array.length - 1 ? 5 : 0,
              },
            ]}
            key={index}
          ></View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 10,
  },
  progress: {
    height: 10,
  },
});

export default ProgressBar;

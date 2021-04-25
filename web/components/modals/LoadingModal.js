import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, ActivityIndicator } from "react-native";

import Colors from "../../../common/constants/Colors";

const LoadingModal = (props) => {
  return (
    <View style={styles.modal}>
      <ActivityIndicator size="large" color={Colors.primaryColorLight} />
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    width: "100vw",
    height: "100vh",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
  },
});

export default LoadingModal;

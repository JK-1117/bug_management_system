import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, ActivityIndicator } from "react-native";

import Colors from "../../../common/constants/Colors";

const LoadingModal = props => {
  return (
    <Modal transparent={true} visible={true} animationType="fade">
      <View style={styles.modal}>
        <ActivityIndicator size="large" color={Colors.primaryColorLight} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: "rgba(0,0,0,0.5)"
  }
});

export default LoadingModal;

import React, { useState, useRef, forwardRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Colors from "../../../common/constants/Colors";

const AttachmentItem = (props) => {
  const { item } = props;

  return (
    <View style={styles.attachment}>
      <View style={styles.attachmentPreview}>
        {item.type === "image" ? (
          <Image source={{ uri: item.uri }} style={styles.previewImg} />
        ) : (
          <MaterialCommunityIcons
            name="file-document"
            size={35}
            color={Colors.primaryColor}
          />
        )}
      </View>
      <Text
        style={styles.attachmentFilename}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {item.name}
      </Text>
      {props.editable && (
        <TouchableWithoutFeedback
          onPress={() => {
            props.deleteHandler(item.uri);
          }}
        >
          <View style={styles.icon}>
            <MaterialCommunityIcons name="delete-forever" size={25} />
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  attachment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  attachmentPreview: {
    width: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImg: {
    width: 150,
    height: 100,
    resizeMode: "cover",
    backgroundColor: Colors.light,
  },
  zoomImg: {
    height: "80%",
    width: "80%",
  },
  progressContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  attachmentFilename: {
    flex: 1,
    fontFamily: "roboto-regular",
    fontSize: 18,
    textAlignVertical: "center",
    textAlign: "center",
  },
  icon: {
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AttachmentItem;

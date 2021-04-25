import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Alert
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import Attachment from "../../../common/models/Attachment";

const AttachmentModal = props => {
  const [pickedImage, setPickedImage] = useState();

  const verifyPermissions = async () => {
      const result = await Permissions.askAsync(
        Permissions.CAMERA,
        Permissions.CAMERA_ROLL
      );

      if (result.status !== "granted") {
        Alert.alert(
          "Insuficient permission!",
          "You need to grant camera permissions to continue.",
          [{ text: "Okay" }]
        );
        return false;
      }
      return true;
  };

  const cameraHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      console.log("NO PERMISSION");
      return;
    }
    let image = await ImagePicker.launchCameraAsync();
    if (image.cancelled) {
      return;
    } else {
      props.addAttachment([
        new Attachment(image.uri.split("/").pop(), "image", image.uri)
      ]);
      props.toggle(false);
    }
  };

  const picturesHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    } else {
      props.picturesHandler(true);
      props.toggle(false);
    }
  };

  const documentHandler = async () => {
    const document = await DocumentPicker.getDocumentAsync();
    if (document.type === "cancel") {
      return;
    }
    props.addAttachment([
      new Attachment(document.name, "document", document.uri)
    ]);
    props.toggle(false);
  };

  return (
    <Modal transparent={true} visible={props.visible} animationType="fade">
      <TouchableWithoutFeedback
        onPress={() => {
          props.toggle(false);
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <TouchableWithoutFeedback onPress={cameraHandler}>
              <View style={styles.option}>
                <MaterialCommunityIcons name="camera" size={35} />
                <Text style={styles.optionText}>Camera</Text>
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={picturesHandler}>
              <View style={styles.option}>
                <MaterialCommunityIcons
                  name="folder-multiple-image"
                  size={35}
                />
                <Text style={styles.optionText}>Pictures</Text>
              </View>
            </TouchableWithoutFeedback>

            {/* <TouchableWithoutFeedback onPress={documentHandler}>
              <View style={styles.option}>
                <MaterialCommunityIcons name="file-document" size={35} />
                <Text style={styles.optionText}>Document</Text>
              </View>
            </TouchableWithoutFeedback> */}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    padding: 20,
    position: "absolute",
    bottom: 50
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 15
  },
  optionText: {
    fontSize: 14,
    fontFamily: "roboto-regular",
    textAlign: "center"
  }
});

export default AttachmentModal;

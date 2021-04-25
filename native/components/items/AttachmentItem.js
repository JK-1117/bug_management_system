import React, { useState, useRef, forwardRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  TouchableWithoutFeedback,
  ProgressBarAndroid,
  ProgressViewIOS,
  Platform,
} from "react-native";
import { Notifications } from "expo";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as Permissions from "expo-permissions";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-simple-toast";

import Colors from "../../../common/constants/Colors";

const AttachmentItem = (props) => {
  const [downloadProgress, setDownloadProgress] = useState();
  const { item } = props;

  const downloadImageHandler = async () => {
    const callback = (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      setDownloadProgress(progress);
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      item.uri,
      FileSystem.documentDirectory + item.name,
      {},
      callback
    );

    const saveFile = async (fileUri) => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === "granted") {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync("Download", asset, false);
      }
    };

    try {
      const { uri } = await downloadResumable.downloadAsync();
      await saveFile(uri);

      Toast.show("Download completed", Toast.LONG);
      Notifications.presentLocalNotificationAsync({
        title: "Dragonfly Bug Management System",
        body: "Attachment downloaded, find it in your Gallery",
      });
      setDownloadProgress(null);
    } catch (e) {
      console.error(e);
    }
  };

  const progressElement =
    Platform.OS === "android" ? (
      <ProgressBarAndroid
        styleAttr="Horizontal"
        indeterminate={false}
        color={Colors.primaryColorLight}
        progress={downloadProgress}
      />
    ) : (
      <ProgressViewIOS
        progress={downloadProgress}
        progressTintColor={Colors.primaryColorLight}
      />
    );

  return (
    <TouchableWithoutFeedback
      onPress={props.editable ? null : downloadImageHandler}
    >
      <View style={styles.attachment}>
        {/* <Modal transparent={true} visible={isZoom} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsZoom(false)}>
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <Image source={{ uri: item.uri }} style={styles.zoomImg} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal> */}
        <View style={styles.attachmentPreview}>
          {item.type === "image" ? (
            // <TouchableWithoutFeedback onPress={() => setIsZoom(true)}>
            <Image source={{ uri: item.uri }} style={styles.previewImg} />
          ) : (
            <MaterialCommunityIcons
              name="file-document"
              size={35}
              color={Colors.primaryColor}
            />
          )}
        </View>
        {downloadProgress ? (
          <View style={styles.progressContainer}>{progressElement}</View>
        ) : (
          <Text
            style={styles.attachmentFilename}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {item.name}
          </Text>
        )}
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
    </TouchableWithoutFeedback>
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
    marginVertical: 2,
    paddingHorizontal: 10,
    height: 60,
    backgroundColor: "#fff",
  },
  attachmentPreview: {
    width: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImg: {
    width: "100%",
    maxWidth: 60,
    height: "100%",
    maxHeight: 60,
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
  },
  icon: {
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AttachmentItem;

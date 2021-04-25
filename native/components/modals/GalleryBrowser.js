import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { ImageBrowser } from 'expo-multiple-media-imagepicker';

import Colors from "../../../common/constants/Colors";

const GalleryBrowser = props => {

  return (
    <Modal style={styles.imageBrowser}>
      <ImageBrowser
        max={10}
        headerButtonColor={Colors.primaryColor}
        badgeColor={Colors.primaryColor}
        emptyText={"No Image..."}
        callback={props.imageBrowserCallback}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
    imageBrowser: {}
});

export default GalleryBrowser;

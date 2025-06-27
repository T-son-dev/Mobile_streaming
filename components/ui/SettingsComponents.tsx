import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/Colors';

import { IconSymbol } from '@/components/ui/IconSymbol';

interface SettingCardProps {
  title: string;
  description: string;
  iconName: string;
  onPress: () => void;
}

export const SettingCard: React.FC<SettingCardProps> = ({
  title,
  description,
  iconName,
  onPress,
}) => (
  <TouchableOpacity style={styles.settingCard} onPress={onPress}>
    <IconSymbol name={iconName} size={24} color={Colors.dark.tint} style={styles.settingIcon} />
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingDescription}>{description}</Text>
    </View>
    <IconSymbol name="chevron.right" size={20} color={Colors.dark.tabIconDefault} />
  </TouchableOpacity>
);

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
            <IconSymbol name="xmark" size={24} color={Colors.dark.tabIconDefault} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>{children}</ScrollView>
      </View>
    </View>
  </Modal>
);

interface CustomSliderProps {
  label: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  label,
  value,
  minimumValue,
  maximumValue,
  step = 1,
  unit = '',
  onValueChange,
}) => (
  <View style={styles.sliderContainer}>
    <View style={styles.sliderHeader}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <Text style={styles.sliderValue}>
        {value}{unit}
      </Text>
    </View>
    <Slider
      style={styles.slider}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      value={value}
      step={step}
      onValueChange={onValueChange}
      minimumTrackTintColor={Colors.dark.tint}
      maximumTrackTintColor={Colors.dark.tabIconDefault}
      thumbTintColor={Colors.dark.tint}
    />
  </View>
);

interface ToggleSettingProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const ToggleSetting: React.FC<ToggleSettingProps> = ({
  label,
  description,
  value,
  onValueChange,
}) => (
  <View style={styles.toggleContainer}>
    <View style={styles.toggleContent}>
      <Text style={styles.toggleLabel}>{label}</Text>
      {description && (
        <Text style={styles.toggleDescription}>{description}</Text>
      )}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: Colors.dark.tabIconDefault, true: Colors.dark.tint }}
      thumbColor={value ? '#fff' : '#f4f3f4'}
    />
  </View>
);

interface OptionSelectorProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
}) => (
  <View style={styles.optionContainer}>
    <Text style={styles.optionLabel}>{label}</Text>
    <View style={styles.optionButtons}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.optionButton,
            selectedValue === option.value && styles.optionButtonSelected,
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Text
            style={[
              styles.optionButtonText,
              selectedValue === option.value && styles.optionButtonTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

interface ColorPickerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onValueChange,
}) => {
  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFFFFF', '#000000',
    '#FFA500', '#800080', '#FFC0CB', '#808080',
  ];

  return (
    <View style={styles.colorPickerContainer}>
      <Text style={styles.colorPickerLabel}>{label}</Text>
      <View style={styles.colorGrid}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              value === color && styles.colorSwatchSelected,
            ]}
            onPress={() => onValueChange(color)}
          />
        ))}
      </View>
      <TextInput
        style={styles.colorInput}
        value={value}
        onChangeText={onValueChange}
        placeholder="#000000"
        placeholderTextColor={Colors.dark.tabIconDefault}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: Colors.dark.tabIconDefault,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '80%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButtonContainer: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  sliderValue: {
    color: Colors.dark.tint,
    fontSize: 16,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 4,
  },
  toggleDescription: {
    color: Colors.dark.tabIconDefault,
    fontSize: 14,
  },
  optionContainer: {
    marginBottom: 24,
  },
  optionLabel: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.tabIconDefault,
  },
  optionButtonSelected: {
    backgroundColor: Colors.dark.tint,
    borderColor: Colors.dark.tint,
  },
  optionButtonText: {
    color: Colors.dark.tabIconDefault,
    fontSize: 14,
  },
  optionButtonTextSelected: {
    color: Colors.dark.background,
    fontWeight: '600',
  },
  colorPickerContainer: {
    marginBottom: 24,
  },
  colorPickerLabel: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: Colors.dark.tint,
  },
  colorInput: {
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { TextOverlay } from '@/types/overlay';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';

interface TextStyleEditorProps {
  overlay: TextOverlay;
  onUpdate: (updates: Partial<TextOverlay>) => void;
  onClose: () => void;
}

const TextStyleEditor: React.FC<TextStyleEditorProps> = ({
  overlay,
  onUpdate,
  onClose,
}) => {
  const [localStyle, setLocalStyle] = useState(overlay.style);
  const [localContent, setLocalContent] = useState(overlay.content);

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#90ee90', '#87ceeb',
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

  const fonts = [
    'System',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
  ];

  const handleStyleUpdate = (styleUpdates: Partial<TextOverlay['style']>) => {
    const newStyle = { ...localStyle, ...styleUpdates };
    setLocalStyle(newStyle);
    onUpdate({ style: newStyle });
  };

  const handleContentUpdate = (content: string) => {
    setLocalContent(content);
    onUpdate({ content });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Text Style</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Text Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content</Text>
          <TextInput
            style={styles.textInput}
            value={localContent}
            onChangeText={handleContentUpdate}
            multiline
            placeholder="Enter text..."
            placeholderTextColor={Colors.dark.tabIconDefault}
          />
        </View>

        {/* Font Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Font Size</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalOptions}>
              {fontSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    localStyle.fontSize === size && styles.activeButton,
                  ]}
                  onPress={() => handleStyleUpdate({ fontSize: size })}
                >
                  <Text
                    style={[
                      styles.sizeButtonText,
                      localStyle.fontSize === size && styles.activeButtonText,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Font Family */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Font Family</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalOptions}>
              {fonts.map((font) => (
                <TouchableOpacity
                  key={font}
                  style={[
                    styles.fontButton,
                    localStyle.fontFamily === font && styles.activeButton,
                  ]}
                  onPress={() => handleStyleUpdate({ fontFamily: font })}
                >
                  <Text
                    style={[
                      styles.fontButtonText,
                      { fontFamily: font },
                      localStyle.fontFamily === font && styles.activeButtonText,
                    ]}
                  >
                    {font}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Text Color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Color</Text>
          <View style={styles.colorGrid}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  localStyle.color === color && styles.selectedColor,
                ]}
                onPress={() => handleStyleUpdate({ color })}
              />
            ))}
          </View>
        </View>

        {/* Background Color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background Color</Text>
          <View style={styles.colorGrid}>
            <TouchableOpacity
              style={[
                styles.colorButton,
                styles.transparentButton,
                (localStyle.backgroundColor === 'transparent' || !localStyle.backgroundColor) && styles.selectedColor,
              ]}
              onPress={() => handleStyleUpdate({ backgroundColor: 'transparent' })}
            >
              <Text style={styles.transparentText}>None</Text>
            </TouchableOpacity>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  localStyle.backgroundColor === color && styles.selectedColor,
                ]}
                onPress={() => handleStyleUpdate({ backgroundColor: color })}
              />
            ))}
          </View>
        </View>

        {/* Font Weight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Font Weight</Text>
          <View style={styles.horizontalOptions}>
            {['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map((weight) => (
              <TouchableOpacity
                key={weight}
                style={[
                  styles.weightButton,
                  localStyle.fontWeight === weight && styles.activeButton,
                ]}
                onPress={() => handleStyleUpdate({ fontWeight: weight })}
              >
                <Text
                  style={[
                    styles.weightButtonText,
                    { fontWeight: weight as any },
                    localStyle.fontWeight === weight && styles.activeButtonText,
                  ]}
                >
                  {weight === 'normal' ? 'Normal' : weight === 'bold' ? 'Bold' : weight}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text Alignment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Alignment</Text>
          <View style={styles.horizontalOptions}>
            {[
              { value: 'left', icon: 'chevron.left' as const },
              { value: 'center', icon: 'circle' as const },
              { value: 'right', icon: 'chevron.right' as const },
              { value: 'justify', icon: 'line.horizontal.3' as const },
            ].map((align) => (
              <TouchableOpacity
                key={align.value}
                style={[
                  styles.alignButton,
                  localStyle.textAlign === align.value && styles.activeButton,
                ]}
                onPress={() => handleStyleUpdate({ textAlign: align.value as any })}
              >
                <IconSymbol 
                  name={align.icon} 
                  size={20} 
                  color={localStyle.textAlign === align.value ? Colors.dark.background : Colors.dark.text} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text Style Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Style</Text>
          
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Italic</Text>
            <Switch
              value={localStyle.fontStyle === 'italic'}
              onValueChange={(value) => handleStyleUpdate({ fontStyle: value ? 'italic' : 'normal' })}
              trackColor={{ false: '#767577', true: Colors.dark.tint }}
              thumbColor={Colors.dark.background}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Underline</Text>
            <Switch
              value={localStyle.textDecorationLine === 'underline'}
              onValueChange={(value) => handleStyleUpdate({ textDecorationLine: value ? 'underline' : 'none' })}
              trackColor={{ false: '#767577', true: Colors.dark.tint }}
              thumbColor={Colors.dark.background}
            />
          </View>
        </View>

        {/* Padding */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Padding</Text>
          <View style={styles.horizontalOptions}>
            {[0, 4, 8, 12, 16, 20, 24].map((padding) => (
              <TouchableOpacity
                key={padding}
                style={[
                  styles.paddingButton,
                  localStyle.padding === padding && styles.activeButton,
                ]}
                onPress={() => handleStyleUpdate({ padding })}
              >
                <Text
                  style={[
                    styles.paddingButtonText,
                    localStyle.padding === padding && styles.activeButtonText,
                  ]}
                >
                  {padding}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Opacity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opacity</Text>
          <View style={styles.horizontalOptions}>
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity) => (
              <TouchableOpacity
                key={opacity}
                style={[
                  styles.opacityButton,
                  (localStyle.opacity || 1) === opacity && styles.activeButton,
                ]}
                onPress={() => handleStyleUpdate({ opacity })}
              >
                <Text
                  style={[
                    styles.opacityButtonText,
                    (localStyle.opacity || 1) === opacity && styles.activeButtonText,
                  ]}
                >
                  {Math.round(opacity * 100)}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    color: Colors.dark.text,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  horizontalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: Colors.dark.tint,
    borderWidth: 3,
  },
  transparentButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparentText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '600',
  },
  sizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  sizeButtonText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  fontButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    maxWidth: 120,
  },
  fontButtonText: {
    color: Colors.dark.text,
    fontSize: 12,
  },
  weightButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  weightButtonText: {
    color: Colors.dark.text,
    fontSize: 12,
  },
  alignButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paddingButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  paddingButtonText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  opacityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  opacityButtonText: {
    color: Colors.dark.text,
    fontSize: 12,
  },
  activeButton: {
    backgroundColor: Colors.dark.tint,
  },
  activeButtonText: {
    color: Colors.dark.background,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    color: Colors.dark.text,
    fontSize: 16,
  },
});

export default TextStyleEditor;
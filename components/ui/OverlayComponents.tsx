import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Overlay, OverlayType } from '@/types/overlay';
import { ColorPicker } from './SettingsComponents';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface OverlayTypeCardProps {
  type: OverlayType;
  iconName: string;
  title: string;
  description: string;
  onPress: () => void;
  selected?: boolean;
  responsive: any;
}

export const OverlayTypeCard: React.FC<OverlayTypeCardProps> = ({
  type,
  iconName,
  title,
  description,
  onPress,
  selected = false,
  responsive,
}) => {
  const styles = createResponsiveStyles(responsive);
  
  return (
    <TouchableOpacity
      style={[styles.typeCard, selected && styles.typeCardSelected]}
      onPress={onPress}
    >
      <IconSymbol name={iconName} size={responsive.layout.iconSize.large} color={Colors.dark.tint} style={styles.typeIcon} />
      <Text style={styles.typeTitle}>{title}</Text>
      <Text style={styles.typeDescription}>{description}</Text>
    </TouchableOpacity>
  );
};

interface OverlayPreviewProps {
  overlays: Overlay[];
  selectedId: string | null;
  onSelectOverlay: (id: string) => void;
  responsive: any;
}

export const OverlayPreview: React.FC<OverlayPreviewProps> = ({
  overlays,
  selectedId,
  onSelectOverlay,
  responsive,
}) => {
  const styles = createResponsiveStyles(responsive);
  
  return (
    <View style={styles.previewContainer}>
      <Text style={styles.previewTitle}>Live Preview</Text>
      <View style={styles.previewScreen}>
        <Image
          source={{ uri: 'https://via.placeholder.com/800x450/1a1a2e/666666?text=Stream+Preview' }}
          style={styles.previewBackground}
          resizeMode="cover"
        />
        {overlays.map((overlay) => {
          if (!overlay.enabled) return null;
          
          const overlayStyle = {
            position: 'absolute' as const,
            left: `${overlay.position.x}%`,
            top: `${overlay.position.y}%`,
            width: overlay.size.width,
            height: overlay.size.height,
            zIndex: overlay.zIndex,
          };

          return (
            <TouchableOpacity
              key={overlay.id}
              style={[
                overlayStyle,
                styles.overlayItem,
                selectedId === overlay.id && styles.overlayItemSelected,
              ]}
              onPress={() => onSelectOverlay(overlay.id)}
            >
              {overlay.type === 'text' && (
                <Text
                  style={{
                    color: overlay.style.color,
                    fontSize: overlay.style.fontSize,
                    fontFamily: overlay.style.fontFamily,
                    backgroundColor: overlay.style.backgroundColor,
                    padding: overlay.style.padding,
                  }}
                >
                  {overlay.content}
                </Text>
              )}
              {overlay.type === 'image' && (
                <Image
                  source={{ uri: overlay.url }}
                  style={{ width: '100%', height: '100%', opacity: overlay.opacity }}
                  resizeMode="contain"
                />
              )}
              {(overlay.type === 'web' || overlay.type === 'video') && (
                <View style={styles.placeholderOverlay}>
                  <IconSymbol 
                    name={overlay.type === 'web' ? 'globe' : 'play.rectangle.fill'} 
                    size={responsive.layout.iconSize.medium} 
                    color={Colors.dark.text} 
                  />
                  <Text style={styles.placeholderText}>{overlay.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

interface OverlayListItemProps {
  overlay: Overlay;
  selected: boolean;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
  responsive: any;
}

export const OverlayListItem: React.FC<OverlayListItemProps> = ({
  overlay,
  selected,
  onPress,
  onToggle,
  onDelete,
  responsive,
}) => {
  const styles = createResponsiveStyles(responsive);
  
  const getIconName = () => {
    switch (overlay.type) {
      case 'text': return 'text.alignleft';
      case 'image': return 'photo.fill';
      case 'web': return 'globe';
      case 'video': return 'play.rectangle.fill';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.listItem, selected && styles.listItemSelected]}
      onPress={onPress}
    >
      <IconSymbol name={getIconName()} size={responsive.layout.iconSize.medium} color={Colors.dark.tint} style={styles.listIcon} />
      <View style={styles.listContent}>
        <Text style={styles.listTitle}>{overlay.name}</Text>
        <Text style={styles.listSubtitle}>
          Position: {Math.round(overlay.position.x)}, {Math.round(overlay.position.y)}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.toggleButton, overlay.enabled && styles.toggleButtonActive]}
        onPress={onToggle}
      >
        <Text style={styles.toggleText}>{overlay.enabled ? 'ON' : 'OFF'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <IconSymbol name="trash" size={responsive.layout.iconSize.small} color="#ff4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

interface PositionControlProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  responsive: any;
}

export const PositionControl: React.FC<PositionControlProps> = ({
  position,
  size,
  onPositionChange,
  onSizeChange,
  responsive,
}) => {
  const styles = createResponsiveStyles(responsive);
  
  return (
    <View style={styles.positionContainer}>
      <Text style={styles.sectionTitle}>Position & Size</Text>
      <View style={styles.positionRow}>
        <View style={styles.positionInput}>
          <Text style={styles.inputLabel}>X</Text>
          <TextInput
            style={styles.numberInput}
            value={String(Math.round(position.x))}
            onChangeText={(text) => {
              const x = parseInt(text) || 0;
              onPositionChange({ ...position, x: Math.min(100, Math.max(0, x)) });
            }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.dark.tabIconDefault}
          />
          <Text style={styles.inputUnit}>%</Text>
        </View>
        <View style={styles.positionInput}>
          <Text style={styles.inputLabel}>Y</Text>
          <TextInput
            style={styles.numberInput}
            value={String(Math.round(position.y))}
            onChangeText={(text) => {
              const y = parseInt(text) || 0;
              onPositionChange({ ...position, y: Math.min(100, Math.max(0, y)) });
            }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.dark.tabIconDefault}
          />
          <Text style={styles.inputUnit}>%</Text>
        </View>
      </View>
      <View style={styles.positionRow}>
        <View style={styles.positionInput}>
          <Text style={styles.inputLabel}>Width</Text>
          <TextInput
            style={styles.numberInput}
            value={String(size.width)}
            onChangeText={(text) => {
              const width = parseInt(text) || 100;
              onSizeChange({ ...size, width });
            }}
            keyboardType="numeric"
            placeholder="100"
            placeholderTextColor={Colors.dark.tabIconDefault}
          />
          <Text style={styles.inputUnit}>px</Text>
        </View>
        <View style={styles.positionInput}>
          <Text style={styles.inputLabel}>Height</Text>
          <TextInput
            style={styles.numberInput}
            value={String(size.height)}
            onChangeText={(text) => {
              const height = parseInt(text) || 100;
              onSizeChange({ ...size, height });
            }}
            keyboardType="numeric"
            placeholder="100"
            placeholderTextColor={Colors.dark.tabIconDefault}
          />
          <Text style={styles.inputUnit}>px</Text>
        </View>
      </View>
    </View>
  );
};

interface TextStyleEditorProps {
  style: {
    color: string;
    fontSize: number;
    fontFamily: string;
    backgroundColor?: string;
    padding?: number;
  };
  content: string;
  onStyleChange: (style: any) => void;
  onContentChange: (content: string) => void;
  responsive: any;
}

export const TextStyleEditor: React.FC<TextStyleEditorProps> = ({
  style,
  content,
  onStyleChange,
  onContentChange,
  responsive,
}) => {
  const styles = createResponsiveStyles(responsive);
  
  return (
    <View style={styles.editorSection}>
      <Text style={styles.sectionTitle}>Text Content</Text>
      <TextInput
        style={styles.textContentInput}
        value={content}
        onChangeText={onContentChange}
        placeholder="Enter overlay text..."
        placeholderTextColor={Colors.dark.tabIconDefault}
        multiline
      />
      
      <ColorPicker
        label="Text Color"
        value={style.color}
        onValueChange={(color) => onStyleChange({ ...style, color })}
      />
      
      <View style={styles.fontSizeContainer}>
        <Text style={styles.inputLabel}>Font Size</Text>
        <TextInput
          style={styles.numberInput}
          value={String(style.fontSize)}
          onChangeText={(text) => {
            const fontSize = parseInt(text) || 16;
            onStyleChange({ ...style, fontSize });
          }}
          keyboardType="numeric"
          placeholder="16"
          placeholderTextColor={Colors.dark.tabIconDefault}
        />
        <Text style={styles.inputUnit}>px</Text>
      </View>
    </View>
  );
};

const createResponsiveStyles = (responsive: any) => StyleSheet.create({
  typeCard: {
    backgroundColor: Colors.dark.surface,
    padding: responsive.layout.cardPadding,
    borderRadius: 12,
    alignItems: 'center',
    width: responsive.isTablet ? '22%' : '48%',
    marginBottom: responsive.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: responsive.isTablet ? 140 : 120,
  },
  typeCardSelected: {
    borderColor: Colors.dark.tint,
  },
  typeIcon: {
    marginBottom: responsive.spacing.sm,
  },
  typeTitle: {
    color: Colors.dark.text,
    fontSize: responsive.typography.body,
    fontWeight: '600',
    marginBottom: responsive.spacing.xs,
    textAlign: 'center',
  },
  typeDescription: {
    color: Colors.dark.tabIconDefault,
    fontSize: responsive.typography.caption,
    textAlign: 'center',
  },
  previewContainer: {
    marginBottom: responsive.spacing.xl,
  },
  previewTitle: {
    color: Colors.dark.text,
    fontSize: responsive.typography.heading,
    fontWeight: '600',
    marginBottom: responsive.spacing.sm,
  },
  previewScreen: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    position: 'relative',
    minHeight: responsive.isTablet ? 300 : 200,
  },
  previewBackground: {
    width: '100%',
    height: '100%',
  },
  overlayItem: {
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 50,
    minHeight: 30,
  },
  overlayItemSelected: {
    borderColor: Colors.dark.tint,
    borderStyle: 'dashed',
  },
  placeholderOverlay: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    gap: responsive.spacing.xs,
  },
  placeholderText: {
    color: Colors.dark.text,
    fontSize: responsive.typography.caption,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    padding: responsive.layout.cardPadding,
    borderRadius: 12,
    marginBottom: responsive.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: responsive.layout.buttonHeight + 20,
  },
  listItemSelected: {
    borderColor: Colors.dark.tint,
  },
  listIcon: {
    marginRight: responsive.spacing.sm,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    color: Colors.dark.text,
    fontSize: responsive.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  listSubtitle: {
    color: Colors.dark.tabIconDefault,
    fontSize: responsive.typography.caption,
  },
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: responsive.spacing.sm,
    paddingVertical: responsive.spacing.xs,
    borderRadius: 16,
    marginRight: responsive.spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: Colors.dark.tint,
  },
  toggleText: {
    color: Colors.dark.text,
    fontSize: responsive.typography.caption,
    fontWeight: '600',
  },
  deleteButton: {
    padding: responsive.spacing.xs,
  },
  positionContainer: {
    marginBottom: responsive.spacing.xl,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: responsive.typography.heading,
    fontWeight: '600',
    marginBottom: responsive.spacing.md,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsive.spacing.md,
  },
  positionInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    paddingHorizontal: responsive.spacing.sm,
    width: '48%',
  },
  inputLabel: {
    color: Colors.dark.tabIconDefault,
    fontSize: responsive.typography.caption,
    marginRight: responsive.spacing.xs,
  },
  numberInput: {
    color: Colors.dark.text,
    fontSize: responsive.typography.body,
    flex: 1,
    paddingVertical: responsive.spacing.sm,
    textAlign: 'center',
  },
  inputUnit: {
    color: Colors.dark.tabIconDefault,
    fontSize: responsive.typography.caption,
    marginLeft: responsive.spacing.xs,
  },
  editorSection: {
    marginBottom: responsive.spacing.xl,
  },
  textContentInput: {
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text,
    padding: responsive.spacing.md,
    borderRadius: 12,
    fontSize: responsive.typography.body,
    minHeight: responsive.isTablet ? 120 : 100,
    textAlignVertical: 'top',
    marginBottom: responsive.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
    padding?: number;
  };
  content: string;
  onStyleChange: (style: any) => void;
  onContentChange: (content: string) => void;
  responsive: any;
}

export const TextStyleEditor: React.FC<TextStyleEditorProps> = ({
  style,
  content,
  onStyleChange,
  onContentChange,
  responsive,
}) => {
  const styles = createResponsiveStyles(responsive);
  
  return (
    <View style={styles.editorSection}>
      <Text style={styles.sectionTitle}>Text Content</Text>
      <TextInput
        style={styles.textContentInput}
        value={content}
        onChangeText={onContentChange}
        placeholder="Enter overlay text..."
        placeholderTextColor={Colors.dark.tabIconDefault}
        multiline
      />
      
      <ColorPicker
        label="Text Color"
        value={style.color}
        onValueChange={(color) => onStyleChange({ ...style, color })}
      />
      
      <View style={styles.fontSizeContainer}>
        <Text style={styles.inputLabel}>Font Size</Text>
        <TextInput
          style={styles.numberInput}
          value={String(style.fontSize)}
          onChangeText={(text) => {
            const fontSize = parseInt(text) || 16;
            onStyleChange({ ...style, fontSize });
          }}
          keyboardType="numeric"
          placeholder="16"
          placeholderTextColor={Colors.dark.tabIconDefault}
        />
        <Text style={styles.inputUnit}>px</Text>
      </View>
    </View>
  );
};

const createResponsiveStyles = (responsive: any) => StyleSheet.create({
  typeCard: {
    backgroundColor: Colors.dark.surface,
    padding: responsive.layout.cardPadding,
    borderRadius: 12,
    alignItems: 'center',
    width: responsive.isTablet ? '22%' : '48%',
    marginBottom: responsive.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: responsive.isTablet ? 140 : 120,
  },
  typeCardSelected: {
    borderColor: Colors.dark.tint,
  },
  typeIcon: {
    marginBottom: responsive.spacing.sm,
  },
  typeTitle: {
    color: Colors.dark.text,
    fontSize: responsive.typography.body,
    fontWeight: '600',
    marginBottom: responsive.spacing.xs,
    textAlign: 'center',
  },
  typeDescription: {
    color: Colors.dark.tabIconDefault,
    fontSize: responsive.typography.caption,
    textAlign: 'center',
  },
  previewContainer: {
    marginBottom: responsive.spacing.xl,
  },
  previewTitle: {
    color: Colors.dark.text,
    fontSize: responsive.typography.heading,
    fontWeight: '600',
    marginBottom: responsive.spacing.sm,
  },
  previewScreen: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    position: 'relative',
    minHeight: responsive.isTablet ? 300 : 200,
  },
  previewBackground: {
    width: '100%',
    height: '100%',
  },
  overlayItem: {
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 50,
    minHeight: 30,
  },
  overlayItemSelected: {
    borderColor: Colors.dark.tint,
    borderStyle: 'dashed',
  },
  placeholderOverlay: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    gap: responsive.spacing.xs,
  },
  placeholderText: {
    color: Colors.dark.text,
    fontSize: responsive.typography.caption,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    padding: responsive.layout.cardPadding,
    borderRadius: 12,
    marginBottom: responsive.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: responsive.layout.buttonHeight + 20,
  },
  listItemSelected: {
    borderColor: Colors.dark.tint,
  },
  listIcon: {
    marginRight: responsive.spacing.sm,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    color: Colors.dark.text,
    fontSize: responsive.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  listSubtitle: {
    color: Colors.dark.tabIconDefault,
    fontSize: responsive.typography.caption,
  },
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: responsive.spacing.sm,
    paddingVertical: responsive.spacing.xs,
    borderRadius: 16,
    marginRight: responsive.spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: Colors.dark.tint,
  },
  toggleText: {
    color: Colors.dark.text,
    fontSize: responsive.typography.caption,
    fontWeight: '600',
  },
  deleteButton: {
    padding: responsive.spacing.xs,
  },
  positionContainer: {
    marginBottom: responsive.spacing.xl,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: responsive.typography.heading,
    fontWeight: '600',
    marginBottom: responsive.spacing.md,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsive.spacing.md,
  },
  positionInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    paddingHorizontal: responsive.spacing.sm,
    width: '48%',
  },
  inputLabel: {
    color: Colors.dark.tabIconDefault,
    fontSize: responsive.typography.caption,
    marginRight: responsive.spacing.xs,
  },
  numberInput: {
    color: Colors.dark.text,
    fontSize: responsive.typography.body,
    flex: 1,
    paddingVertical: responsive.spacing.sm,
    textAlign: 'center',
  },
  inputUnit: {
    color: Colors.dark.tabIconDefault,
    fontSize: responsive.typography.caption,
    marginLeft: responsive.spacing.xs,
  },
  editorSection: {
    marginBottom: responsive.spacing.xl,
  },
  textContentInput: {
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text,
    padding: responsive.spacing.md,
    borderRadius: 12,
    fontSize: responsive.typography.body,
    minHeight: responsive.isTablet ? 120 : 100,
    textAlignVertical: 'top',
    marginBottom: responsive.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fontSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    paddingHorizontal: responsive.spacing.sm,
    marginTop: responsive.spacing.md,
  },
});
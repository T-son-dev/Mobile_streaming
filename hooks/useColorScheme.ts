import { IconSymbol } from '@/components/ui/IconSymbol';
import { PlatformIcon, PlatformType } from '@/components/ui/PlatformIcon';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import {
  SettingIcon,
  UserIcon,
  ReplayIcon,
  CropIcon,
} from '@/components/icons';

// Colors matching the Portuguese design
const Colors = {
  background: '#1a1a2e',
  surface: '#2a2a3e',
  primary: '#00ff88',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  danger: '#ff4757',
  border: '#404040',
};
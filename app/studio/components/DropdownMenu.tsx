import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DropdownOption {
  id: string;
  label: string;
  icon: string;
  color?: string;
  onPress: () => void;
}

interface DropdownMenuProps {
  options: DropdownOption[];
  triggerComponent?: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  options,
  triggerComponent,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);

  const handleOptionPress = (option: DropdownOption) => {
    setIsVisible(false);
    option.onPress();
  };

  const handleTriggerPress = (e: any) => {
    e.stopPropagation();

    // Measure the trigger button position
    if (triggerRef.current) {
      triggerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTriggerLayout({ x: pageX, y: pageY, width, height });
        setIsVisible(true);
      });
    }
  };

  const defaultTrigger = (
    <TouchableOpacity
      ref={triggerRef}
      onPress={handleTriggerPress}
      style={styles.triggerButton}
    >
      <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const screenWidth = Dimensions.get('window').width;
  const dropdownWidth = 150;

  // Calculate dropdown position
  const dropdownLeft = Math.min(
    triggerLayout.x,
    screenWidth - dropdownWidth - 16 // 16px margin from screen edge
  );

  const dropdownTop = triggerLayout.y + triggerLayout.height + 4; // 4px gap below trigger

  return (
    <>
      {triggerComponent ? (
        <TouchableOpacity
          ref={triggerRef}
          onPress={handleTriggerPress}
          style={styles.customTriggerContainer}
        >
          {triggerComponent}
        </TouchableOpacity>
      ) : (
        defaultTrigger
      )}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setIsVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                position: 'absolute',
                left: dropdownLeft,
                top: dropdownTop,
                width: dropdownWidth,
              }
            ]}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  index === options.length - 1 && styles.lastOption,
                ]}
                onPress={() => handleOptionPress(option)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={option.color || '#FFFFFF'}
                  style={styles.optionIcon}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: option.color || '#FFFFFF' },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    padding: 8,
     // Black background for trigger button
    borderRadius: 4,
  },
  customTriggerContainer: {
    // Black background for custom trigger
    borderRadius: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Lighter overlay
  },
  dropdown: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#374151',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DropdownMenu;
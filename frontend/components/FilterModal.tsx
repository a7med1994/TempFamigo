import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/DarkAirbnbTheme';
import { CATEGORIES, AGE_RANGES, PRICE_TYPES } from '../constants/Categories';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  categories: string[];
  ageRanges: string[];
  priceTypes: string[];
  weatherFriendly?: boolean;
  specialNeeds?: boolean;
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters?.categories || []
  );
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>(
    initialFilters?.ageRanges || []
  );
  const [selectedPriceTypes, setSelectedPriceTypes] = useState<string[]>(
    initialFilters?.priceTypes || []
  );
  const [weatherFriendly, setWeatherFriendly] = useState(
    initialFilters?.weatherFriendly || false
  );
  const [specialNeeds, setSpecialNeeds] = useState(
    initialFilters?.specialNeeds || false
  );

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const toggleAgeRange = (ageId: string) => {
    if (selectedAgeRanges.includes(ageId)) {
      setSelectedAgeRanges(selectedAgeRanges.filter((id) => id !== ageId));
    } else {
      setSelectedAgeRanges([...selectedAgeRanges, ageId]);
    }
  };

  const togglePriceType = (priceId: string) => {
    if (selectedPriceTypes.includes(priceId)) {
      setSelectedPriceTypes(selectedPriceTypes.filter((id) => id !== priceId));
    } else {
      setSelectedPriceTypes([...selectedPriceTypes, priceId]);
    }
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedAgeRanges([]);
    setSelectedPriceTypes([]);
    setWeatherFriendly(false);
    setSpecialNeeds(false);
  };

  const handleApply = () => {
    onApply({
      categories: selectedCategories,
      ageRanges: selectedAgeRanges,
      priceTypes: selectedPriceTypes,
      weatherFriendly,
      specialNeeds,
    });
    onClose();
  };

  const filterCount =
    selectedCategories.length +
    selectedAgeRanges.length +
    selectedPriceTypes.length +
    (weatherFriendly ? 1 : 0) +
    (specialNeeds ? 1 : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.optionsGrid}>
              {CATEGORIES.filter((cat) => cat.id !== 'all').map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.optionChip,
                      isSelected && styles.optionChipSelected,
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={20}
                      color={isSelected ? Colors.backgroundCard : Colors.textDark}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={Colors.backgroundCard}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Age Ranges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Age Range</Text>
            <View style={styles.optionsRow}>
              {AGE_RANGES.map((age) => {
                const isSelected = selectedAgeRanges.includes(age.id);
                return (
                  <TouchableOpacity
                    key={age.id}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    onPress={() => toggleAgeRange(age.id)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        isSelected && styles.optionButtonTextSelected,
                      ]}
                    >
                      {age.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Price */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price</Text>
            <View style={styles.optionsRow}>
              {PRICE_TYPES.map((price) => {
                const isSelected = selectedPriceTypes.includes(price.id);
                return (
                  <TouchableOpacity
                    key={price.id}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    onPress={() => togglePriceType(price.id)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        isSelected && styles.optionButtonTextSelected,
                      ]}
                    >
                      {price.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Additional Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Filters</Text>
            
            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => setWeatherFriendly(!weatherFriendly)}
            >
              <View style={styles.toggleLeft}>
                <Ionicons name="cloudy" size={24} color={Colors.textDark} />
                <Text style={styles.toggleText}>All-Weather Friendly</Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  weatherFriendly && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    weatherFriendly && styles.toggleCircleActive,
                  ]}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => setSpecialNeeds(!specialNeeds)}
            >
              <View style={styles.toggleLeft}>
                <Ionicons name="accessibility" size={24} color={Colors.textDark} />
                <Text style={styles.toggleText}>Special Needs Friendly</Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  specialNeeds && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    specialNeeds && styles.toggleCircleActive,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>
              Show results {filterCount > 0 && `(${filterCount} filters)`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Platform.select({
      ios: {
        paddingTop: 60,
      },
    }),
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h3,
  },
  clearText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  optionChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: Colors.backgroundCard,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  optionButtonTextSelected: {
    color: Colors.backgroundCard,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  toggleText: {
    ...Typography.body,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyButton: {
    backgroundColor: Colors.textDark,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  applyButtonText: {
    ...Typography.button,
    color: Colors.backgroundCard,
  },
});
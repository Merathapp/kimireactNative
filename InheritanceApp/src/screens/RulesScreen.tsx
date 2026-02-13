import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  List,
  Surface,
  DataTable
} from 'react-native-paper';
import { FIQH_DATABASE, MadhabType } from '../constants/FiqhDatabase';
import { colors } from '../constants/colors';

const madhabs: MadhabType[] = ['shafii', 'hanafi', 'maliki', 'hanbali'];

const specialCases = [
  {
    name: 'العُمَريَّتان',
    description: 'زوج/زوجة + أب + أم بدون فرع وارث. الأم تأخذ ثلث الباقي بعد فرض الزوج/الزوجة.',
    color: colors.warning
  },
  {
    name: 'العَوْل',
    description: 'عندما يزيد مجموع الفروض عن أصل المسألة، يُزاد المقام ليتسع للجميع.',
    color: colors.primary[500]
  },
  {
    name: 'الرَّد',
    description: 'عندما يبقى فائض ولا يوجد عصبة، يُرد على أصحاب الفروض بنسبة فروضهم.',
    color: colors.success
  },
  {
    name: 'المشتركة (الحمارية)',
    description: 'زوج + أم/جدة + إخوة لأم (2+) + إخوة أشقاء. الإخوة الأشقاء يشتركون مع الإخوة لأم.',
    color: colors.secondary[500]
  },
  {
    name: 'الأكدرية',
    description: 'زوج + أم + جد + أخت شقيقة. تُجمع وتُقسم بطريقة خاصة.',
    color: colors.info
  },
  {
    name: 'عصبة مع الغير',
    description: 'الأخت الشقيقة أو لأب مع البنت أو بنت الابن تصبح عصبة.',
    color: colors.error
  }
];

const fardTable = [
  { fraction: 'النصف (½)', heirs: 'البنت الواحدة، بنت الابن الواحدة، الأخت الشقيقة الواحدة، الأخت لأب الواحدة، الزوج بدون فرع' },
  { fraction: 'الربع (¼)', heirs: 'الزوج مع الفرع، الزوجة بدون فرع' },
  { fraction: 'الثمن (⅛)', heirs: 'الزوجة مع الفرع الوارث' },
  { fraction: 'الثلثان (⅔)', heirs: 'البنتان فأكثر، بنتا الابن فأكثر، الأختان الشقيقتان فأكثر، الأختان لأب فأكثر' },
  { fraction: 'الثلث (⅓)', heirs: 'الأم بدون فرع وجمع إخوة، الإخوة لأم (2 فأكثر)' },
  { fraction: 'السدس (⅙)', heirs: 'الأب مع الفرع، الأم مع الفرع أو جمع الإخوة، الجد، الجدة، بنت الابن تكملة، الأخت لأب تكملة، الأخ لأم الواحد' }
];

const hijabTable = [
  { blocked: 'الجد', blocker: 'الأب', type: 'حجب حرمان' },
  { blocked: 'الجدة لأب', blocker: 'الأم أو الأب', type: 'حجب حرمان' },
  { blocked: 'الجدة لأم', blocker: 'الأم', type: 'حجب حرمان' },
  { blocked: 'ابن الابن', blocker: 'الابن', type: 'حجب حرمان' },
  { blocked: 'بنت الابن', blocker: 'الابن، أو بنتان بدون معصب', type: 'حجب حرمان' },
  { blocked: 'الإخوة الأشقاء', blocker: 'الابن، ابن الابن، الأب', type: 'حجب حرمان' },
  { blocked: 'الإخوة لأب', blocker: 'الأخ الشقيق، أو من يحجب الأشقاء', type: 'حجب حرمان' },
  { blocked: 'الإخوة لأم', blocker: 'الفرع الوارث، الأب، الجد', type: 'حجب حرمان' }
];

const RulesScreen: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          📚 القواعد الفقهية
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          قواعد وأسس حساب المواريث
        </Text>
      </Surface>

      {/* Madhab Rules */}
      <Card style={styles.card}>
        <Card.Title title="قواعد المذاهب الأربعة" />
        <Card.Content>
          <View style={styles.madhabGrid}>
            {madhabs.map(madhab => {
              const config = FIQH_DATABASE.madhabs[madhab];
              return (
                <Surface
                  key={madhab}
                  style={[
                    styles.madhabCard,
                    { borderColor: config.color }
                  ]}
                >
                  <Text style={[styles.madhabTitle, { color: config.color }]}>
                    {config.icon} {config.name}
                  </Text>
                  <Text style={styles.madhabDesc}>
                    {config.description}
                  </Text>
                </Surface>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      {/* Special Cases */}
      <Card style={styles.card}>
        <Card.Title title="⚡ الحالات الخاصة المدعومة" />
        <Card.Content>
          {specialCases.map((c, index) => (
            <Surface
              key={index}
              style={[styles.specialCase, { borderLeftColor: c.color }]}
            >
              <Text style={[styles.specialCaseTitle, { color: c.color }]}>
                {c.name}
              </Text>
              <Text style={styles.specialCaseDesc}>{c.description}</Text>
            </Surface>
          ))}
        </Card.Content>
      </Card>

      {/* Fard Table */}
      <Card style={styles.card}>
        <Card.Title title="📊 جدول الفروض المقدرة" />
        <Card.Content>
          <ScrollView horizontal>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={styles.fardColumn}>الفرض</DataTable.Title>
                <DataTable.Title style={styles.heirsColumn}>أصحابه</DataTable.Title>
              </DataTable.Header>
              {fardTable.map((row, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell style={styles.fardColumn}>
                    <Text style={styles.fractionText}>{row.fraction}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.heirsColumn}>
                    <Text style={styles.heirsText}>{row.heirs}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Hijab Rules */}
      <Card style={styles.card}>
        <Card.Title title="🚫 قواعد الحجب" />
        <Card.Content>
          <ScrollView horizontal>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={styles.hijabColumn}>المحجوب</DataTable.Title>
                <DataTable.Title style={styles.hijabColumn}>الحاجب</DataTable.Title>
                <DataTable.Title style={styles.hijabColumn}>نوع الحجب</DataTable.Title>
              </DataTable.Header>
              {hijabTable.map((row, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell style={styles.hijabColumn}>
                    <Text style={styles.blockedText}>{row.blocked}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.hijabColumn}>
                    <Text style={styles.blockerText}>{row.blocker}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.hijabColumn}>
                    <Text style={styles.hijabTypeText}>{row.type}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Inheritance Order */}
      <Card style={styles.card}>
        <Card.Title title="📋 ترتيب الورثة" />
        <Card.Content>
          <List.Section>
            <List.Accordion
              title="1. أصحاب الفروض"
              expanded={expandedSection === 'fard'}
              onPress={() => toggleSection('fard')}
            >
              <Text style={styles.accordionContent}>
                الزوج/الزوجة، الأب، الأم، الجد/الجدات، البنات/بنات الابن، الأخوات الشقيقات/لأب، الإخوة لأم
              </Text>
            </List.Accordion>
            <List.Accordion
              title="2. العصبات"
              expanded={expandedSection === 'asaba'}
              onPress={() => toggleSection('asaba')}
            >
              <Text style={styles.accordionContent}>
                الابن/ابن الابن (بالنفس)، الأب/الجد (بالنفس)، الإخوة الأشقاء/لأب (بالنفس)،
                الأخوات (مع الغير)، أبناء الإخوة، الأعمام، أبناء الأعمام
              </Text>
            </List.Accordion>
            <List.Accordion
              title="3. ذوو الأرحام"
              expanded={expandedSection === 'blood'}
              onPress={() => toggleSection('blood')}
            >
              <Text style={styles.accordionContent}>
                أولاد البنات (صنف 1)، أولاد الأخوات (صنف 2)، الأخوال والخالات (صنف 3)، العمات (صنف 4)
              </Text>
            </List.Accordion>
          </List.Section>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary
  },
  header: {
    padding: 20,
    backgroundColor: colors.neutral[800]
  },
  headerTitle: {
    color: colors.text.inverse,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  headerSubtitle: {
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 4
  },
  card: {
    margin: 12,
    borderRadius: 12,
    backgroundColor: colors.background.primary
  },
  madhabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  madhabCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    backgroundColor: colors.background.secondary
  },
  madhabTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4
  },
  madhabDesc: {
    fontSize: 11,
    color: colors.text.secondary
  },
  specialCase: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    marginVertical: 6,
    borderLeftWidth: 4
  },
  specialCaseTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4
  },
  specialCaseDesc: {
    fontSize: 12,
    color: colors.text.secondary
  },
  fardColumn: {
    minWidth: 100
  },
  heirsColumn: {
    minWidth: 250
  },
  fractionText: {
    fontWeight: 'bold',
    color: colors.text.primary
  },
  heirsText: {
    fontSize: 12,
    color: colors.text.secondary
  },
  hijabColumn: {
    minWidth: 120
  },
  blockedText: {
    color: colors.error
  },
  blockerText: {
    color: colors.success
  },
  hijabTypeText: {
    color: colors.text.tertiary,
    fontSize: 12
  },
  accordionContent: {
    padding: 12,
    color: colors.text.secondary,
    fontSize: 13,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8
  },
  bottomPadding: {
    height: 40
  }
});

export default RulesScreen;

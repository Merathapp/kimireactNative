import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  List,
  Surface,
  DataTable
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
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

const RulesScreen: React.FC = () => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const hijabTable = [
    { blocked: t('rulesHijabBlockedGrandfather'), blocker: t('rulesHijabBlockerFather'), type: t('rulesHijabType') },
    { blocked: t('rulesHijabBlockedPaternalGrandmother'), blocker: t('rulesHijabBlockerMotherOrFather'), type: t('rulesHijabType') },
    { blocked: t('rulesHijabBlockedMaternalGrandmother'), blocker: t('rulesHijabBlockerMother'), type: t('rulesHijabType') },
    { blocked: t('rulesHijabBlockedSonsSon'), blocker: t('rulesHijabBlockerSon'), type: t('rulesHijabType') },
    { blocked: t('rulesHijabBlockedSonsDaughter'), blocker: t('rulesHijabBlockerSonOrTwoDaughters'), type: t('rulesHijabType') },
    { blocked: t('rulesHijabBlockedFullSiblings'), blocker: t('rulesHijabBlockerSonGrandsonFather'), type: t('rulesHijabType') },
    { blocked: t('rulesHijabBlockedPaternalSiblings'), blocker: t('rulesHijabBlockerFullBrother'), type: t('rulesHijabType') },
    { blocked: t('rulesHijabBlockedMaternalSiblings'), blocker: t('rulesHijabBlockerDescendantFatherGrandfather'), type: t('rulesHijabType') }
  ];

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {t('rulesTitle')}
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {t('rulesSubtitle')}
        </Text>
      </Surface>

      {/* Madhab Rules */}
      <Card style={styles.card}>
        <Card.Title title={t('rulesMadhabCardTitle')} />
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
        <Card.Title title={t('rulesSpecialCasesCardTitle')} />
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
        <Card.Title title={t('rulesFardTableCardTitle')} />
        <Card.Content>
          <ScrollView horizontal>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={styles.fardColumn}>{t('rulesFardColumnShare')}</DataTable.Title>
                <DataTable.Title style={styles.heirsColumn}>{t('rulesFardColumnHeirs')}</DataTable.Title>
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
        <Card.Title title={t('rulesHijabCardTitle')} />
        <Card.Content>
          <ScrollView horizontal>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={styles.hijabColumn}>{t('rulesHijabColumnBlocked')}</DataTable.Title>
                <DataTable.Title style={styles.hijabColumn}>{t('rulesHijabColumnBlocker')}</DataTable.Title>
                <DataTable.Title style={styles.hijabColumn}>{t('rulesHijabColumnType')}</DataTable.Title>
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
        <Card.Title title={t('rulesHeirOrderCardTitle')} />
        <Card.Content>
          <List.Section>
            <List.Accordion
              title={t('rulesAccordionFard')}
              expanded={expandedSection === 'fard'}
              onPress={() => toggleSection('fard')}
            >
              <Text style={styles.accordionContent}>
                {t('rulesAccordionFardContent')}
              </Text>
            </List.Accordion>
            <List.Accordion
              title={t('rulesAccordionAsaba')}
              expanded={expandedSection === 'asaba'}
              onPress={() => toggleSection('asaba')}
            >
              <Text style={styles.accordionContent}>
                {t('rulesAccordionAsabaContent')}
              </Text>
            </List.Accordion>
            <List.Accordion
              title={t('rulesAccordionBloodRelatives')}
              expanded={expandedSection === 'blood'}
              onPress={() => toggleSection('blood')}
            >
              <Text style={styles.accordionContent}>
                {t('rulesAccordionBloodRelativesContent')}
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
